import json
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Book


def index(request):
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

    return HttpResponse(status=204)


# todo - checks for next functions
def remove_book(request, bookid):
    book = Book.objects.get(bookid=bookid)
    book.delete()
    return HttpResponse(status=204)


def book_check(request, bookid):
    try:
        check_book = Book.objects.get(bookid=bookid)
        return JsonResponse(check_book.serialize(), status=200)
    except:
        return JsonResponse({
            "year": None
        }, status=200)


def all_books_view(request, field):
    if field == 'history':
        # Return books in reverse chronologial order
        old_books = Book.objects.all().order_by("meeting_date").all()
        return JsonResponse([old_book.serialize() for old_book in old_books], safe=False)
    elif field == 'all':
        books = Book.objects.all().order_by('-year')
        return JsonResponse([book.serialize() for book in books], safe=False)


@csrf_exempt
def edit_book(request, bookid):
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
