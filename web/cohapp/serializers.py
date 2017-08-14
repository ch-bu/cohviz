from cohapp.models import Experiment, Measurement, Subject, Group, TextData
from cohapp.models import CognitiveLoadRevision
from rest_framework import serializers
from datetime import datetime


class ExperimentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Experiment
        fields = ('id', 'experimentator', 'date', 'name', 'master_pw',
                  'nr_measurements', 'nr_groups')
        read_only_fields = ('id', 'date')


class TextDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = TextData
        fields = ('pre_text', 'post_text', 'pre_num_sentences',
                 'post_num_sentences', 'pre_num_clusters', 'post_num_clusters',
                 'pre_num_coherent_sentences', 'post_num_coherent_sentences',
                 'pre_num_non_coherent_sentences',
                 'pre_local_cohesion', 'post_local_cohesion',
                 'post_num_non_coherent_sentences', 'pre_num_concepts',
                 'post_num_concepts', 'pre_page_duration',
                 'post_page_duration', 'measurement', 'experiment', 'subject',
                 'group', 'levenshtein_distance')


class MeasurementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Measurement
        fields = ('experiment', 'publication', 'measure',
                  'nr_group', 'instruction', 'group', 'instruction_review',
                  'instruction_strategies')


class CognitiveLoadRevisionSerializer(serializers.ModelSerializer):

  class Meta:
    model = CognitiveLoadRevision
    fields = ('experiment', 'subject', 'question1', 'question2',
              'question3', 'question4')


class SubjectSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    # http://www.django-rest-framework.org/api-guide/fields/
    # #serializermethodfield
    last_login = serializers.SerializerMethodField()
    instruction = serializers.SerializerMethodField()
    instructionreview = serializers.SerializerMethodField()
    next_measure = serializers.SerializerMethodField()

    def get_last_login(self, obj):
        # return datetime.strftime(obj.user.last_login, "%Y")
        # t = datetime.strftime(obj.user.last_login, format = "")
        # data = datetime.strptime(obj.user.last_login, "%Y")

        last_l = obj.user.last_login

        if last_l is not None:
            # return type(obj.user.last_login) is datetime
            data = datetime.strftime(last_l, "%d.%m.%Y - %H:%M")
            return data
        else:
            return ""

    def get_instruction(self, obj):
        try:
            next_measure = Measurement.objects.get(
                experiment=obj.experiment, nr_group=obj.group,
                measure=obj.nr_measurements + 1)
            # next = Group.objects.get(id=next_measure.group.id)

            return next_measure.instruction

        except Measurement.DoesNotExist:
            return "Abgeschlossen"

    def get_instructionreview(self, obj):
        try:
            next_measure = Measurement.objects.get(
                experiment=obj.experiment, nr_group=obj.group,
                measure=obj.nr_measurements + 1)

            return next_measure.instruction_review

        except Measurement.DoesNotExist:
            return "Abgeschlossen"

    def get_next_measure(self, obj):
        try:
            next_measure = Measurement.objects.get(
                experiment=obj.experiment, nr_group=obj.group,
                measure=obj.nr_measurements + 1)
            next = Group.objects.get(id=next_measure.group.id)

            return next.name

        except Measurement.DoesNotExist:
            return "Abgeschlossen"

    class Meta:
        model = Subject
        fields = ('user', 'experiment', 'group', 'trusted', 'last_login',
                  'nr_measurements', 'instruction', 'instructionreview',
                  'next_measure')
        read_only_fields = ('user', 'group', 'trusted', 'last_login',
                            'instruction', 'instructionreview', 'next_measure')


class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = ('name', 'abbreviation', 'description')
