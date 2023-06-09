from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Book(models.Model):
    bookid = models.CharField(max_length=20)
    club = models.ForeignKey(
        User, on_delete=models.CASCADE, to_field='username', default='wave')
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=50)
    country = models.CharField(max_length=50, default="Disc World")
    pages = models.IntegerField(null=True)
    desc = models.TextField(max_length=5000, default="None", null=True)
    image_link = models.CharField(max_length=400, null=True)
    year = models.IntegerField(null=True, blank=True)
    read = models.BooleanField(default=False)
    upcoming = models.BooleanField(default=False)
    rating = models.FloatField(null=True, blank=True)
    meeting_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.author}"

    def serialize(self):  # object.serialize() now will return a JSON object
        return {
            "bookid": self.bookid,
            "title": self.title,
            "author": self.author,
            "country": self.country,
            "pages": self.pages,
            "desc": self.desc,
            "image_link": self.image_link,
            "year": self.year,
            "read": self.read,
            "upcoming": self.upcoming,
            "rating": self.rating,
            "meeting_date": self.meeting_date
        }


# class Library(models.Model):
#     club = models.ForeignKey(User, on_delete=models.CASCADE)
#     books = models.ManyToManyField(Book, blank=True)

#     def __str__(self):
#         return f"{self.club}'s library"
