import requests
import json
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Book


def index(request):
    try:
        up_book = Book.objects.get(upcoming=True)
    except:
        up_book = 'Add your first book'

    return render(request, 'bookclub/index.html', {
        'up_book': up_book,
        'books': Book.objects.all().order_by('year')
    })


def add_book(request, bookid, year, country):

    # TODO - get rid of the second API request for the same book
    try:
        url = f'https://www.googleapis.com/books/v1/volumes/{bookid}'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.RequestException:
        return None
    try:
        book = response.json()
    except (KeyError, TypeError, ValueError):
        return None

    info = book['volumeInfo']

    # todo - remove 1973
    if year <= 1973:
        isClassic = True
    else:
        isClassic = False

    Book.objects.create(bookid=bookid, title=info.get("title"), author=info.get("authors")[0], year=year, country=country, pages=info.get("pageCount"),
                        desc=info.get('description'), is_classic=isClassic, image_link=info['imageLinks'].get('smallThumbnail'))

    # return index(request)
    return HttpResponse(status=204)


def book_check(request, bookid):
    try:
        check_book = Book.objects.get(bookid=bookid)
        return JsonResponse({
            "year": check_book.year,
            "upcoming": check_book.upcoming,
            'rating': check_book.rating,
            'read': check_book.read
        }, status=200)
    except:
        return JsonResponse({
            "year": None
        }, status=200)


def history_view(request):
    # Return books in reverse chronologial order
    old_books = Book.objects.all().order_by("-meeting_date").all()
    return JsonResponse([old_book.serialize() for old_book in old_books], safe=False)


@csrf_exempt
def edit_book(request, bookid):
    try:
        book = Book.objects.get(bookid=bookid)
    except Book.DoesNotExist:
        return JsonResponse({"error": "Book not found."}, status=404)
    print(book)
    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("meeting_date") is not None:
            book.meeting_date = data["meeting_date"]
        print(book)
        book.save()
        return HttpResponse(status=204)
