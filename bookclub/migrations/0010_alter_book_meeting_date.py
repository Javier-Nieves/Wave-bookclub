# Generated by Django 4.1.6 on 2023-03-22 02:02

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("bookclub", "0009_alter_book_meeting_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="book",
            name="meeting_date",
            field=models.DateTimeField(
                blank=True, default=datetime.date(2023, 3, 22), null=True
            ),
        ),
    ]
