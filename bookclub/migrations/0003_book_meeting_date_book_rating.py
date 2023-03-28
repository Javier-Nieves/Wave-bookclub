# Generated by Django 4.0.6 on 2023-02-15 00:45

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookclub', '0002_book_classic_book_read_book_year'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='meeting_date',
            field=models.DateTimeField(default=datetime.datetime.now, null=True),
        ),
        migrations.AddField(
            model_name='book',
            name='rating',
            field=models.FloatField(null=True),
        ),
    ]