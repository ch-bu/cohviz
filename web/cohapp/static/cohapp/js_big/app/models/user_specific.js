var app = app || {};

app.UserSpecificModel = Backbone.Model.extend({
    url: app.urls.user_specific  + app.getExperimentId(),
});