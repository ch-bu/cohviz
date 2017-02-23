app.NewExperimentView = Backbone.View.extend({

	el: $('#new-experiment'),

	events: {
		'click #add-measurement': 'addMeasurement',
		'click #save-experiment': 'saveExperiment'
	},

	initialize: function() {
		var self = this;

		// Get groups
		this.groupsModel = new app.GroupsModel();
		
		// Get data from groups model
		this.groupsModel.fetch({
			success: function(response) {
				self.renderForm();
			},
			error: function(response) {
				console.log("Die Gruppen konnten nicht geladen werden");
			}
		});

		// Init MeasurementCollection
		this.measurementCollection = new app.MeasurementCollection();
		this.measurementModel = new app.MeasurementModel();

		// Init experiment model
		this.experimentModel = new app.ExperimentsModel();

		// Listen for model changes
		this.listenTo(this.measurementModel, 'change', this.modelChanged);

		// Measurement tracker
		// Whenever a new measurement is added I
		// increment the counter of each group
		this.measurements = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

	},

	/**
	 * Render the form in order to create experiment
	 */
	renderForm: function() {
		// Render initial table
		this.$el.find('#experiment-generator').html(
			Handlebars.templates['experiment-generator']({
				group: this.groupsModel.toJSON()
			}));

		// Enable select option
		this.$el.find('select').material_select();

		// Enable date picker
		this.$el.find('.datepicker').pickadate({
			selectMonths: true, // Creates a dropdown to control month
			selectYears: 15, // Creates a dropdown of 15 years to control year
			format: 'yyyy-mm-dd'
		});
	},

	/**
	 * Listen for changes in the measurement model
	 */
	modelChanged: function() {
		// Add model to collection
		this.measurementCollection.add(this.measurementModel.toJSON());

		// Render table
		this.renderTable();
	},

	/**
	 * Render table with measurements
	 */
	renderTable: function() {
		// Render Table of experiment
		this.$el.find('#experiment-table').html(
			Handlebars.templates['measurements-table']({
				measurement: this.measurementCollection.toJSON()
		}));
	},

	/**
	 * Add a single measurement and render measurement table
	 */
	addMeasurement: function() {
		var self = this;

		// Get form values
		var group = this.$el.find('#form-group').val();
		var treatment = this.$el.find('#form-treatment').val();
		var date = this.$el.find('#form-date').val();

		// Increment number of measurements for group
		this.measurements[group] += 1;

		// Check if user included a date
		if (date === '') {
			Materialize.toast('Bitte füge noch ein Datum ein', 4000);
		} else {
			// Save data to measurement model
			this.measurementModel.set({
				experiment: "", publication: date,
				measure: self.measurements[group], nr_group: Number(group),
				instruction: "", group: treatment});
		}
	},

	/**
	 * Save experiment
	 */
	saveExperiment: function() {
		var self = this;

		// Name of experiment
		var experimentName = this.$el.find('#experiment-name').val().trim();

		// Check if user has included a name for the experiment
		if (experimentName === '') {
			Materialize.toast(
				'Bitte tragen Sie noch den Namen des Experiements ein', 4000);
		// User has included a name for the experiment
		} else {
			// Count number of measurements and nr of groups
			var groups = new Set();
			var measurements = new Set();
			this.measurementCollection.each(function(model) {
				groups.add(model.toJSON()['nr_group']);
				measurements.add(model.toJSON()['measure']);
			});

			// User has not included any measurements
			if (measurements.size === 0) {
				Materialize.toast(
					'Bitte fügen Sie noch Messzeitpunkte ein.',
					4000);
			// User has included measurements
			} else {
				// Save experiment
				this.experimentModel.set({
					name: experimentName,
					nr_measurements: measurements.size,
					nr_groups: groups.size
				});

				// Post data to server
				this.experimentModel.save(null, {
					success: function(model, response) {
						self.saveMeasurements();
					},

					error: function(model, response) {
						console.log(response);
					}
				});
			}


		}
	},

	/**
	 * Save measurements
	 */
	saveMeasurements: function() {
		var self = this;

		// Get length of collection
		var lengthCollection = this.measurementCollection.length;

		// Loop over every model in collection
		this.measurementCollection.each(function(model) {
			
			// Recreate url for measurementmodel
			// The url in the model is not complete
			// we have to include the master password
			// for the specific experiment
			model.url = app.urls.measurement +
				self.experimentModel.get('master_pw');

			// Save measurement instance
			model.save(null, {
				success: function(model, response) {
					// Decrement remainding models
					lengthCollection -= 1;

					// If last model has been reached,
					// redirect to dashboard
					if (lengthCollection == 0) {
						window.location = app.urls.dashboard;
					}
				},

				error: function(model, response) {
					console.log(response.responseText);
				}
			});
		});


	}
});

if (window.location.pathname == '/new-experiment/') {
    new app.NewExperimentView();
}
