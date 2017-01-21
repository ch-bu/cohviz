from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("Hello world. You are at my apps")

# Create your views here.
