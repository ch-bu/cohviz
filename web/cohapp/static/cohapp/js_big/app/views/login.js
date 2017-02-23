var app = app || {};

app.LoginView = Backbone.View.extend({
    initialize: function() {
        console.log('login');
    }
});

if (window.location.pathname == '/login/') {
    new app.LoginView();
}