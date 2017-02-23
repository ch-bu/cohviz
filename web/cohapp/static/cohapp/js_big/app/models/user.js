var app = app || {};

app.UserModel = Backbone.Model.extend({
    url: app.urls.user_experiment  + app.getExperimentId(),
});