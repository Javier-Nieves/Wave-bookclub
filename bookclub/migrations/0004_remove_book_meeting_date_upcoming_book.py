# Generated by Django 4.1.6 on 2023-03-13 00:51

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("bookclub", "0003_book_meeting_date_book_rating"),
    ]

    operations = [
        migrations.RemoveField(model_name="book", name="meeting_date",),
        migrations.CreateModel(
            name="Upcoming_book",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "meeting_date",
                    models.DateTimeField(default=datetime.datetime.now, null=True),
                ),
                (
                    "book",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="bookclub.book"
                    ),
                ),
            ],
        ),
    ]
