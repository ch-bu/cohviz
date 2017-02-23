var app = app || {};

app.ExperimentModel = Backbone.Model.extend({
    defaults: {
        name: '',
        nr_measurements: '',
        nr_groups: ''
    },
    
    url: app.urls.experiment + app.getExperimentId(),
});