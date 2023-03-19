import requests
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect

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
    pass
