// prettier-ignore
import { showAllBooks, setStyle, NavBtnsFunction, meetingBtnFunction,
          sessionBtnsFunction, showModal } from "./mainView.js";
import showHistory from "./historyView.js";
import { activateSearchForm, showSearchResults } from "./searchView.js";
// prettier-ignore
import { showBook, bookSummon, bookBtnsFunctions } from "./bookView.js";
import { getJSON, fillFlags, createBook, searchBooks } from "./model.js";
import { loadScreen, showMessage, waitNreload } from "./helpers.js";

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

function loadView() {
  setStyle();
  const url = window.location.href;
  (url.slice(-1) === "/" || url.includes("logout") || url.includes("login")) &&
    showAllBooks_control();
  url.includes("history") && showHistory_control();
  url.includes("search") && searchBook_control();
  url.includes("refresh") &&
    showBook_contol(url.slice(url.lastIndexOf("/") + 1));
}

async function showAllBooks_control() {
  // todo - add try-catch, error throwing
  loadScreen(true);
  const books = await getJSON("/allbooks/all");
  showAllBooks(books);
  fillFlags("main");
  loadScreen(false);
  window.history.pushState("_", "_", `/`);
}

async function showHistory_control() {
  loadScreen(true);
  const oldBooks = await getJSON("/allbooks/history");
  showHistory(oldBooks);
  fillFlags("history");
  loadScreen(false);
  window.history.pushState("_", "_", `/history`);
}

async function showBook_contol(id) {
  loadScreen(true);
  let book = await getJSON(`/check/${id}`);
  // if book isn't in the DB - get data from API
  if (!book.year) book = await createBook(id);
  showBook(book);
  loadScreen(false);
  window.history.pushState("_", "_", `/refresh/${id}`);
}

async function searchBook_control(title) {
  // todo - pagination
  loadScreen(true);
  const data = await searchBooks(title);
  if (data.totalItems == 0) return;
  showSearchResults(data);
  loadScreen(false);
  window.history.pushState("_", "_", `/search`);
  // todo - refresh for /search
}

// ! sorting tables
document.addEventListener("click", (event) => {
  let label;
  const sortTar = event.target;
  const whichSort = sortTar.className;
  try {
    label = sortTar.parentElement.dataset.table;
  } catch {}
  // which table will be sorted
  let table = document.querySelector(`.${label}-table`);

  if (whichSort.includes("Up") || whichSort.includes("Down")) {
    loadScreen(true);
    sortTable(table, whichSort);
  }
  //  switch class after sorting table
  if (whichSort.includes("Up")) sortTar.classList.replace("Up", "Down");
  else sortTar.classList.replace("Down", "Up");
});

// todo - update
function sortTable(table, whichSort) {
  let rows, switching, i, x, y, mem, shouldSwitch;
  switching = true;
  deleteYearRows(table.rows);

  while (switching) {
    switching = false;
    rows = table.rows;

    for (i = 0; i < rows.length - 1; i++) {
      shouldSwitch = false;
      // * sorting parameter determination
      for (let p = 0; p < 6; p++) {
        if (whichSort.includes(`cl${p}`)) {
          mem = p;
          x = rows[i].cells[p].innerHTML;
          y = rows[i + 1].cells[p].innerHTML;
        }
      }
      // * direction determination. 4 - is a number of "pages" column, which is sorted wrong otherwise..
      if (whichSort.includes("Up")) {
        if ((mem === 4 ? parseInt(x) : x) < (mem === 4 ? parseInt(y) : y)) {
          shouldSwitch = true;
          break;
        }
      } else if (whichSort.includes("Down")) {
        if ((mem === 4 ? parseInt(x) : x) > (mem === 4 ? parseInt(y) : y)) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
  loadScreen(false);
}

function deleteYearRows(rows) {
  for (let i = 0; i < rows.length - 1; i++)
    if (rows[i].cells[0].className.includes("yearRow")) rows[i].remove();
}

function checkMessages() {
  const message = document.querySelector("#message");
  if (!message) return;
  showMessage(message.innerHTML);
  message.innerHTML = "";
}

function logoutSequence() {
  fetch("/logout");
  localStorage.removeItem("loggedIn");
  showMessage("Logged out");
  waitNreload("logout");
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
    const book2change = document.querySelector(".view-title").dataset.bookid;
    let message;
    const form = document.querySelector(`.modal-form-${action}`);
    showModal(`${action}`);
    form.onsubmit = (e) => {
      e.preventDefault();
      if (action === "add") {
        const year = document.querySelector("#year-input").value;
        const country = document.querySelector("#country-input").value;
        const title = document.querySelector(".view-title").innerHTML;
        const author = document.querySelector(".view-author").innerHTML;
        const desc = document.querySelector(".view-desc").innerHTML;
        const image = document.querySelector(".view-image").src;
        let pages = document.querySelector(".view-pages").innerHTML;
        // figure out
        pages = pages.replace(/[^0-9]/g, "");
        fetch(`/add/${book2change}`, {
          method: "POST",
          body: JSON.stringify({
            year: year,
            country: country,
            title: title,
            author: author,
            desc: desc,
            image: image,
            pages: pages,
          }),
        });
        message = "Book added";
      }
      if (action === "remove") {
        fetch(`/${action}/${book2change}`);
        message = "Book removed";
      }
      waitNreload(message);
    };
  };
}
