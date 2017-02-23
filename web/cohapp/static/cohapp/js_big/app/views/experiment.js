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


// // ==================== SwitchButtonView =====================
// var GenerateUserView = Backbone.View.extend({
// 	el: $('#experiment_generate-user'),

// 	events: {
// 		"click #experiment_generate-user-button": "generateUser",
// 		"mouseup #experiment_slider": "setSliderValue",
// 	},

// 	user_template: _.template($('#experiment_show-users-template').html()),

// 	initialize: function() {

// 		this.user_collection = new UserCollection();
		
// 		this.user_collection.bind('sync', this.fetchUsers());
// 		this.slider_value_paragraph = $('#experiment_slider-value')

// 		var self = this;

// 		this.user_collection.fetch({
// 			success: function(collection) {
// 				if (collection.length > 0) {
// 					self.renderUsers()
// 				}
// 			}
// 		})
// 	},

// 	setSliderValue: function() {
		
// 		var slider = $('#experiment_slider').attr('aria-valuenow');

// 		this.slider_value_paragraph.html(slider);
// 	},

// 	generateUser: function() {
// 		var user_model = new UserModel();
// 		var self = this;

// 		var nr_users = $('#experiment_slider-value').html();
// 		user_model.set({'nr_users': nr_users});

// 		// Save experiment model
// 		user_model.save(null, {
// 		    success: function (model, response) {
// 		    	// Save measurement data for experiment

// 		        // Empty experiment model
// 		        user_model.clear();

// 		        // Render user data
// 		        self.fetchUsers();
// 		    },
// 		    error: function (model, response) {
// 		        console.log(response.responseText);
// 		    }
// 		});

// 	},

// 	fetchUsers: function() {
		
// 		var self = this;
		
// 		// Fetch users from database
// 		this.user_collection.fetch({
// 			success: function(collection) {
// 				if (collection.length > 0) {
// 					self.renderUsers();
// 					// self.renderBarChart();
// 				}
// 			}
// 		});
// 	},

// 	renderUsers: function() {
		
// 		var user_div = $('#experiment_show-users');
		
// 		// Empty user div
// 		user_div.empty();

// 		user_div.html(this.user_template({users: this.user_collection.toJSON()}));
// 	},

// });


if (window.location.pathname.startsWith('/experiment/')) {
	new app.ExperimentView();
}
// var experiment_view = new ExperimentView();
// var user_view = new GenerateUserView();
