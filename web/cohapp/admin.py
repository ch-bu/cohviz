from django.contrib import admin
from .models import Experiment, Group, Measurement, Subject, TextData

@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    readonly_fields = ('slug', 'nr_measurements', 'nr_groups',
                       'master_pw')


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    pass


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    readonly_fields = ('experiment', 'group', 'measure', 'nr_group')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    readonly_fields = ('user', 'experiment', 'trusted', 'nr_measurements')


@admin.register(TextData)
class TextDataAdmin(admin.ModelAdmin):
    readonly_fields = ('experiment', 'group', 'subject',
                       'measurement', 'submission_date', 'pre_text',
                       'post_text', 'pre_num_sentences', 'post_num_sentences',
                       'pre_local_cohesion', 'post_local_cohesion',
                       'pre_num_clusters', 'post_num_clusters',
                       'pre_num_coherent_sentences',
                       'post_num_coherent_sentences',
                       'pre_num_non_coherent_sentences',
                       'post_num_non_coherent_sentences',
                       'pre_num_concepts', 'post_num_concepts',
                       'pre_page_duration', 'post_page_duration',
                       'levenshtein_distance',
                       'accuracy_draft_local', 'accuracy_draft_global',
                       'accuracy_revision_local', 'accuracy_revision_global',
                       'cld_draft_question1', 'cld_draft_question2',
                       'cld_draft_question3', 'cld_draft_question4',
                       'cld_revision_question1', 'cld_revision_question2',
                       'cld_revision_question3', 'cld_revision_question4',
                       'cld_middle_question1', 'cld_middle_question2',
                       'cld_middle_question3', 'cld_middle_question4',)
