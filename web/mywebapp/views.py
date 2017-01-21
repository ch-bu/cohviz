from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("<b>Hello world. You are at myapp</b>")

# Create your views here.
