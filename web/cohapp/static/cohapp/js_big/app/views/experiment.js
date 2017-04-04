var app = app || {};

app.ExperimentView = Backbone.View.extend({

	el: $('#experiment-single'),

	events: {
		'click #new-user-button': 'generateUser',
		'click #data-export-button': 'dataExport',
	},

	initialize: function() {
		// Get id of experiment
		this.experiment_id = app.getExperimentId();

		// Init experiment model
		this.singleExperimentModel = new app.ExperimentModel();

		// Init user collection
		this.UserCollection = new app.UserCollection();

		// Init single user model
		this.UserModel = new app.UserModel();

		// Assign self to this
		var self = this;

		// Fetch experiment data
		this.singleExperimentModel.fetch({
			success: function(response) {
				self.renderHeader();
			},
			error: function() {
				Materialize.toast(
					'Das Experiment konnte nicht gefunden werden!', 4000);
			}
		});

		// Fetch users
		this.fetchUsers();

	},

	fetchUsers: function() {
		var self = this;

		// Get user collection
		this.UserCollection.fetch({
			success: function(collection) {
				self.renderUsers();
			},
			error: function() {
				Materialize.toast(
					'Die Nutzerdaten konnten nicht gefunden werden!', 4000);
			}
		});
	},

	/**
	 * Set the html of the header to the experiment name
	 */
	renderHeader: function() {
		// Assign experiment name to heading
		this.$('h1').first().html(this.singleExperimentModel.get('name'));

		// Set href for experiment to heading
		this.$("#experiment-header").attr("href", app.urls.run_experiment +
			this.singleExperimentModel.get('master_pw'));

	},

	/**
	 * Render data for each user of the experiment
	 */
	renderUsers: function() {
		// Render users
		this.$el.find('#users').html(
			Handlebars.templates.users({user:
				this.UserCollection.toJSON()}));
	},

	/**
	 * Generates new users
	 */
	generateUser: function() {
		var self = this;

		// Generate new user
		this.UserModel.set({'nr_users': 1});

		// Save new User
		this.UserModel.save(null, {
			success: function (model, response) {
				self.fetchUsers();
			},
			error: function (model, response) {
				console.log(response.responseText);
			}
		});
	},

	/**
	 * Export data as csv
	 */
	dataExport: function() {
		console.log('export data');
		window.open(app.urls.csv_text_data + app.getExperimentId());
	}

});



if (window.location.pathname.startsWith('/experiment/')) {
	new app.ExperimentView();
}
