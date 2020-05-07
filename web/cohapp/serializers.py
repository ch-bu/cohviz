from cohapp.models import Experiment, Measurement, Subject, Group, TextData
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
                 'group', 'levenshtein_distance',
                 'accuracy_draft_local', 'accuracy_draft_global',
                 'accuracy_revision_local', 'accuracy_revision_global',
                 'cld_draft_question1', 'cld_draft_question2',
                 'cld_draft_question4',
                 'cld_middle_question1', 'cld_middle_question2',
                 'cld_middle_question4',
                 'cld_revision_question1', 'cld_revision_question2',
                 'cld_revision_question4', 
                 'g06fu1fb', 'g8fu3fb', 'g07fu2fb', 'g10fu5fb',
                 'g9fu4fb', 
                 'g11eda5', 'g12eda6', 'g13eda7', 'g14eda8',
                 'emo1_draft', 'emo2_draft', 'emo3_draft', 'emo4_draft')


class MeasurementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Measurement
        fields = ('experiment', 'publication', 'measure',
                  'nr_group', 'group', 'instruction', 'instruction_first',
                  'instruction_second')


class SubjectSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    # http://www.django-rest-framework.org/api-guide/fields/
    # #serializermethodfield
    last_login = serializers.SerializerMethodField()
    instruction = serializers.SerializerMethodField()
    instruction_first = serializers.SerializerMethodField()
    instruction_second = serializers.SerializerMethodField()
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

    def get_instruction_first(self, obj):
        try:
            next_measure = Measurement.objects.get(
                experiment=obj.experiment, nr_group=obj.group,
                measure=obj.nr_measurements + 1)

            return next_measure.instruction_first

        except Measurement.DoesNotExist:
            return "Abgeschlossen"

    def get_instruction_second(self, obj):
        try:
            next_measure = Measurement.objects.get(
                experiment=obj.experiment, nr_group=obj.group,
                measure=obj.nr_measurements + 1)

            return next_measure.instruction_second

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
                  'nr_measurements', 'instruction', 'instruction_first',
                  'instruction_second',
                  'next_measure')
        read_only_fields = ('user', 'group', 'trusted', 'last_login',
                            'instruction', 'instruction_first',
                            'instruction_second', 'next_measure')


class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = ('name', 'abbreviation', 'description')
