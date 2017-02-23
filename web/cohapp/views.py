# encoding: utf-8
import csv
import re
import json

from datetime import datetime

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

from cohapp import constants
from cohapp.models import Experiment, Measurement, Group, Subject
from cohapp.models import TextData


# ========================= END Helper Classes ===========================


def index(request):
    """
    Signature:
            HttpRequest -> HttpResponse
    Purpose:
            Renders a simple HttpResponse when index page is requested
    Args:
            request -> HttpRequest
    """

    if request.method == "GET":

        return render(request, 'cohapp/index.html')


@login_required(login_url='/login/')
def dashboard(request):
    """
    Dashboard View
    """

    if request.user.is_superuser:
        return render(request, 'cohapp/dashboard.html')

    return redirect('index')


@login_required(login_url='/login/')
def logout(request):
    """
    Login View
    """

    # Delete all session data
    django_logout(request)

    # Redirect
    return redirect('login')


def logout_subject(request, experiment_id):
    """
    Logout user of experiment
    """

    django_logout(request)

    # Redirect
    return redirect('login_experiment', experiment_id=experiment_id)


@login_required(login_url='/login/')
def new_experiment(request):
    """
    New Experiment View
    """

    if request.user.is_superuser:
        return render(request, 'cohapp/new_experiment.html')

    return redirect('index')


@login_required(login_url='/login/')
def experiment(request, experiment_password):
    """
    View for a specific experiment
    """

    # user = None

    # Get user
    if request.user.is_authenticated():
        # user = request.user

        # Check if experiment exists
        try:
            experiment = Experiment.objects.get(master_pw=experiment_password)
        except Experiment.DoesNotExist:
            return redirect('dashboard')

        # Render Experiment page
        return render(request, 'cohapp/experiment.html')

    return redirect('login')


def login(request):
    """
    Login View
    """

    # https://docs.djangoproject.com/en/1.8/topics/auth/default/
    # #django.contrib.auth.login
    # tp://onecreativeblog.com/post/59051248/django-login-required-middleware

    if request.method == "GET":

        # User is already logged in
        if request.user.is_authenticated():
            return redirect('dashboard')

        # Render Login Page for Get request
        return render(request, 'cohapp/login.html')

    elif request.method == "POST":

        # Get POST data
        username = request.POST.get('username', False)
        password = request.POST.get('password', False)

        # Write Context variables
        # TODO: Externalize Context variables
        context = {}
        context['username'] = username

        # Check if user is authenticated in the system
        user = authenticate(username=username, password=password)

        # User is authenticated
        if user is not None:
            # User is active
            if user.is_active and user.is_staff:
                # Add Session-ID to HttpResponse
                django_login(request, user)

                # Redirect to dashboard page
                return redirect('dashboard')
            # User is not active
            else:
                # Redirect to login page
                # TODO: Return a 'disabled acccount' error message
                context['accountdisabled'] = constants.errors[
                    'accountdisabled']
                return render(request, 'cohapp/login.html', context)
        # User is not authenticated
        else:
            context['invalidlogin'] = "test2"
            return render(request, 'cohapp/login.html', context)


def login_exp_redirect(request):
    # Check if user has been redirected to this page
    redirectURL = request.GET.get('next', '')

    # Check if redirect exists
    if redirectURL:

        if redirectURL.startswith('/run-experiment'):
            experiment = redirectURL.split("/run-experiment/", 1)[1]

            return redirect('login_experiment', experiment_password=experiment)
        # return HttpResponseRedirect(url=request.get_host() + redirectURL)

        return redirect('index')


def login_experiment(request, experiment_password):

    if request.method == "GET":

        # User is already logged in
        if request.user.is_authenticated():

            # User is staff
            if request.user.is_staff:

                # Log out staff user
                django_logout(request)

                # Render login page for stuff user
                return render(request, 'cohapp/subject_login.html')

            # User is not staff and can directly be redirected
            # to experiment
            return redirect('run_experiment', experiment_password=
                            experiment_password)

        # Check if experiment exists
        try:
            Experiment.objects.get(master_pw=experiment_password)
        # Experiment does not exist
        except Experiment.DoesNotExist:
            # Logout user
            logout(request)

            # Redirect to index page
            return redirect('index')

        # User has not logged in already
        return render(request, 'cohapp/subject_login.html')

    elif request.method == "POST":

        # Get username
        username = request.POST['username'].lower()

        # Check if username matches regular expression
        pattern = re.compile("^[a-z]{2,4}(0[1-9]|1[012])[a-z]{2,4}")

        # Check if username is valid
        if pattern.match(username):

            # Get experiment id
            experimentId = Experiment.objects.get(
                master_pw=experiment_password).id

            # Authenticate user
            user = authenticate(username=username, password=experiment_password)

            # User exists
            if user is not None:
                # Check if subject exists for this experiment
                subject = Subject.objects.filter(
                    user=user,
                    experiment=experimentId).first()

                # Subject exists for this given experiment
                if subject is not None:
                    # Login user
                    django_login(request, user)

                    # Redirect to experiment
                    return HttpResponse('Run experiment user exists',
                                        status=200)
                # Subject does not exist for this experiment
                else:
                    return HttpResponse(
                        'Sie haben keinen Zugang zu dem Experiment', status=404)

            # User does not exist
            else:
                # Check if user with username exists
                try:
                    # Check if any user with this name exists
                    staffUser = User.objects.get(username=username)
                # There is no user with this username
                except ObjectDoesNotExist:
                    # Create new subject for this experiment
                    subject = Subject()
                    subject.generate_user(username, experiment_password,
                                          experimentId)

                    # Log in subject
                    user = authenticate(username=username,
                                        password=experiment_password)
                    django_login(request, user)

                    # Redirect to experiment
                    return HttpResponse(
                        'Subject has been generated now run experiment',
                        status=200)

                # If user exists but not for this experiment, then don't
                # allow to run experiment
                return HttpResponse(
                    'Es existiert bereits ein Nutzer mit Ihrer ID',
                    status=404)

        # Username doesn't match
        else:
            return HttpResponse(
                'Ihr Nutzername entspricht nicht dem Muster',
                status=404)


@login_required(login_url='/login_exp_redirect/')
def run_experiment(request, experiment_password):

    if request.method == "GET":

        # Check if experiment exists
        try:
            experiment = Experiment.objects.get(master_pw=experiment_password)
        # Experiment does not exist
        except Experiment.DoesNotExist:
            # Logout user
            logout(request)

            # Redirect to index page
            return redirect('index')

        # Check if user is registererd for this experiment
        try:
            subject = Subject.objects.get(user=request.user,
                                          experiment=experiment)
        # User does not exist for this experiment
        except Subject.DoesNotExist:

            logout(request)

            # Redirect user to login page for experiment
            return redirect('login_experiment',
                            experiment_password=experiment_password)

        # Get number of measurements for user
        nr_measurements = subject.nr_measurements

        # Creat context variable
        context = {}

        # Get next measure for user
        try:
            next_measure = Measurement.objects.get(
                experiment=experiment, nr_group=subject.group,
                measure=nr_measurements + 1)
        # Subject has completed the experiment
        except Measurement.DoesNotExist:
            # Logout user
            logout(request)

            # Render Success message to user
            return render(request, 'cohapp/experiment_success.html')

        # Get group for measurement
        group = Group.objects.get(id=next_measure.group.id)

        # Check if publication date for next measure is in the future
        if next_measure.publication > datetime.today().date():

            # Format date for user
            formatted_date = datetime.strftime(next_measure.publication,
                                               "%d.%m.%Y")
            context['date'] = formatted_date

            # Logout user
            logout(request)

            # Return message when user can log in next time
            return render(request, 'cohapp/publication_future.html', context)

        # Render appropriate measure template
        return render(request, 'cohapp/treatments/' + group.template)


@login_required()
def csv_text_view(request, experiment_password):
    """
    Returns CSV file for experiment
    """

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment;filename="exp_data.csv"'

    # Get experiment
    try:
        curr_experiment = Experiment.objects.get(
            master_pw=experiment_password)
    # The experiment does not exist
    except Experiment.DoesNotExist:
        return response

    # Get text data from experiment
    try:
        text_data = TextData.objects.filter(experiment=curr_experiment)
    except TextData.DoesNotExit:
        return response

    # Open CSV writer
    writer = csv.writer(response)

    # Write header
    writer.writerow(['subject',
                     'group',
                     'treatment',
                     'measure',
                     'submission',
                     'pre_text',
                     'post_text',
                     'pre_num_sentences',
                     'post_num_sentences',
                     'pre_num_clusters',
                     'post_num_clusters',
                     'pre_num_coherent_sentences',
                     'post_num_coherent_sentences',
                     'pre_num_non_coherent_sentences',
                     'post_num_non_coherent_sentences',
                     'pre_num_concepts',
                     'post_num_concepts',
                     'pre_page_duration',
                     'post_page_duration',
                     'levenshtein_distance'])

    for inst in text_data:
        writer.writerow([inst.subject.user,
                         inst.subject.group,
                         inst.group.name,
                         inst.measurement.measure,
                         inst.submission_date,
                         inst.pre_text.replace('\n', '').replace('\r', '').encode('utf-8'),
                         inst.post_text.replace('\n', '').replace('\r', '').encode('utf-8'),
                         inst.pre_num_sentences,
                         inst.post_num_sentences,
                         inst.pre_num_clusters,
                         inst.post_num_clusters,
                         inst.pre_num_coherent_sentences,
                         inst.post_num_coherent_sentences,
                         inst.pre_num_non_coherent_sentences,
                         inst.post_num_non_coherent_sentences,
                         inst.pre_num_concepts,
                         inst.post_num_concepts,
                         inst.pre_page_duration,
                         inst.post_page_duration,
                         inst.levenshtein_distance])

    return response
