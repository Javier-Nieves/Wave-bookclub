
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),

    # API Routes
    path("add/<str:bookid>",
         views.add_book, name="to reading list"),
    path("remove/<str:bookid>", views.remove_book, name="remove book"),
    path('check/<str:bookid>', views.book_check, name='book check'),
    path('allbooks/<str:field>', views.all_books_view, name='all books'),
    path('history', views.pass_view),
    path("edit/<str:bookid>",
         views.edit_book, name="edit book info"),
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register, name='register')
    # todo - change Book entry
    # path("change/<int:ident>/<str:newText>", views.histChange, name="div-title")
]
