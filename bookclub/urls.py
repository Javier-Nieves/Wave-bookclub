
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),


    # API Route
    path("add/<str:bookid>/<int:year>/<str:country>",
         views.add_book, name="to reading list"),
    path('check/<str:bookid>', views.book_check, name='book check')
    # path("change/<int:ident>/<str:newText>", views.histChange, name="div-title")

]
