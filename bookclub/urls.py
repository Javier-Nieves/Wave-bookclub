from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("show/<str:bookid>", views.book_refresh, name="book refresh"),
    path("search/<str:query>", views.index, name='search refresh'),
    path("history", views.index, name='history refresh'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    # todo - add and remove to one path
    path("add", views.add_book, name="to reading list"),
    path("remove", views.remove_book, name="remove book"),
    path("check/<str:bookid>", views.book_check, name="book check"),
    path("allbooks", views.all_books_view, name="all books"),
    path("edit/<str:bookid>", views.edit_book, name="edit book info")
]
