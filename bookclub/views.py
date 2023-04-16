import json
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError

from .models import User, Book, Library


def index(request):
    # todo - change for bookclub
    try:
        up_book = Book.objects.get(upcoming=True)
    except:
        up_book = None

    return render(request, 'bookclub/index.html', {
        'up_book': up_book,
    })


@csrf_exempt
def add_book(request, bookid):
    if request.method == "POST":
        data = json.loads(request.body)
    Book.objects.create(bookid=bookid, title=data["title"], author=data["author"], year=data["year"], country=data["country"], pages=data["pages"],
                        desc=data["desc"], image_link=data["image"])
    # todo - add to bookclub's library

    return HttpResponse(status=204)


# todo - checks for next functions
def remove_book(request, bookid):
    # todo - change for bookclub
    book = Book.objects.get(bookid=bookid)
    book.delete()
    return HttpResponse(status=204)


def book_check(request, bookid):
    # todo - change for bookclub
    try:
        check_book = Book.objects.get(bookid=bookid)
        return JsonResponse(check_book.serialize(), status=200)
    except:
        return JsonResponse({'message': 'not in DB'}, status=200)


def all_books_view(request, field):
    # todo - change for bookclub
    if field == 'history':
        # Return books in reverse chronologial order
        old_books = Book.objects.all().order_by("meeting_date").all()
        return JsonResponse([old_book.serialize() for old_book in old_books], safe=False)
    elif field == 'all':
        books = Book.objects.all().order_by('-year')
        return JsonResponse([book.serialize() for book in books], safe=False)


@csrf_exempt
def edit_book(request, bookid):
    # todo - change for bookclub
    try:
        book = Book.objects.get(bookid=bookid)
    except Book.DoesNotExist:
        return JsonResponse({"error": "Book not found."}, status=404)
    if request.method == "PUT":
        data = json.loads(request.body)

        if data.get("meeting_date") is not None:
            book.meeting_date = data["meeting_date"]

        if data.get("next") is not None:
            book.upcoming = data["next"]

        if data.get("rating") is not None:
            rating = float(data['rating'])
            book = Book.objects.get(bookid=bookid)
            book.rating = rating
            book.read = True
            book.upcoming = False

        book.save()
        return HttpResponse(status=204)


def pass_view(request):
    # needed to JS to load history page upon clicking browser back button from history book
    return HttpResponse(status=204)

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
            print('login successful')
            return index(request)
        else:
            return index(request)
    else:
        return index(request)


def logout_view(request):
    logout(request)
    return index(request)


def register(request):
    if request.method == "POST":
        username = request.POST["register-name"].lower()
        password = request.POST["register-password"]
        # confirmation = request.POST["confirmation"]
        # if password != confirmation:
        #     return render(request, "stocks/register.html", {
        #         "message": "Passwords must match."
        #     })

        # * Attempt to create new bookclub
        try:
            club = User.objects.create_user(username, password)
            club.save()
            library = Library.objects.create(club=club)
            library.save()
        except IntegrityError:
            print('some error')
            return index(request)
        login(request, club)
        return index(request)
    else:
        return index(request)
