from cohapp import views
from cohapp import apis
from django.contrib import admin

"""toolapp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from cohapp import views as cohviews

# Temporary urls
# http://stackoverflow.com/questions/1360101/how-to-generate-temporary-urls-in-django

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', cohviews.index, name='index'),
    url(r'^dashboard/', cohviews.dashboard, name='dashboard'),
    url(r'^login/', cohviews.login, name='login'),
    url(r'^logout-subject/(?P<experiment_id>[0-9]+)',
        cohviews.logout_subject, name="logout-subject"),
    url(r'^logout', cohviews.logout, name='logout'),
    url(r'^new-experiment/', cohviews.new_experiment,
        name='new-experiment'),
    url(r'^api-auth/', include('rest_framework.urls',
                               namespace='rest_framework')),
    url(r'^experiment/(?P<experiment_password>\w+)', cohviews.experiment,
        name='experiment'),
    url(r'^login-experiment/(?P<experiment_password>\w+)',
        cohviews.login_experiment, name='login_experiment'),
    url(r'^login_exp_redirect/', cohviews.login_exp_redirect,
        name='login_exp_redirect'),
    url(r'^run-experiment/(?P<experiment_password>\w+)',
        cohviews.run_experiment, name='run_experiment'),
    url(r'^csv_text_export/(?P<experiment_password>\w+)',
        cohviews.csv_text_view, name='csv_text_export'),

    url(r'^apis/user-specific/(?P<experiment_password>\w+)',
        apis.UserSpecificView.as_view()),
    url(r'^apis/user-specific-name/(?P<user_name>\w+)/(?P<experiment_id>[0-9]+)',
        apis.UserSpecificNameView.as_view()),
    url(r'^apis/user-experiment/(?P<experiment_password>\w+)',
        apis.UserExperimentView.as_view()),
    url(r'^apis/experiments/', apis.ExperimentView.as_view()),
    url(r'^apis/measurements/(?P<experiment_password>\w+)',
        apis.MeasurementView.as_view(), name='measurement_api'),
    url(r'^apis/experiment/(?P<experiment_password>\w+)',
        apis.SingleExperimentView.as_view(), name='single_experiment_api'),
    url(r'^apis/registration/(?P<user_name>\w+)/(?P<experiment_id>[0-9]+)',
        apis.RegistrationView.as_view(), name='registration_view'),
    url(r'^apis/groups/', apis.GroupView.as_view(), name='group_api'),
    url(r'^apis/textanalyzer/', apis.TextAnalyzer.as_view()),
    url(r'^apis/textdata/(?P<experiment_password>\w+)',
        apis.TextDataView.as_view()),
]
