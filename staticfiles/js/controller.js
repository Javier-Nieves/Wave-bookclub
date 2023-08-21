import * as model from "./model.js";
import { loadScreen, showMessage, hideModals } from "./helpers.js";
import showHistory from "./historyView.js";
import { showBook, bookSummon, bookBtnsFunctions } from "./bookView.js";
// prettier-ignore
import { showAllBooks, setStyle, NavBtnsFunction, meetingBtnFunction,
        sessionBtnsFunction, showModal, showNewDate } from "./mainView.js";
// prettier-ignore
import { activateSearchForm, activatePagination, 
        showSearchResults, currentPage } from "./searchView.js";

// TODO - fill all views in functions, without Django

checkMessages();
loadView();
Btns_control();
window.addEventListener("popstate", loadView);

function Btns_control() {
  try {
    // mainView functions
    NavBtnsFunction(showAllBooks_control, showHistory_control);
    sessionBtnsFunction(logoutSequence);
    meetingBtnFunction(meetingBook);
    // searchView
    activateSearchForm(searchBook_control); // todo - add search by author
    // bookView functions
    bookSummon(showBook_contol);
    bookBtnsFunctions(
      addOrRemoveBook("add"),
      addOrRemoveBook("remove"),
      saveBook,
      nextBook,
      rateBook
    );
  } catch (err) {
    console.error("🚧 Error in button function:", err.message);
    showMessage("Something went wrong :(");
  }
}

async function loadView() {
  try {
    loadScreen(true);
    await model.getAllBooks();
    setStyle();
    const url = window.location.href;
    (url.slice(-1) === "/" ||
      url.includes("logout") ||
      url.includes("login")) &&
      showAllBooks_control();
    url.includes("history") && showHistory_control();
    url.includes("search") &&
      searchBook_control(url.slice(url.lastIndexOf("/") + 1));
    url.includes("show") &&
      showBook_contol(url.slice(url.lastIndexOf("/") + 1));
  } catch (err) {
    console.error("🚧 Error in loadView:", err.message);
    showMessage("Something went wrong :(");
  } finally {
    loadScreen(false);
  }
}

function showAllBooks_control() {
  showAllBooks(model.state);
  model.fillFlags("main");
  window.history.pushState("_", "_", `/`);
}

function showHistory_control() {
  showHistory(model.state.historyBooks);
  model.fillFlags("history");
  window.history.pushState("_", "_", `/history`);
}

async function showBook_contol(id) {
  try {
    loadScreen(true);
    await model.getBook(id);
    showBook(model.state.bookToShow);
    window.history.pushState("_", "_", `/show/${id}`);
  } catch (err) {
    console.error("🚧 Error in showBook:", err.message);
    showMessage("Something went wrong :(");
  } finally {
    loadScreen(false);
  }
}

async function searchBook_control(title) {
  try {
    loadScreen(true);
    const data = await model.searchBooks(title, currentPage);
    if (data.totalItems == 0) return;
    showSearchResults(data);
    activatePagination(searchBook_control);
    window.history.pushState("_", "_", `/search/${title}`);
  } catch (err) {
    console.error("🚧 Error in search:", err.message);
    showMessage("Something went wrong :(");
  } finally {
    loadScreen(false);
  }
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
  window.location.reload();
}

function rateBook() {
  try {
    showModal("rate");
    const form = document.querySelector(".modal-form-rate");
    form.onsubmit = async function (e) {
      e.preventDefault();
      const rating = document.querySelector("#rating-input").value;
      await model.changeDB({ rating: rating });
      showMessage("Book is rated!");
      hideModals();
      showAllBooks_control();
    };
  } catch (err) {
    console.error("🚧 Error in rating:", err.message);
    showMessage("Something went wrong :(");
  }
}

async function nextBook() {
  try {
    model.state.upcommingBook = model.state.bookToShow;
    await model.changeDB({ next: true });
    showMessage("Next book is selected");
    showAllBooks_control();
  } catch (err) {
    console.error("🚧 Error in next book selection:", err.message);
    showMessage("Something went wrong :(");
  }
}

async function saveBook() {
  try {
    const newAuthor = document.querySelector(".newAuthorInput").value;
    const newTitle = document.querySelector(".newTitleInput").value;
    const newPages = document.querySelector(".newPagesInput").value;
    const newDesc = document.querySelector(".newDesc").value;
    const body = {
      save: true,
      newAuthor: newAuthor,
      newTitle: newTitle,
      newPages: newPages,
      newDesc: newDesc,
    };
    await model.changeDB(body);
    model.state.upcommingBook = model.state.bookToShow;
    showMessage("Changes are saved");
    // todo - ugly finish
    showBook(model.state.bookToShow);
  } catch (err) {
    console.error("🚧 Can't edit the book:", err.message);
    showMessage("Something went wrong :(");
  }
}

function meetingBook() {
  try {
    document.querySelector(".meetingField").style.display = "block";
    // prettier-ignore
    document.querySelector(".add-date-container").onsubmit = async function (e) {
      e.preventDefault();
      const date = document.querySelector(".meetingField").value;
      await model.changeDB({ meeting: date });
      showMessage("Date is selected");
      hideModals();
      showNewDate(date);
    };
  } catch (err) {
    console.error("🚧 Can't add new meeting date:", err.message);
    showMessage("Something went wrong :(");
  }
}

function addOrRemoveBook(action) {
  return function () {
    try {
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
          await model.removeBook(model.state.bookToShow);
          message = "Book removed";
        }
        hideModals();
        showMessage(message);
        showAllBooks_control();
      };
    } catch (err) {
      // todo - for some reason error from Add and Remove can't be caught here
      // console.log("throwing 2");
      throw err;
    }
  };
}
