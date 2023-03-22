
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),

    # API Routes
    path("add/<str:bookid>/<int:year>/<str:country>",
         views.add_book, name="to reading list"),
    path("remove/<str:bookid>", views.remove_book, name="remove book"),
    path('check/<str:bookid>', views.book_check, name='book check'),
    path('history/', views.history_view, name='history'),
    path("edit/<str:bookid>",
         views.edit_book, name="edit book info")
    # todo - change Book entry
    # path("change/<int:ident>/<str:newText>", views.histChange, name="div-title")
]
