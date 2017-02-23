var app = app || {};

app.UserCollection = Backbone.Model.extend({
    url: app.urls.user_experiment + '/' + app.getExperimentId(),
});