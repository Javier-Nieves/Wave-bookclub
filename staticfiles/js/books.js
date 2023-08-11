import { showAllBooks, setStyle } from "./mainView.js";
// prettier-ignore
import { getJSON, getCountryList, Authenticated, fillFlags } from "./model.js";
import { showHistory } from "./historyView.js";
// prettier-ignore
import { CLASSIC_LIMIT, loadScreen, HideAll, resizeTitle, 
          capitalizeName, showMessage } from "./helpers.js";

Authenticated();
checkMessages();
loadView();
handleClicks();
activateSearchForm(); // todo - add search by author
NavBtnsFunction();
bookBtnsFunctions();
switchBtnFunction();
meetingBtnFunction();
sessionBtnsFunction();
capitalizeName();
resizeTitle();
window.addEventListener("popstate", loadView);

function handleClicks() {
  // prettier-ignore
  [".search-table", ".classic-table", ".modern-table", ".history-table", ".upcoming-book-container"]
  .forEach((item) => document.querySelector(item).addEventListener("click", (e) => 
    showBook(e.target.closest(".dataContainer").dataset.bookid)
  ));
  // change login modal to register and back
  document.querySelector(".register-link").addEventListener("click", (e) => {
    e.preventDefault();
    changeRegLink();
  });
}

function checkMessages() {
  const message = document.querySelector("#message");
  if (!message) return;
  showMessage(message.innerHTML);
  message.innerHTML = "";
}

function NavBtnsFunction() {
  const readLink = document.querySelector("#reading-link");
  const histLink = document.querySelector("#history-link");
  readLink.addEventListener("click", showAllBooks_control);
  histLink.addEventListener("click", showHistory_control);
}

function bookBtnsFunctions() {
  document
    .querySelector(".add-btn")
    .addEventListener("click", () => addOrRemoveBook("add"));
  // prettier-ignore
  document.querySelector(".remove-btn").addEventListener('click',() => addOrRemoveBook("remove"));

  // edit book info
  const editBtn = document.querySelector(".edit-btn");
  editBtn.addEventListener("click", editBook);
  // select next book
  document.querySelector(".next-btn").addEventListener("click", () => {
    changeBookDB("next");
    waitNreload("next");
  });
  // prettier-ignore
  document.querySelector(".rate-btn").addEventListener("click", () => changeBookDB("rate"));
}

function switchBtnFunction() {
  const switchBtn = document.querySelector(".switch");
  switchBtn.addEventListener("click", () => setStyle(true));
}

function meetingBtnFunction() {
  // prettier-ignore
  const bookid = document.querySelector(".upcoming-book-container").dataset.bookid;
  document
    .querySelector(".meetingBtn")
    ?.addEventListener("click", () => changeBookDB(bookid, "meeting"));
}

function sessionBtnsFunction() {
  // prettier-ignore
  document.querySelector(".enter-btn")?.addEventListener("click", () => showModal("enter"));
  document.querySelector(".exit-btn")?.addEventListener("click", () => {
    fetch("/logout");
    localStorage.removeItem("loggedIn");
    showMessage("Logged out");
    waitNreload("logout");
  });
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
  !Authenticated() && hideControls();
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

function showBook(book) {
  loadScreen(true);
  HideAll();
  document.querySelector("#book-view").style.display = "flex";

  fetch(`/check/${book}`)
    .then((response) => response.json())
    .then((response) => {
      if (response.year !== undefined) {
        // if DB entry exists - show data
        fillData(response, "DB");
      } else {
        // if book isn't in DB - send API
        fillData(book, "API");
      }
      // manage buttons on page
      if (localStorage.getItem("loggedIn")) {
        if (response.year !== undefined) {
          if (response.upcoming) {
            displayButtons("rate", "edit");
          } else if (response.read) {
            displayButtons("edit");
          } else {
            displayButtons("remove", "edit");
            document.querySelector(".simple-text").innerHTML = `from the ${
              response.year <= CLASSIC_LIMIT ? "Classic" : "Modern"
            } reading list`;
          }
        } else {
          displayButtons("add");
        }
      } else {
        displayButtons();
      }
      loadScreen(false);
    });

  window.history.pushState("_", "_", `/refresh/${book}`);
}

function fillData(book, source) {
  const title = document.querySelector(".view-title");
  const author = document.querySelector(".view-author");
  const description = document.querySelector(".view-desc");
  const image = document.querySelector(".view-image");
  const control = document.querySelector(".control-group");
  const pages = document.querySelector(".view-pages");
  const rating = document.querySelector(".view-rating");

  if (source === "DB") {
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
  if (source === "API") {
    fetch(`https://www.googleapis.com/books/v1/volumes/${book}`)
      .then((response) => response.json())
      .then((book) => {
        const volumeInfo = book.volumeInfo;
        title.innerHTML = volumeInfo.title || "no title";
        title.dataset.bookid = book.id;
        // todo - place for improvement:
        author.innerHTML = "no author";
        try {
          author.innerHTML = volumeInfo.authors[0];
        } catch {}
        pages.innerHTML = `${volumeInfo.pageCount}` || "no pages";
        // * image for book cover
        let imgUrl = "/staticfiles/bookclub/club2.png";
        try {
          imgUrl = volumeInfo.imageLinks.thumbnail;
        } catch {}
        control.style.display = "flex";
        image.src = imgUrl;
        description.innerHTML =
          volumeInfo.description || "no description available";
      });
  }
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
    removeBtn.style.display = "flex";
    if (!nextBook) nextBtn.style.display = "block";
  }
  if (buttons.includes("rate")) rateBtn.style.display = "block";
  if (buttons.includes("add")) addBtn.style.display = "flex";
  if (buttons.includes("edit")) editBtn.style.display = "block";
}

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

function showModal(action) {
  const close = document.querySelector(".close");
  const modal = document.querySelector(".modal");
  modal.style.display = "block";
  document.querySelector(`#modal${action}`).style.display = "block";
  close.onclick = () => {
    modal.style.display = "none";
    document.querySelector(`#modal${action}`).style.display = "none";
  };
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      document.querySelector(`#modal${action}`).style.display = "none";
    }
  };
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
  editBtn.addEventListener("click", () => changeBookDB("save"));
}

function addOrRemoveBook(action) {
  getCountryList("new");
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
}

function changeBookDB(action) {
  const bookid = document.querySelector(".view-title").dataset.bookid;
  // create meeting date
  if (action === "meeting") {
    const meetingBtn = document.querySelector(".meetingBtn");
    document.querySelector(".meetingField").style.display = "block";
    // input will appear on first click
    meetingBtn.addEventListener("click", () => {
      const date = document.querySelector(".meetingField").value;
      document.querySelector(".add-date-container").onsubmit = (e) => {
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
      };
    });
  }
  // choose next book
  if (action === "next") {
    fetch(`/edit/${bookid}`, {
      method: "PUT",
      body: JSON.stringify({
        next: true,
      }),
    });
  }
  // rate current book
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
    showAllBooks();
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

function hideControls() {
  document.querySelector(".control-group").style.display = "none";
  try {
    document.querySelector(".add-date-container").style.display = "none";
  } catch {
    console.log("no date container");
  }
}

function loadView() {
  setStyle();
  const url = window.location.href;
  if (url.includes("logout") || url.includes("login")) {
    window.history.pushState("_", "_", `/`);
    showAllBooks_control();
  }
  url.includes("history") && showHistory_control();
  url.includes("search") && searchBook();
  url.includes("refresh") && showBook(url.slice(url.lastIndexOf("/") + 1));
  url.slice(-1) === "/" && showAllBooks_control();
}
