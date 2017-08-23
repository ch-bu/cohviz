# encoding: utf-8

from django.db import models
from django.contrib.auth.models import User
from django.template.defaultfilters import slugify
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver
# from random import randint


class Experiment(models.Model):

    """
    Signature
            models.Model -> None
    Purpose
            Model for every Experiment created by
            a experimentar
    Args:
            models.Model
    """

    experimentator = models.ForeignKey(settings.AUTH_USER_MODEL,
                                       verbose_name='Experiment',
                                       on_delete=models.CASCADE)
    name = models.CharField(max_length=400)
    slug = models.SlugField(blank=True)
    date = models.DateField(auto_now_add=True)
    nr_measurements = models.PositiveSmallIntegerField(
        verbose_name='Repated Measures')
    nr_groups = models.PositiveSmallIntegerField(
        verbose_name='Number of Groups')
    master_pw = models.CharField(blank=True, max_length=200)

    def __str__(self):
        return (self.name).encode('ascii', errors='replace')

    def save(self, *args, **kwargs):
        """
        Automatically slugify name of experiment
        """

        self.slug = slugify(self.name)
        # self.experimentator = self.context['request'].user

        super(Experiment, self).save(*args, **kwargs)


class Group(models.Model):

    """
    Signature
            models.Model -> None
    Purpose
            Model for the groups
    Args
            models.Model
    """

    name = models.CharField(max_length=100)
    abbreviation = models.CharField(max_length=50)
    description = models.TextField()
    template = models.CharField(max_length=100)

    def __str__(self):
        return self.abbreviation


class CognitiveLoadDraft(models.Model):
  """
  Stores the cognitive load measure after the revision of the text.
  """

  experiment = models.ForeignKey('Experiment', verbose_name='Experiment',
    on_delete=models.CASCADE)
  subject = models.ForeignKey('Subject', verbose_name='Subject',
                              on_delete=models.CASCADE)
  measurement = models.PositiveSmallIntegerField()

  # Wie startk hast du dich gerade beim Verfassen des Entwurfs
  # angestrengt?
  # 1: Sehr stark angestrengt; 9: gar nicht angestrengt
  question1 = models.PositiveSmallIntegerField()

  # Wie schwierig war es für dich den Entwurf zu verfassen?
  # 1: Sehr schwierig, 9 gar nicht schwierig
  question2 = models.PositiveSmallIntegerField()

  # Wie überzeugend schätzt du deinen Entwurf ein?
  # 1. Sehr überzeugend; 5 gar nicht überzeugend
  question3 = models.PositiveSmallIntegerField()

  # Wie verständlich schätzt du deinen Entwurf?
  # 1: Sehr verständlich; 5 gar nicht verständlich
  question4 = models.PositiveSmallIntegerField()


class CognitiveLoadRevision(models.Model):
  """
  Stores the cognitive load measure after the revision of the text.
  """

  experiment = models.ForeignKey('Experiment', verbose_name='Experiment',
    on_delete=models.CASCADE)
  subject = models.ForeignKey('Subject', verbose_name='Subject',
                              on_delete=models.CASCADE)
  measurement = models.PositiveSmallIntegerField()

  # Wie startk hast du dich gerade bei der Überarbeitung des Entwurfs
  # angestrengt?
  # 1: Sehr stark angestrengt; 9: gar nicht angestrengt
  question1 = models.PositiveSmallIntegerField()

  # Wie schwierig war es für dich den Entwurf zu überarbeiten?
  # 1: Sehr schwierig, 9 gar nicht schwierig
  question2 = models.PositiveSmallIntegerField()

  # Wie überzeugend schätzt du deine überarbeitete Eroerterung ein?
  # 1. Sehr überzeugend; 5 gar nicht überzeugend
  question3 = models.PositiveSmallIntegerField()

  # Wie verständlich schätzt du überarbeitete Eroertung ein?
  # 1: Sehr verständlich; 5 gar nicht verständlich
  question4 = models.PositiveSmallIntegerField()


class Measurement(models.Model):

    """
    Stores the time of measurements for a specific
    group in a given experiment
    """

    experiment = models.ForeignKey('Experiment', verbose_name='Experiment',
                                   on_delete=models.CASCADE)
    group = models.ForeignKey('Group', verbose_name='Group',
                              on_delete=models.CASCADE)
    measure = models.PositiveSmallIntegerField()
    instruction = models.TextField(blank=True)
    instruction_strategies = models.TextField(blank=True)
    instruction_review = models.TextField(blank=True)
    publication = models.DateField()
    nr_group = models.PositiveSmallIntegerField(default=1)

    def __str__(self):
        return self.experiment.name + " - " + self.group.abbreviation + \
            " - Gruppe: " + str(self.nr_group) + \
            " - Measure: " + str(self.measure)


class Subject(models.Model):

    """
    Stores data of user
    """

    user = models.OneToOneField(User)
    experiment = models.ForeignKey(
        'Experiment', verbose_name='Experiment', on_delete=models.CASCADE)
    group = models.PositiveSmallIntegerField(blank=True)
    trusted = models.BooleanField(default=False)
    nr_measurements = models.PositiveSmallIntegerField(
        verbose_name='Number of Measurements', default=0)

    def __str__(self):
        return self.user.username + " - " + self.experiment.name

    def generate_user(self, username, password, experiment_id):
        """
        Generates a user
        """

        # Create new user instance
        user = User.objects.create_user(username=username,
                                        password=password)
        self.user = user

        # Get experiment for given subject
        self.experiment = Experiment.objects.get(id=experiment_id)

        # ---------------- Calculate most empty group --------------
        # Get all subjects of experiment
        subjects = Subject.objects.filter(experiment=self.experiment)

        # Get groups
        rangeGroups = range(1, self.experiment.nr_groups + 1)

        # Init empty dict
        myDict = {}

        # Feed dictionary with groups
        for i in rangeGroups:
            myDict[i] = 0

        # Calculate group distribution
        for subject in subjects:
            myDict[subject.group] += 1

        # Get most empty dict key
        group = min(myDict, key=myDict.get)
        #-----------------------------------------------------------

        # Assign group to subject
        # self.group = randint(1, self.experiment.nr_groups)
        self.group = group

        # Save subject
        self.save()


# http://stackoverflow.com/questions/12888318/deleting-files-associated-with
#-model-django
# https://github.com/PyAr/pyarweb/blob/master/pycompanies/models.py
@receiver(post_delete, sender=Subject)
def post_delete_user(sender, instance, *args, **kwargs):
    if instance.user:  # just in case user is not specified
        instance.user.delete()


class TextData(models.Model):

    """
    Stores user data for a given
    experiment
    """

    experiment = models.ForeignKey('Experiment',
                                   verbose_name='Data_Experiment_ID',
                                   on_delete=models.CASCADE)
    group = models.ForeignKey('Group', verbose_name='Data_Group_ID',
                              on_delete=models.CASCADE)
    subject = models.ForeignKey('Subject', verbose_name='Data_Subject_ID',
                                on_delete=models.CASCADE)
    measurement = models.ForeignKey('Measurement',
                                    verbose_name='Data_Measurement_ID',
                                    on_delete=models.CASCADE)

    submission_date = models.DateTimeField(auto_now_add=True)

    pre_text = models.TextField()
    post_text = models.TextField()

    pre_num_sentences = models.PositiveSmallIntegerField()
    post_num_sentences = models.PositiveSmallIntegerField()

    pre_num_clusters = models.PositiveSmallIntegerField()
    post_num_clusters = models.PositiveSmallIntegerField()

    pre_num_coherent_sentences = models.PositiveSmallIntegerField()
    post_num_coherent_sentences = models.PositiveSmallIntegerField()

    pre_num_non_coherent_sentences = models.PositiveSmallIntegerField()
    post_num_non_coherent_sentences = models.PositiveSmallIntegerField()

    pre_num_concepts = models.PositiveSmallIntegerField()
    post_num_concepts = models.PositiveSmallIntegerField()

    pre_local_cohesion = models.FloatField()
    post_local_cohesion = models.FloatField()

    pre_page_duration = models.FloatField()
    post_page_duration = models.FloatField()

    levenshtein_distance = models.PositiveSmallIntegerField()

    def __str__(self):
        return (self.experiment.name + " " +
                self.pre_text[:10].encode('ascii', errors='replace'))
