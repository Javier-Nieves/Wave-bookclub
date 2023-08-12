import { Authenticated } from "./model.js";
import { CLASSIC_LIMIT, HideAll } from "./helpers.js";

!Authenticated() && hideControls();

export function bookSummon(function1) {
  // prettier-ignore
  [".search-table", ".classic-table", ".modern-table", ".history-table", ".upcoming-book-container"]
    .forEach((item) => document.querySelector(item).addEventListener("click", (e) => {
      if (!e.target.closest(".add-date-container"))
        function1(e.target.closest(".dataContainer").dataset.bookid);
    }
    ));
}

export function showBook(book) {
  HideAll();
  document.querySelector("#book-view").style.display = "flex";
  // manage buttons on page
  if (Authenticated()) {
    book.year && displayButtons("edit");
    book.year && !book.read && displayButtons("remove", "edit");
    book.year && book.upcoming && displayButtons("rate", "edit");
    !book.year && displayButtons("add");
  } else displayButtons();

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
}

export function bookBtnsFunctions(add, remove, edit, next, rate) {
  document.querySelector(".add-btn").addEventListener("click", add);
  document.querySelector(".remove-btn").addEventListener("click", remove);
  document.querySelector(".edit-btn").addEventListener("click", edit);
  document.querySelector(".next-btn").addEventListener("click", next);
  document.querySelector(".rate-btn").addEventListener("click", rate);
}

function displayButtons(...buttons) {
  const removeBtn = document.querySelector(".remove-btn-container");
  const addBtn = document.querySelector(".add-btn");
  const rateBtn = document.querySelector(".rate-btn-container");
  const nextBtn = document.querySelector(".next-btn");
  const nextBook = document.querySelector(".upcoming-book-container").dataset
    .bookid;
  const editBtn = document.querySelector(".edit-btn");
  [removeBtn, addBtn, rateBtn, nextBtn, editBtn].map(
    (btn) => (btn.style.display = "none")
  );
  if (buttons.includes("remove")) {
    removeBtn.style.display = "flex";
    if (!nextBook) nextBtn.style.display = "block";
  }
  if (buttons.includes("add")) addBtn.style.display = "flex";
  if (buttons.includes("rate")) rateBtn.style.display = "block";
  if (buttons.includes("edit")) editBtn.style.display = "block";
}

function hideControls() {
  document.querySelector(".control-group").style.display = "none";
  try {
    document.querySelector(".add-date-container").style.display = "none";
  } catch {
    console.log("no date container");
  }
}
