"use strict";
// today gives year
let today = new Date().toISOString().slice(0, 4);
let isLogged = false;

document.addEventListener("DOMContentLoaded", function () {
  // outside users shouldn't see control elements
  isLogged && hideControls();

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
  // todo
  document.querySelector(".enter-btn").onclick = () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    bookAction(book2change, "enter");
  };
  // ! add book to the reading list
  document.querySelector(".add-btn").onclick = () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    bookAction(book2change, "add");
  };
  // ! remove book from lists
  document.querySelector(".remove-btn").onclick = () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    bookAction(book2change, "remove");
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
    waitNreload("reload");
  };

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

function showAllBooks(message) {
  HideAll();
  loadScreen(true);

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
      loadScreen(false);
      if (message) {
        showMessage(message);
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
        loadScreen(false);
      });
    });
  window.history.pushState(null, null, `/history`);
}

function showBook(book) {
  HideAll();
  document.querySelector("#book-view").style.display = "flex";
  const rating = document.querySelector(".view-rating");

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
      if (response.year !== undefined) {
        if (response.rating) {
          rating.style.display = "block";
          rating.innerHTML = response.rating;
        }
        if (response.upcoming) {
          displayButtons(response, "rate");
        } else if (response.read) {
          displayButtons();
        } else {
          displayButtons(response, "remove");
        }
      } else {
        displayButtons(response, "add");
      }
      loadScreen(false);
    });

  window.history.pushState("unused", "unused", `/check/${book}`);
}

function fillData(book, source) {
  const title = document.querySelector(".view-title");
  const author = document.querySelector(".view-author");
  const description = document.querySelector(".view-desc");
  const image = document.querySelector(".view-image");
  const control = document.querySelector(".control-group");
  const pages = document.querySelector(".view-pages");
  if (source === "DB") {
    control.style.display = "flex";
    title.innerHTML = book.title;
    title.dataset.bookid = book.bookid;
    author.innerHTML = book.author;
    pages.innerHTML = `Page count: ${book.pages}`;
    description.innerHTML = book.desc;
    image.src = book.image_link;
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
        pages.innerHTML = `Page count: ${volumeInfo.pageCount}` || "no pages";
        // * image for book cover
        let imgUrl = "static/bookclub/club2.png";
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

function displayButtons(response, ...buttons) {
  const removeBtn = document.querySelector(".remove-btn-container");
  const addBtn = document.querySelector(".add-btn");
  const rateBtn = document.querySelector(".rate-btn-container");
  const nextBtn = document.querySelector(".next-btn");
  const nextBook = document.querySelector(".upcoming-book-container").dataset
    .bookid;
  removeBtn.style.display = "none";
  addBtn.style.display = "none";
  rateBtn.style.display = "none";
  nextBtn.style.display = "none";

  if (!response) {
  } else if (buttons.includes("remove")) {
    addBtn.style.display = "none";
    document.querySelector(".simple-text").innerHTML = `from the ${
      response.year <= today - 50 ? "Classic" : "Modern"
    } reading list`;
    removeBtn.style.display = "flex";
    if (!nextBook) {
      nextBtn.style.display = "block";
    }
  } else if (buttons.includes("rate")) {
    rateBtn.style.display = "block";
  } else if (buttons.includes("add")) {
    addBtn.style.display = "flex";
  }
}

function searchBook() {
  let title = document.querySelector(".searchField").value;
  fetch(
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
      link = "static/bookclub/club2.png";
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
    document.body.style.backgroundImage = 'URL("/static/bookclub/13.jpeg")';
    switchBtn.style.backgroundImage = 'URL("/static/bookclub/Modern2.png")';
    links.forEach((item) => {
      item.classList.replace("brand", "brandNeon");
    });
  }
  if (style === "classic") {
    classicTable.style.display = "block";
    modernTable.style.display = "none";
    document.body.style.backgroundImage = 'URL("/static/bookclub/back2.jpeg")';
    switchBtn.style.backgroundImage = 'URL("/static/bookclub/classic2.png")';
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

function bookAction(book2change, action) {
  let message;
  let form = document.querySelector(`.modal-form-${action}`);
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
    if (action === "rate") {
      const rating = document.querySelector("#rating-input").value;
      makeChange2Book(book2change, "rate", rating);
      message = "reload";
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
  if (action === "next") {
    fetch(`/edit/${bookid}`, {
      method: "PUT",
      body: JSON.stringify({
        next: true,
      }),
    });
  }
  if (action === "rate") {
    fetch(`/edit/${bookid}`, {
      method: "PUT",
      body: JSON.stringify({
        rating: rating,
      }),
    });
  }
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
  // history table includes 1 more column - rating
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
  if (message == "reload") {
    document.querySelector("#modalmessage").style.display = "flex";
    document.querySelector(".message-text").innerHTML = "Updated...";
    setTimeout(function () {
      window.location.reload();
    }, 1000);
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
}

function hideModals() {
  document.querySelector(".modal").style.display = "none";
  document.querySelector("#modalenter").style.display = "none";
  document.querySelector("#modaladd").style.display = "none";
  document.querySelector("#modalremove").style.display = "none";
  document.querySelector("#modalrate").style.display = "none";
}

function hideControls() {}

// ? history (back button) action
window.addEventListener("popstate", function (event) {
  // The popstate event is fired each time when the current history entry changes.
  window.location = document.referrer;
  if (window.location.href.slice(-7) === "history") {
    showHistory();
  }
  // history.pushState(null, null, window.location.pathname);
});
