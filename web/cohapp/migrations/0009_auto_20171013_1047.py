# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-10-13 08:47
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cohapp', '0008_auto_20170825_1548'),
    ]

    operations = [
        migrations.RenameField(
            model_name='measurement',
            old_name='instruction_review',
            new_name='instruction_first',
        ),
        migrations.RenameField(
            model_name='measurement',
            old_name='instruction_strategies',
            new_name='instruction_second',
        ),
    ]