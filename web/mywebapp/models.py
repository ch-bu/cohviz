from __future__ import unicode_literals

from django.db import models

# Create your models here.
class TestModel(models.Model):
    first_name = models.CharField(max_length=30)
