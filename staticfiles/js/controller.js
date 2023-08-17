import * as model from "./model.js";
import { AJAX, loadScreen, showMessage, hideModals } from "./helpers.js";
import showHistory from "./historyView.js";
import { showBook, bookSummon, bookBtnsFunctions } from "./bookView.js";
// prettier-ignore
import { showAllBooks, setStyle, NavBtnsFunction, meetingBtnFunction,
          sessionBtnsFunction, showModal } from "./mainView.js";
// prettier-ignore
import { activateSearchForm, activatePagination, 
        showSearchResults, currentPage } from "./searchView.js";

checkMessages();
loadView();
Btns_control();
window.addEventListener("popstate", loadView);

function Btns_control() {
  // mainView functions
  NavBtnsFunction(showAllBooks_control, showHistory_control);
  sessionBtnsFunction(logoutSequence);
  meetingBtnFunction(changeBookDB("meeting"));
  // bookView functions
  bookSummon(showBook_contol);
  bookBtnsFunctions(
    addOrRemoveBook("add"),
    addOrRemoveBook("remove"),
    changeBookDB("save"),
    changeBookDB("next"),
    changeBookDB("rate")
  );
  // searchView
  activateSearchForm(searchBook_control); // todo - add search by author
}

async function loadView() {
  loadScreen(true);
  await model.getAllBooks();
  setStyle();
  const url = window.location.href;
  (url.slice(-1) === "/" || url.includes("logout") || url.includes("login")) &&
    showAllBooks_control();
  url.includes("history") && showHistory_control();
  url.includes("search") &&
    searchBook_control(url.slice(url.lastIndexOf("/") + 1));
  url.includes("book") && showBook_contol(url.slice(url.lastIndexOf("/") + 1));
  loadScreen(false);
}

function showAllBooks_control() {
  // todo - add try-catch, error throwing
  showAllBooks(model.state.classicBooks, model.state.modernBooks);
  model.fillFlags("main");
  window.history.pushState("_", "_", `/`);
}

function showHistory_control() {
  showHistory(model.state.historyBooks);
  model.fillFlags("history");
  window.history.pushState("_", "_", `/history`);
}

async function showBook_contol(id) {
  loadScreen(true);
  await model.getBook(id);
  showBook(model.state.bookToShow);
  loadScreen(false);
  window.history.pushState("_", "_", `/book/${id}`);
}

async function searchBook_control(title) {
  loadScreen(true);
  const data = await model.searchBooks(title, currentPage);
  if (data.totalItems == 0) return;
  showSearchResults(data);
  activatePagination(searchBook_control);
  loadScreen(false);
  window.history.pushState("_", "_", `/search/${title}`);
}

function checkMessages() {
  const message = document.querySelector("#message");
  if (!message) return;
  showMessage(message.innerHTML);
  message.innerHTML = "";
}

async function logoutSequence() {
  await fetch("/logout");
  localStorage.removeItem("loggedIn");
  showMessage("Logged out");
  // waitNreload("logout");
  window.location.reload();
}

// todo:
function changeBookDB(action) {
  return function () {
    let bookid = document.querySelector(".view-title").dataset.bookid;
    // create meeting date
    if (action === "meeting") {
      bookid = document.querySelector(".upcoming-book-container").dataset
        .bookid;
      const meetingBtn = document.querySelector(".meetingBtn");
      document.querySelector(".meetingField").style.display = "block";
      // input will appear on first click
      meetingBtn.addEventListener("click", () => {
        const date = document.querySelector(".meetingField").value;
        document
          .querySelector(".add-date-container")
          .addEventListener("submit", (e) => {
            e.preventDefault();
            // second click will sent API
            fetch(`/edit/${bookid}`, {
              method: "PUT",
              body: JSON.stringify({
                meeting_date: date,
              }),
            });
            showMessage("Date selected");
            document.querySelector(".meetingField").style.display = "none";
            meetingBtn.style.display = "none";
            const newDate = document.createElement("div");
            newDate.className = "meeting-date";
            newDate.innerHTML = date;
            document.querySelector(".add-date-container").append(newDate);
          });
      });
    }
    if (action === "next") {
      fetch(`/edit/${bookid}`, {
        method: "PUT",
        body: JSON.stringify({
          next: true,
        }),
      });
      waitNreload("next");
    }
    if (action === "rate") {
      let form = document.querySelector(`.modal-form-${action}`);
      showModal(`rate`);
      form.onsubmit = (e) => {
        e.preventDefault();
        const rating = document.querySelector("#rating-input").value;
        fetch(`/edit/${bookid}`, {
          method: "PUT",
          body: JSON.stringify({
            rating: rating,
          }),
        });
        waitNreload("rate");
      };
    }
    // save changes to book's data in DB
    if (action === "save") {
      // todo - Would be great not to reload page but just change content
      const newAuthor = document.querySelector(".newAuthorInput").value;
      const newTitle = document.querySelector(".newTitleInput").value;
      const newPages = document.querySelector(".newPagesInput").value;
      const newDesc = document.querySelector(".newDesc").value;
      fetch(`/edit/${bookid}`, {
        method: "PUT",
        body: JSON.stringify({
          save: true,
          newAuthor: newAuthor,
          newTitle: newTitle,
          newPages: newPages,
          newDesc: newDesc,
        }),
      });
      waitNreload("save");
    }
  };
}

// todo:
function addOrRemoveBook(action) {
  return function () {
    let message;
    const form = document.querySelector(`.modal-form-${action}`);
    showModal(action);
    form.onsubmit = async function (e) {
      e.preventDefault();
      if (action === "add") {
        const year = document.querySelector("#year-input").value;
        const country = document.querySelector("#country-input").value;
        const book = model.state.bookToShow;
        const bookToDB = {
          author: book.author,
          bookid: book.bookid,
          desc: book.desc,
          image: book.image_link,
          pages: book.pages,
          title: book.title,
          country: country,
          year: year,
        };
        await model.addBook(bookToDB);
        message = "Book added";
      }
      if (action === "remove") {
        // todo - add checks
        await model.removeBook(model.state.bookToShow);
        message = "Book removed";
      }
      hideModals();
      showMessage(message);
      showAllBooks_control();
    };
  };
}
