# Generated by Django 4.1.6 on 2023-03-22 03:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("bookclub", "0011_alter_book_meeting_date"),
    ]

    operations = [
        migrations.RemoveField(model_name="book", name="is_classic",),
    ]
