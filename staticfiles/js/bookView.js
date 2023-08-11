import { Authenticated } from "./model.js";
import { CLASSIC_LIMIT, HideAll } from "./helpers.js";

let bookToShow;

export function showBook(book) {
  bookToShow = book;
  HideAll();
  document.querySelector("#book-view").style.display = "flex";
  // manage buttons on page
  if (Authenticated()) {
    book.year && displayButtons("edit");
    book.year && !book.read && displayButtons("remove", "edit");
    book.year && book.upcoming && displayButtons("rate", "edit");
    !book.year && displayButtons("add");
  } else displayButtons();
}

export function fillBookData(book) {
  const title = document.querySelector(".view-title");
  const author = document.querySelector(".view-author");
  const description = document.querySelector(".view-desc");
  const image = document.querySelector(".view-image");
  const control = document.querySelector(".control-group");
  const pages = document.querySelector(".view-pages");
  const rating = document.querySelector(".view-rating");

  control.style.display = "flex";
  title.innerHTML = book.title;
  title.dataset.bookid = book.bookid;
  author.innerHTML = book.author;
  pages.innerHTML = `${book.pages}`;
  description.innerHTML = book.desc;
  image.src = book.image_link;
  if (book.rating) {
    rating.style.display = "block";
    rating.innerHTML = book.rating;
  }

  // if (source === "API") {
  //   fetch(`https://www.googleapis.com/books/v1/volumes/${book}`)
  //     .then((response) => response.json())
  //     .then((book) => {
  //       const volumeInfo = book.volumeInfo;
  //       title.innerHTML = volumeInfo.title || "no title";
  //       title.dataset.bookid = book.id;
  //       // todo - place for improvement:
  //       author.innerHTML = "no author";
  //       try {
  //         author.innerHTML = volumeInfo.authors[0];
  //       } catch {}
  //       pages.innerHTML = `${volumeInfo.pageCount}` || "no pages";
  //       // * image for book cover
  //       let imgUrl = "/staticfiles/bookclub/club2.png";
  //       try {
  //         imgUrl = volumeInfo.imageLinks.thumbnail;
  //       } catch {}
  //       control.style.display = "flex";
  //       image.src = imgUrl;
  //       description.innerHTML =
  //         volumeInfo.description || "no description available";
  //     });
  // }
}

function displayButtons(...buttons) {
  const removeBtn = document.querySelector(".remove-btn-container");
  const addBtn = document.querySelector(".add-btn");
  const rateBtn = document.querySelector(".rate-btn-container");
  const nextBtn = document.querySelector(".next-btn");
  const nextBook = document.querySelector(".upcoming-book-container").dataset
    .bookid;
  const editBtn = document.querySelector(".edit-btn");
  removeBtn.style.display = "none";
  addBtn.style.display = "none";
  rateBtn.style.display = "none";
  nextBtn.style.display = "none";
  editBtn.style.display = "none";

  if (buttons.includes("remove")) {
    document.querySelector(".simple-text").innerHTML = `from the ${
      bookToShow.year <= CLASSIC_LIMIT ? "Classic" : "Modern"
    } reading list`;
    removeBtn.style.display = "flex";
    if (!nextBook) nextBtn.style.display = "block";
  }
  if (buttons.includes("rate")) rateBtn.style.display = "block";
  if (buttons.includes("add")) addBtn.style.display = "flex";
  if (buttons.includes("edit")) editBtn.style.display = "block";
}
