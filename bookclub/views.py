import json
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError

from .models import User, Book


def index(request, message='', bookid='', **kwargs):
    if request.user.is_anonymous:
        user = User.objects.get(username='wave')
    else:
        user = request.user

    try:
        up_book = Book.objects.get(club=user, upcoming=True)
    except:
        up_book = None

    return render(request, 'bookclub/index.html', {
        'up_book': up_book,
        'message': message,
        'bookid': bookid
    })


@csrf_exempt
def add_book(request):
    if request.method == "POST":
        data = json.loads(request.body)
        Book.objects.create(bookid=data["bookid"], club=request.user, title=data["title"], author=data["author"], year=data["year"], country=data["country"], pages=data["pages"],
                            desc=data["desc"], image_link=data["image"])
        return JsonResponse({'ok': True}, status=200)


@csrf_exempt
def remove_book(request):
    if request.method == "POST":
        data = json.loads(request.body)
        book = Book.objects.get(bookid=data["bookid"], club=request.user)
        book.delete()
        return JsonResponse({'ok': True}, status=200)


def book_check(request, bookid):
    try:
        check_book = Book.objects.get(bookid=bookid, club=request.user)
        return JsonResponse(check_book.serialize(), status=200)
    except:
        return JsonResponse({'notInDB': True}, status=200)


def all_books_view(request):
    if request.user.is_anonymous:
        user = User.objects.get(username='wave')
    else:
        user = request.user
    books = Book.objects.filter(club=user).order_by('-year')
    return JsonResponse([book.serialize() for book in books], safe=False)


@csrf_exempt
def edit_book(request, bookid):
    try:
        book = Book.objects.get(bookid=bookid, club=request.user)
    except Book.DoesNotExist:
        return JsonResponse({"error": "Book not found."}, status=404)
    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("next") is not None:
            book.upcoming = data["next"]

        if data.get("rating") is not None:
            rating = float(data['rating'])
            book = Book.objects.get(bookid=bookid, club=request.user)
            book.rating = rating
            book.read = True
            book.upcoming = False

        if data.get("meeting") is not None:
            book.meeting_date = data["meeting"]

        if data.get("save") is not None:
            book = Book.objects.get(bookid=bookid, club=request.user)
            newAuthor = data['newAuthor']
            newTitle = data['newTitle']
            newPages = float(data['newPages'])//1
            newDesc = data['newDesc']
            book.author = newAuthor
            book.title = newTitle
            book.pages = newPages
            book.desc = newDesc
        book.save()
        return JsonResponse({'edited': True}, status=200)


def book_refresh(request, bookid):
    return index(request, bookid=bookid)


# ----- LOGIN -----
def login_view(request):
    if request.method == "POST":
        # * Attempt to sign user in
        bookclub = request.POST["club-name"].lower()
        password = request.POST["club-password"]
        user = authenticate(request, username=bookclub, password=password)
        # * Check if authentication is successful
        if user is not None:
            login(request, user)
            message = 'Login successful'
            return index(request, message)
        else:
            return index(request, "Incorrect")
    else:
        return index(request)


def logout_view(request):
    logout(request)
    return index(request, 'Logged out')


def register(request):
    if request.method == "POST":
        username = request.POST["register-name"].lower()
        password = request.POST["register-password"]
        # * Attempt to create new bookclub
        try:
            club = User.objects.create_user(username, 'email', password)
            club.save()
        except IntegrityError:
            return index(request)
        login(request, club)
        return index(request, 'You are registered')
    else:
        return index(request)
