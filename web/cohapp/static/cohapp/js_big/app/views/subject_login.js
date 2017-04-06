app.SubjectLoginView = Backbone.View.extend({

	el: $('#subject-login'),

	events: {
		"submit form": "submit",
	},

	initialize: function() {
	},

	submit: function() {
		// Prevent default behavior
		event.preventDefault();

		// Get input
		var username = this.$el.find('#username').val();

		// Remove vocal mutations and lowercase username
		tidyUsername = username
			.replace(/ä/g,"ae")
			.replace(/ö/g,"oe")
			.replace(/ü/g,"ue")
			.replace(/Ä/g,"ae")
			.replace(/Ö/g,"oe")
			.replace(/Ü/g,"ue")
			.replace(/ß/g,"ss").toLowerCase();

		// Check if string is valid
		var regex = /^([a-z]{2,4}(0[1-9]|[12]\d|3[01])[a-z]{2,4}[2-5]{1}[0-9]{1})$/;

		// Check if username is valid
		if (username.length == 8 && regex.test(tidyUsername)) {
			// Get csrftoken
			var csrftoken = app.getCookie('csrftoken');

			// Send post request
			$.ajax({
				beforeSend: function(xhr, settings) {
					if (!app.csrfSafeMethod(settings.type) && app.sameOrigin(settings.url)) {
						// Send the token to same-origin, relative URLs only.
						// Send the token only if the method warrants CSRF protection
						// Using the CSRFToken value acquired earlier
						xhr.setRequestHeader("X-CSRFToken", csrftoken);
					}
				},
				type: "POST",
				url: window.location.href,
				data: {username: tidyUsername},
				success: function(response) {
					// Redirect to experiment page
					window.location = app.urls.run_experiment + app.getExperimentId();
				},

				error: function(response) {
					console.log(response.responseText);
					Materialize.toast(response.responseText, 4000);
				}
			});

		} else {
			Materialize.toast('Ihr Nutzername entspricht nicht dem Muster.', 4000);
		}
	},

});

if (window.location.pathname.startsWith('/login-experiment')) {
	new app.SubjectLoginView();
}
