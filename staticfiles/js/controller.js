import { loadScreen, showMessage, hideModals } from "./helpers.js";
import * as model from "./model.js";
import * as mainView from "./mainView.js";
import * as bookView from "./bookView.js";
import * as searchView from "./searchView.js";
import showHistory from "./historyView.js";

checkMessages();
await loadView();
btnsControl();
!model.Authenticated() && bookView.hideControls();
window.addEventListener("popstate", loadView);

function btnsControl() {
  try {
    mainView.NavBtnsFunction(showAllBooks_control, showHistory_control);
    mainView.sessionBtnsFunction(logoutSequence);
    mainView.meetingBtnFunction(meetingBook);
    searchView.activateSearchForm(searchBook_control); // todo - add search by author
    bookView.bookSummon(showBook_contol);
    bookView.bookBtnsFunctions(
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

async function loadView(location = undefined) {
  try {
    loadScreen(true);
    await model.getAllBooks();
    mainView.setStyle();
    const goTo = location || window.location.href;
    // prettier-ignore
    (goTo.slice(-1) === "/" || goTo.includes("logout") || goTo.includes("login")) &&
      showAllBooks_control();
    goTo.includes("history") && showHistory_control();
    goTo.includes("search") && searchBook_control(model.state.search.query);
    goTo.includes("show") &&
      showBook_contol(goTo.slice(goTo.lastIndexOf("/") + 1));
  } catch (err) {
    console.error("🚧 Error in loadView:", err.message);
    showMessage("Something went wrong :(");
  } finally {
    loadScreen(false);
  }
}

function showAllBooks_control() {
  mainView.showAllBooks(model.state);
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
    bookView.showBook(model.state.bookToShow);
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
    await model.searchBooks(title, searchView.currentPage);
    if (model.state.search.results.totalItems === 0) return;
    searchView.showSearchResults(model.state.search.results);
    searchView.activatePagination(searchBook_control);
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
    mainView.showModal("rate");
    const form = document.querySelector(".modal-form-rate");
    form.onsubmit = async function (e) {
      e.preventDefault();
      const rating = document.querySelector("#rating-input").value;
      await model.changeDB({ rating: rating });
      bookView.clearUpcomBook();
      showMessage("Book is rated!");
      hideModals();
      loadView("/");
    };
  } catch (err) {
    console.error("🚧 Error in rating book:", err.message);
    showMessage("Something went wrong :(");
  }
}

async function nextBook() {
  try {
    await model.changeDB({ next: true });
    showMessage("Next book is selected");
    await loadView("/");
  } catch (err) {
    console.error("🚧 Error in next book selection:", err.message);
    showMessage("Something went wrong :(");
  }
}

async function saveBook() {
  try {
    const newInfo = bookView.bookChange();
    await model.changeDB(newInfo);
    showMessage("Changes are saved");
    // todo - ugly finish
    bookView.showBook(model.state.bookToShow);
  } catch (err) {
    console.error("🚧 Can't edit the book:", err.message, err);
    showMessage("Something went wrong :(");
  }
}

async function meetingBook() {
  try {
    const date = document.querySelector(".meetingField").value;
    await model.changeDB({ meeting: date });
    showMessage("Date is selected");
    hideModals();
    mainView.showNewDate(date);
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
      mainView.showModal(action);
      form.onsubmit = async function (e) {
        e.preventDefault();
        if (action === "add") {
          const year = document.querySelector("#year-input").value;
          const country = document.querySelector("#country-input").value;
          const book = model.state.bookToShow;
          const bookToDB = {
            author: book.author,
            bookid: book.bookid,
            desc: book.desc || "-",
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
        loadView("/");
      };
    } catch (err) {
      // todo - for some reason error from Add and Remove can't be caught here
      // console.log("throwing 2");
      throw err;
    }
  };
}
