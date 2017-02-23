var app = app || {};

app.DashboardView = Backbone.View.extend({

	el: $('#dashboard'),

	events: {
		'click .table-row': 'redirect'
	},

	initialize: function() {
		var self = this;

		// Fetch experiments
		this.experiments = new app.ExperimentsCollection();
		this.experiments.fetch({
			success: function() {
				self.renderExperiments();
			}
		});
	},

	/**
	 * Render all experiments for specific user
	 */
	renderExperiments: function() {
		// Render table with experiments
		this.$el.find('#experiments').html(
			Handlebars.templates.experiments({experiment:
				this.experiments.toJSON()}));

		// Attach event listener
		this.$el.on(".table-row", this.redirect, this);

	},

	/**
	 * Redirect to experiment that user clicks on
	 */
	redirect: function(experiment) {
		// Get ID of current experiment
		var idExperiment = $(experiment.currentTarget).attr('id');
		
		// Redirect to experiment
		window.location = app.urls.single_experiment + idExperiment;
	}
});

if (window.location.pathname == '/dashboard/') {
	new app.DashboardView();
}
