var app = app || {};

app.TextModelComplete = Backbone.Model.extend({
	url: app.urls.textdata + app.getExperimentId(),

    defaults: {
        "pre_text": null,
        "post_text": null,
        "pre_num_sentences": null,
        "post_num_sentences": null,
        "pre_num_clusters": null,
        "post_num_clusters": null,
        "pre_num_coherent_sentences": null,
        "post_num_coherent_sentences": null,
        "pre_num_non_coherent_sentences": null,
        "post_num_non_coherent_sentences": null,
        "pre_page_duration": null,
        "post_page_duration": null,
        "pre_num_concepts": null,
        "post_num_concepts": null,
        'pre_local_cohesion': null,
        'post_local_cohesion': null
    }
});
