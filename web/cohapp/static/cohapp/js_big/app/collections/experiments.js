var app = app || {};

app.ExperimentsCollection = Backbone.Collection.extend({
	url: app.urls.experiments
});