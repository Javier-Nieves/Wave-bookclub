"use strict";
// today gives year
let today = new Date().toISOString().slice(0, 4);
// logged users will see control elements
let isLogged = false;

document.addEventListener("DOMContentLoaded", function () {
  isLogged = tryLogin();
  // capitalize bookclub name
  try {
    const club = document.querySelector(".name-text");
    let clubName = club.innerHTML;
    let capitalized = clubName.charAt(0).toUpperCase() + clubName.substring(1);
    club.innerHTML = capitalized;
  } catch {}

  // ! put all books in the tables
  const switchBtn = document.querySelector(".switch");
  const classicTable = document.querySelector("#classicTable");
  showAllBooks();

  // ! show book info when book2show class element is clicked
  document.addEventListener("click", (e) => {
    const tar = e.target;
    // ? get book id from data attribute in title div => show this book
    if (tar.className.includes("book2show")) {
      if (
        tar.className.includes("container") ||
        tar.className.includes("upcoming-book-container")
      ) {
        loadScreen(true);
        showBook(tar.dataset.bookid);
      }
      loadScreen(true);
      showBook(tar.parentElement.dataset.bookid);
    }
    // change login modal to register and back
    if (tar.className.includes("register-link")) {
      changeRegLink();
    }
  });

  // ! Switch classic and modern tables and styles
  switchBtn.onclick = () => {
    if (classicTable.style.display !== "none") {
      setStyle("modern");
    } else {
      setStyle("classic");
    }
  };

  // ! add meeting date
  const bookid = document.querySelector(".upcoming-book-container").dataset
    .bookid;
  try {
    document.querySelector(".meetingBtn").addEventListener("click", () => {
      makeChange2Book(bookid, "meeting");
    });
  } catch {}

  // ! search the book
  // todo - add search by title and author
  document.querySelector(".search-form").onsubmit = (e) => {
    e.preventDefault();
    loadScreen(true);
    searchBook();
  };

  // ! Enter your bookclub
  try {
    document.querySelector(".enter-btn").onclick = () => {
      const book2change = document.querySelector(".view-title").dataset.bookid;
      showModal("enter");
    };
  } catch {}
  // ! add book to the reading list
  document.querySelector(".add-btn").onclick = () => {
    arrangeCountries("new");
    const book2change = document.querySelector(".view-title").dataset.bookid;
    bookAction(book2change, "add");
  };
  // ! remove book from lists
  document.querySelector(".remove-btn").onclick = () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    bookAction(book2change, "remove");
  };
  // ! edit book
  let book2edit;
  const editBtn = document.querySelector(".edit-btn");
  editBtn.onclick = () => {
    try {
      book2edit = document.querySelector(".view-title").dataset.bookid;
    } catch {}
    if (editBtn.innerHTML === "Edit") {
      editBook();
    } else if (editBtn.innerHTML === "Save") {
      makeChange2Book(book2edit, "save");
    }
  };
  // ! rate book
  document.querySelector(".rate-btn").addEventListener("click", () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    bookAction(book2change, "rate");
  });
  // ! next book selection
  document.querySelector(".next-btn").onclick = () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    makeChange2Book(book2change, "next");
    waitNreload("next");
  };
  // ! logout
  try {
    document.querySelector(".exit-btn").onclick = () => {
      fetch("/logout");
      showMessage("Logged out");
      waitNreload("logout");
    };
  } catch {}

  // ! Show reading list
  const readLink = document.querySelector("#reading-link");
  readLink.onclick = () => {
    showAllBooks();
  };
  // ! Show history
  const histLink = document.querySelector("#history-link");
  histLink.onclick = () => {
    showHistory();
  };

  const title = document.querySelector("#upcoming-title");
  if (title.innerHTML.length > 20) {
    title.style.fontSize = "4vh";
  }
});

function tryLogin() {
  try {
    document.querySelector("#authenticated").value;
    return true;
  } catch {}
  return false;
}

function showAllBooks(message) {
  HideAll();
  document.querySelector(".searchField").value = "";
  loadScreen(true);
  // outside users shouldn't see control elements
  !isLogged && hideControls();

  // is there a backend info?
  try {
    let message = document.querySelector("#message").innerHTML;
    showMessage(message);
    message.innerHTML = "";
  } catch {}

  window.history.pushState("unused", "unused", `/`);

  document.querySelector(".classic-table").innerHTML = "";
  document.querySelector(".modern-table").innerHTML = "";
  document.querySelector(".upcoming-book-container").style.display = "block";

  fetch("allbooks/all")
    .then((response) => response.json())
    .then((books) => {
      books.forEach((book) => {
        if (book.year <= today - 50 && !book.read) {
          fillTableRow(book, "classic");
        } else if (book.year > today - 50 && !book.read) {
          fillTableRow(book, "modern");
        }
      });
      arrangeCountries("main");
      loadScreen(false);
      if (message) {
        showMessage(message);
      }
      // * on page refresh for the book
      let bookRefresh = document.querySelector("#bookid-refresh");
      if (bookRefresh.innerHTML !== "") {
        showBook(bookRefresh.innerHTML);
        bookRefresh.innerHTML = "";
      }
    });
  // ! What's the next book? Set page style accordingly
  let isClassic = true;
  isClassic =
    document.querySelector(".upcoming-book-container").dataset.isclassic <
    today - 50;
  if (isClassic) {
    setStyle("modern");
  } else {
    setStyle("classic");
  }
}

function showMessage(message) {
  document.querySelector("#modalmessage").style.display = "flex";
  document.querySelector(".message-text").innerHTML = message;
  try {
    document.querySelector("#message").innerHTML = "";
  } catch {}
  setTimeout(() => {
    document.querySelector("#modalmessage").style.display = "none";
  }, 2500);
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

function showHistory() {
  loadScreen(true);
  HideAll();
  window.history.pushState("unused", "unused", `/`);

  document.querySelector("#history-view").style.display = "block";
  document.querySelector(".upcoming-book-container").style.display = "block";
  document.querySelector(".history-table").innerHTML = "";

  let yearChange;
  fetch("allbooks/history")
    .then((response) => response.json())
    .then((old_books) => {
      old_books.forEach((item) => {
        if (item.read) {
          if (!yearChange) {
            yearChange = item.meeting_date.slice(0, 4);
          }
          if (item.meeting_date.slice(0, 4) !== yearChange) {
            let CellList = createRow(item, "history");
            CellList[0].innerHTML = `<b>${yearChange}</b>`;
            // add separator Year-row if new year has started
            for (let h = 0; h < CellList.length; h++) {
              CellList[h].classList.add("yearRow");
            }
          }
          yearChange = item.meeting_date.slice(0, 4);
          fillTableRow(item, "history");
        }
      });
      arrangeCountries("history");
      loadScreen(false);
    });
  window.history.pushState(null, null, `/history`);
}

function showBook(book) {
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
      if (isLogged) {
        if (response.year !== undefined) {
          if (response.upcoming) {
            displayButtons("rate", "edit");
          } else if (response.read) {
            displayButtons("edit");
          } else {
            displayButtons("remove", "edit");
            document.querySelector(".simple-text").innerHTML = `from the ${
              response.year <= today - 50 ? "Classic" : "Modern"
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

  window.history.pushState("unused", "unused", `/refresh/${book}`);
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
    // addBtn.style.display = "none";
    removeBtn.style.display = "flex";
    if (!nextBook) {
      nextBtn.style.display = "block";
    }
  }
  if (buttons.includes("rate")) {
    rateBtn.style.display = "block";
  }
  if (buttons.includes("add")) {
    addBtn.style.display = "flex";
  }
  if (buttons.includes("edit")) {
    editBtn.style.display = "block";
  }
}

function searchBook() {
  let title = document.querySelector(".searchField").value;
  window.history.pushState("unused", "unused", `/search`);
  fetch(
    `https://www.googleapis.com/books/v1/volumes?q=+intitle:${title}&maxResults=20`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.totalItems !== 0) {
        showSearchResults(data);
      } else loadScreen(false);
    });
  document.querySelector(".searchField").value = "";
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
    row.className = "table-row classic-body book2show";
    row.dataset.bookid = item.id;
    let cell1 = row.insertCell(0);
    cell1.dataset.bookid = item.id;
    let cell2 = row.insertCell(1);
    cell2.className = "book2show";
    let cell3 = row.insertCell(2);
    cell3.className = "book2show";
    cell1.innerHTML = `<img class='small-pic book2show' src=${link}>`;
    cell2.innerHTML = `${
      item.volumeInfo.authors ? item.volumeInfo.authors[0] : ""
    }`;
    cell3.innerHTML = `${item.volumeInfo.title}`;
  }
  loadScreen(false);
}

function setStyle(style) {
  const links = document.querySelectorAll(".link");
  const switchBtn = document.querySelector(".switch");
  const modernTable = document.querySelector("#modernTable");
  document.querySelector(".switch-container").style.display = "flex";
  if (style === "modern") {
    classicTable.style.display = "none";
    modernTable.style.display = "block";
    document.body.style.backgroundImage =
      "URL('/staticfiles/bookclub/13small.jpg')";
    let img = new Image();
    img.src = "/staticfiles/bookclub/13.jpg";
    img.addEventListener("load", function () {
      document.body.style.backgroundImage =
        "URL('/staticfiles/bookclub/13.jpg')";
    });
    switchBtn.style.backgroundImage =
      "URL('/staticfiles/bookclub/Modern2.png')";
    links.forEach((item) => {
      item.classList.replace("brand", "brandNeon");
    });
  }
  if (style === "classic") {
    classicTable.style.display = "block";
    modernTable.style.display = "none";
    document.body.style.backgroundImage =
      "URL('/staticfiles/bookclub/back2small.jpg')";
    let img = new Image();
    img.src = "/staticfiles/bookclub/back2.jpeg";
    img.addEventListener("load", function () {
      document.body.style.backgroundImage =
        "URL('/staticfiles/bookclub/back2.jpeg')";
    });
    switchBtn.style.backgroundImage =
      "URL('/staticfiles/bookclub/classic2.png')";
    links.forEach((item) => {
      item.classList.replace("brandNeon", "brand");
    });
  }
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
  const image = document.querySelector(".view-image");
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
}

function bookAction(book2change, action) {
  let message;
  let form = document.querySelector(`.modal-form-${action}`);
  showModal(`${action}`);
  form.onsubmit = (e) => {
    e.preventDefault();
    if (action === "enter") {
      console.log("enter club");
    }
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
    if (action === "rate") {
      const rating = document.querySelector("#rating-input").value;
      makeChange2Book(book2change, "rate", rating);
      message = "rate";
    }
    waitNreload(message);
  };
}

function makeChange2Book(bookid, action, rating) {
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
  // choose nest book
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
    fetch(`/edit/${bookid}`, {
      method: "PUT",
      body: JSON.stringify({
        rating: rating,
      }),
    });
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

function finishEditing() {
  const title = document.querySelector(".view-title");
  const author = document.querySelector(".view-author");
  const description = document.querySelector(".view-desc");
  const pages = document.querySelector(".view-pages");
}

function fillTableRow(item, where) {
  let CellList = createRow(item, `${where}`);
  for (let i = 0; i < 6; i++) {
    try {
      CellList[i].className = `cl${i} book2show`;
      if (item.upcoming) {
        CellList[i].classList.add("upcom-book");
      }
    } catch {}
  }
  let param = [item.title, item.author, item.year, item.country, item.pages];
  // history table includes 2 more column - rating
  if (where === "history") {
    param.push(item.rating || "-");
  }
  for (let i = 0; i < param.length; i++) {
    CellList[i].innerHTML = `${param[i]}`;
  }
}

function createRow(item, where) {
  let Table;
  if (where === "history") {
    Table = document.querySelector(".history-table");
  }
  if (where === "classic") {
    Table = document.querySelector(".classic-table");
  }
  if (where === "modern") {
    Table = document.querySelector(".modern-table");
  }
  const row = Table.insertRow(0);
  row.className = `table-row ${where}-body book2show`;
  try {
    row.dataset.bookid = item.bookid;
  } catch {}
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);
  const cell3 = row.insertCell(2);
  const cell4 = row.insertCell(3);
  const cell5 = row.insertCell(4);
  const CellList = [cell1, cell2, cell3, cell4, cell5];
  if (where === "history") {
    const cell6 = row.insertCell(5);
    CellList.push(cell6);
  }
  return CellList;
}

function loadScreen(bool) {
  const loadScreen = document.querySelector("#load-screen");
  if (bool) loadScreen.style.display = "block";
  else loadScreen.style.display = "none";
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
    if (rows[i].cells[0].className.includes("yearRow")) {
      rows[i].remove();
    }
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
    showAllBooks(message);
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

function HideAll() {
  document.querySelector(".switch-container").style.display = "none";
  document.querySelector(".upcoming-book-container").style.display = "none";
  document.querySelector("#modernTable").style.display = "none";
  document.querySelector("#classicTable").style.display = "none";
  document.querySelector("#book-view").style.display = "none";
  document.querySelector("#history-view").style.display = "none";
  document.querySelector("#search-results").style.display = "none";
  document.querySelector(".control-group").style.display = "none";
  document.querySelector(".rate-btn-container").style.display = "none";
  document.querySelector(".view-rating").style.display = "none";
  document.querySelector("#year-input").value = "";
  document.querySelector("#country-input").value = "";
  // in case Edit function wasn't completed:
  try {
    // todo - use selectorAll and for loop
    document.querySelector(".newTitleInput").remove();
    document.querySelector(".newAuthorInput").remove();
    document.querySelector(".newPagesInput").remove();
    document.querySelector(".newDesc").remove();
    document.querySelector(".view-title").style.display = "block";
    document.querySelector(".view-author").style.display = "block";
    document.querySelector(".view-desc").style.display = "block";
    document.querySelector(".view-pages").style.display = "block";
    document.querySelector(".book-info").style.overflow = "auto";
    const editBtn = document.querySelector(".edit-btn");
    editBtn.classList.remove("save-btn");
    editBtn.innerHTML = "Edit";
  } catch {}
}

function hideModals() {
  document.querySelector(".modal").style.display = "none";
  document.querySelector("#modalenter").style.display = "none";
  document.querySelector("#modaladd").style.display = "none";
  document.querySelector("#modalremove").style.display = "none";
  document.querySelector("#modalrate").style.display = "none";
}

function hideControls() {
  document.querySelector(".control-group").style.display = "none";
  document.querySelector(".add-date-container").style.display = "none";
}

// ! history (back button) action
window.addEventListener("popstate", function (event) {
  // The popstate event is fired each time when the current history entry changes.
  // window.location = document.referrer;
  if (window.location.href.slice(-7) === "history") {
    showHistory();
  }
  if (window.location.href.slice(-1) === "/") {
    showAllBooks();
  }
  if (window.location.href.slice(-6) === "search") {
    searchBook();
  }
  if (window.location.href.slice(-20, -13) === "refresh") {
  }
});

function arrangeCountries(section) {
  const option = document.querySelector("option");
  // if options aren't filled yet:
  if (!option) {
    let countries = [];
    let flags = [];
    let table;
    fetch(`https://restcountries.com/v3.1/all?fields=name,flags`)
      .then((response) => response.json())
      .then((result) => {
        result.forEach((country) => {
          // create lists of countries and their flags
          countries.push(country.name.common);
          flags.push(country.flags.png);
        });
        changeCountries(countries);

        if (section === "history") {
          table = document.querySelector(".history-table");
          fillFlags(table, countries, flags);
        } else if (section === "main") {
          table = document.querySelector(".classic-table");
          fillFlags(table, countries, flags);
          table = document.querySelector(".modern-table");
          fillFlags(table, countries, flags);
        } else if (section === "new") {
          const countryInput = document.getElementById("country-input");
          const countryList = document.getElementById("countryList");
          // Populate the datalist options
          countries.forEach(function (country) {
            let option = document.createElement("option");
            option.value = country;
            countryList.appendChild(option);
          });
          // validate input
          countryInput.addEventListener("change", function (event) {
            let selectedCountry = event.target.value;
            console.log(selectedCountry);
            let isValidCountry = countries.includes(selectedCountry);
            console.log(countries.includes(selectedCountry));
            if (!isValidCountry) {
              event.target.setCustomValidity("Please select a valid country");
            }
          });
        }
      });
  }

  function fillFlags(table, countries, flags) {
    const rows = table.rows;
    let flag;
    for (let k = 0; k < rows.length; k++) {
      let cellValue = rows[k].cells[3].innerHTML;
      for (let p = 0; p < countries.length; p++) {
        if (cellValue === countries[p]) {
          flag = flags[p];
          rows[k].cells[3].innerHTML = `
            <div class='flagContainer'>
              <div>${cellValue}</div>
              <img src="${flag}" class='smallFlag'>
            </div>`;
        }
      }
    }
  }
}

function changeCountries(countries) {
  for (let i = 0; i < countries.length; i++) {
    if (countries[i] === "United States") {
      countries[i] = "USA";
    }
    if (countries[i] === "United Kingdom") {
      countries[i] = "UK";
    }
  }
}
