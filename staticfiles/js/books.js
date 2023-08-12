// prettier-ignore
import { showAllBooks, setStyle, NavBtnsFunction, meetingBtnFunction,
          sessionBtnsFunction, showModal } from "./mainView.js";
import { showHistory } from "./historyView.js";
// prettier-ignore
import { showBook, bookSummon, bookBtnsFunctions } from "./bookView.js";
import { getJSON, fillFlags, createBook } from "./model.js";
import { loadScreen, HideAll, showMessage } from "./helpers.js";

checkMessages();
loadView();
Btns_control();
window.addEventListener("popstate", loadView);

function Btns_control() {
  // mainView functions
  NavBtnsFunction(showAllBooks_control, showHistory_control);
  sessionBtnsFunction(logoutSequence, changeRegLink);
  meetingBtnFunction(changeBookDB("meeting"));
  // bookView functions
  bookSummon(showBook_contol);
  bookBtnsFunctions(
    addOrRemoveBook("add"),
    addOrRemoveBook("remove"),
    editBook,
    changeBookDB("next"),
    changeBookDB("rate")
  );
  // todo - search view
  activateSearchForm(); // todo - add search by author
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

function activateSearchForm() {
  document.querySelector(".search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    searchBook();
  });
}

async function showAllBooks_control() {
  // todo - add try-catch, error throwing
  loadScreen(true);
  const books = await getJSON("/allbooks/all");
  showAllBooks(books);
  fillFlags("main");
  loadScreen(false);
}

async function showHistory_control() {
  loadScreen(true);
  const oldBooks = await getJSON("/allbooks/history");
  showHistory(oldBooks);
  fillFlags("history");
  loadScreen(false);
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

function searchBook() {
  loadScreen(true);
  let title = document.querySelector(".searchField").value;
  window.history.pushState("_", "_", `/search`);
  fetch(
    // todo - pagination
    `https://www.googleapis.com/books/v1/volumes?q=+intitle:${title}&maxResults=20`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.totalItems !== 0) {
        showSearchResults(data);
      } else loadScreen(false);
    });
}

function showSearchResults(response) {
  HideAll();
  document.querySelector("#search-results").style.display = "block";
  const SearchTable = document.querySelector(".search-table");
  SearchTable.innerHTML = "";

  for (let i = 0; i < response.items.length; i++) {
    let link;
    let item = response.items[i];
    try {
      link = item.volumeInfo.imageLinks.smallThumbnail;
    } catch {
      link = "/staticfiles/bookclub/club2.png";
    }
    // creatig new row in table on 1st position
    let row = SearchTable.insertRow();
    row.className = "table-row classic-body dataContainer";
    row.dataset.bookid = item.id;
    let cell1 = row.insertCell(0);
    // cell1.dataset.bookid = item.id;
    let cell2 = row.insertCell(1);
    // cell2.className = "book2show";
    let cell3 = row.insertCell(2);
    // cell3.className = "book2show";
    cell1.innerHTML = `<img class='small-pic' src=${link}>`;
    cell2.innerHTML = `${
      item.volumeInfo.authors ? item.volumeInfo.authors[0] : ""
    }`;
    cell3.innerHTML = `${item.volumeInfo.title}`;
  }
  loadScreen(false);
}

function editBook() {
  const title = document.querySelector(".view-title");
  const author = document.querySelector(".view-author");
  const desc = document.querySelector(".view-desc");
  // const image = document.querySelector(".view-image");
  let pages = document.querySelector(".view-pages");
  try {
    document.querySelector(".view-rating").style.display = "none";
  } catch {}
  const info = document.querySelector(".book-info");
  const heig = info.offsetHeight;
  const wid = info.offsetWidth;
  info.style.height = `${heig + 200}px`;
  const newTitle = document.createElement("input");
  newTitle.value = title.innerHTML;
  newTitle.className = "newTitleInput";
  newTitle.style.width = `${wid - 40}px`;
  title.parentElement.prepend(newTitle);
  title.style.display = "none";
  const newAuthor = document.createElement("input");
  newAuthor.value = author.innerHTML;
  newAuthor.className = "newAuthorInput";
  author.parentElement.prepend(newAuthor);
  author.style.display = "none";
  const newPages = document.createElement("input");
  newPages.value = pages.innerHTML;
  newPages.className = "newPagesInput";
  newPages.setAttribute("type", "number");
  pages.parentElement.append(newPages);
  pages.style.display = "none";
  const newDesc = document.createElement("textarea");
  newDesc.className = "newDesc";
  newDesc.innerHTML = desc.innerText;
  desc.parentElement.append(newDesc);
  desc.style.display = "none";
  const editBtn = document.querySelector(".edit-btn");
  editBtn.classList.add("save-btn");
  editBtn.innerHTML = "Save";
  editBtn.removeEventListener("click", editBook);
  editBtn.addEventListener("click", changeBookDB("save"));
}

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
  for (let i = 0; i < rows.length - 1; i++) {
    if (rows[i].cells[0].className.includes("yearRow")) rows[i].remove();
  }
}

function waitNreload(message) {
  const reloadList = ["rate", "next", "logout", "save"];
  if (reloadList.includes(message)) {
    document.querySelector("#modalmessage").style.display = "flex";
    document.querySelector(".message-text").innerHTML = `${
      message === "logout" ? "Logged out" : "Updated"
    }`;
    setTimeout(function () {
      window.location.reload();
    }, 800);
    return;
  }
  // some time is needed to update DB
  setTimeout(() => {
    showAllBooks_control();
    showMessage(message);
  }, 600);
  hideModals();
}

function changeRegLink() {
  const RegLink = document.querySelector(".register-link");
  const RegText = document.querySelector("#register-text");
  const EnterForm = document.querySelector(".modal-form-enter");
  const RegForm = document.querySelector(".modal-form-register");
  const header = document.querySelector("#register-text-header");
  const container = document.querySelector(".modal-content");
  if (RegLink.innerHTML === "Register") {
    RegText.innerHTML = "Already have a bookclub?";
    RegLink.innerHTML = "Login";
    EnterForm.style.display = "none";
    RegForm.style.display = "flex";
    header.innerHTML = "Create new bookclub:";
    container.style.backgroundColor = "rgba(69, 70, 24, 0.523)";
  } else {
    RegText.innerHTML = "Again!?";
    RegLink.innerHTML = "Register";
    EnterForm.style.display = "flex";
    RegForm.style.display = "none";
    header.innerHTML = "Your bookclub:";
    container.style.backgroundColor = "rgba(59, 59, 59, 0.694)";
  }
}

function hideModals() {
  [".modal", "#modalenter", "#modaladd", "#modalremove", "#modalrate"].map(
    (elem) => (document.querySelector(elem).style.display = "none")
  );
}

function loadView() {
  setStyle();
  const url = window.location.href;
  if (url.includes("logout") || url.includes("login")) {
    window.history.pushState("_", "_", `/`);
    showAllBooks_control();
  }
  if (url.includes("history")) showHistory_control();
  url.includes("search") && searchBook();
  url.includes("refresh") &&
    showBook_contol(url.slice(url.lastIndexOf("/") + 1));
  url.slice(-1) === "/" && showAllBooks_control();
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
