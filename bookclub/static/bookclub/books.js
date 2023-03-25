"use strict";
let today = new Date().toISOString().slice(0, 4);

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", (e) => {
    const tar = e.target;

    // ? get book id from data attribute in title div => show this book
    if (tar.className.includes("book2show")) {
      if (
        tar.className.includes("container") ||
        tar.className.includes("upcoming-book-container")
      ) {
        showBook(tar.dataset.bookid);
      }
      showBook(tar.parentElement.dataset.bookid);
    }
  });

  // ! What's the next book? Set page style accordingly
  // today gives year:
  let isClassic =
    document.querySelector(".upcoming-book-container").dataset.isclassic <
    today - 50;
  if (isClassic) {
    setStyle("modern");
  } else {
    setStyle("classic");
  }

  // ! Switch classic and modern tables and styles
  const switchBtn = document.querySelector(".switch");
  const classicTable = document.querySelector("#classicTable");
  const modernTable = document.querySelector("#modernTable");
  switchBtn.onclick = () => {
    classicTable.classList.toggle("hidden-table");
    modernTable.classList.toggle("hidden-table");
    // for Modern view:
    if (classicTable.classList.contains("hidden-table")) {
      setStyle("modern");
    } else {
      setStyle("classic");
    }
  };

  // ! add meeting dat
  const bookid = document.querySelector(".upcoming-book-container").dataset
    .bookid;
  try {
    document.querySelector(".meetingBtn").addEventListener("click", () => {
      makeChange2Book(bookid, "meeting");
    });
  } catch {}

  // ! search for the book
  // todo - add search by title and author
  document.querySelector(".searchBtn").onclick = () => {
    let title = document.querySelector(".searchField").value;
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=+intitle:${title}&maxResults=20`
    )
      .then((response) => response.json())
      .then((data) => {
        showSearchResults(data);
      });
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
  document.querySelector(".rate-btn").onclick = () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    bookAction(book2change, "rate");
  };
  // ! next book selection
  document.querySelector(".next-btn").onclick = () => {
    const book2change = document.querySelector(".view-title").dataset.bookid;
    makeChange2Book(book2change, "next");
  };

  // ! Show history
  const histLink = document.querySelector("#history-link");
  histLink.onclick = () => {
    HideAll();
    showHistory();
  };
});

function showBook(book) {
  // todo - show book from DB if it's already there
  // todo - description and cover shouldn't stay old when new ones are absent
  HideAll();
  document.querySelector("#book-view").style.display = "flex";
  const title = document.querySelector(".view-title");
  const author = document.querySelector(".view-author");
  const description = document.querySelector(".view-desc");
  const image = document.querySelector(".view-image");
  const control = document.querySelector(".control-group");
  const pages = document.querySelector(".view-pages");

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

      // * description:
      const fullText = volumeInfo.description || "no description available";
      description.innerHTML = truncate(fullText, 3000);

      // ? manage book view buttons
      fetch(`/check/${book.id}`)
        .then((response) => response.json())
        .then((response) => {
          // if book is in the DB is has Year
          if (response.year !== null) {
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
        });
    });
}

function showHistory() {
  // todo - make function to insert year dates as rows into the table
  HideAll();
  document.querySelector("#history-view").style.display = "block";
  document.querySelector(".upcoming-book-container").style.display = "block";

  let yearChange;
  fetch("/history")
    .then((response) => response.json())
    .then((old_books) => {
      old_books.forEach((item) => {
        if (item.read) {
          addNewHistRow(item);
        }
      });
    });
}

function showSearchResults(response) {
  // todo - don't show if no results to show
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
    let row = SearchTable.insertRow(0);
    row.className = "table-row clas-body book2show";
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
}

// ? -------------------------------------------------------------- helpers:
function truncate(string, length) {
  // conditional (ternary) operator is like If-Else statement. [condition ? (ifTrue); : (else);]
  return string.length > length ? `${string.substr(0, length)}...` : string;
}

function setStyle(style) {
  const links = document.querySelectorAll(".link");
  const switchBtn = document.querySelector(".switch");
  if (style === "modern") {
    classicTable.classList.add("hidden-table");
    modernTable.classList.remove("hidden-table");
    document.body.style.backgroundImage = "url('/static/bookclub/13.jpeg')";
    switchBtn.style.backgroundImage = "url('/static/bookclub/Classic2.png')";
    links.forEach((item) => {
      item.classList.replace("brand", "brandNeon");
    });
  }
  if (style === "classic") {
    classicTable.classList.remove("hidden-table");
    modernTable.classList.add("hidden-table");
    document.body.style.backgroundImage = "url('/static/bookclub/back2.jpeg')";
    switchBtn.style.backgroundImage = "url('/static/bookclub/Modern2.png')";
    links.forEach((item) => {
      item.classList.replace("brandNeon", "brand");
    });
  }
}

function showModal(action) {
  const close = document.querySelector(".close");
  const modal = document.querySelector(`.modal`);
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

function HideAll() {
  document.querySelector(".switch").style.display = "none";
  document.querySelector(".upcoming-book-container").style.display = "none";
  document.querySelector("#modernTable").style.display = "none";
  document.querySelector("#classicTable").style.display = "none";
  document.querySelector("#book-view").style.display = "none";
  document.querySelector("#history-view").style.display = "none";
  document.querySelector("#search-results").style.display = "none";
  document.querySelector(".control-group").style.display = "none";
  document.querySelector(".rate-btn-container").style.display = "none";
}

function bookAction(book2change, action) {
  let form = document.querySelector(`.modal-form-${action}`);
  showModal(`${action}`);
  form.onsubmit = (e) => {
    e.preventDefault();
    if (action === "add") {
      const year = document.querySelector("#year-input").value;
      const country = document.querySelector("#country-input").value;
      fetch(`/add/${book2change}/${year}/${country}`);
    }
    if (action === "remove") {
      fetch(`/${action}/${book2change}`);
    }
    if (action === "rate") {
      const rating = document.querySelector("#rating-input").value;
      fetch(`/${action}/${book2change}/${rating}`);
    }
    if (action === "next") {
      makeChange2Book(book2change, "next");
    }
    setTimeout(function () {
      // give 0.5 s to Python to think about it
      window.location.reload();
    }, 500);
  };
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
    console.log("History book");
  } else if (buttons.includes("remove")) {
    addBtn.style.display = "none";
    document.querySelector(".simple-text").innerHTML = `from the ${
      response.year <= today - 50 ? "Classic" : "Modern"
    } reading list`;
    removeBtn.style.display = "flex";
    if (!nextBook) {
      console.log("no next book");
      nextBtn.style.display = "block";
    }
  } else if (buttons.includes("rate")) {
    rateBtn.style.display = "block";
  } else if (buttons.includes("add")) {
    addBtn.style.display = "flex";
  }
}

function makeChange2Book(bookid, action) {
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
        setTimeout(function () {
          window.location.reload();
        }, 500);
      };
    });
  }
  // make book the next one in reading list
  if (action === "next") {
    console.log("next book");
    fetch(`/edit/${bookid}`, {
      method: "PUT",
      body: JSON.stringify({
        next: true,
      }),
    });
    setTimeout(function () {
      window.location.reload();
    }, 500);
  }
}

function addNewHistRow(item) {
  const HistTable = document.querySelector(".history-table");
  const row = HistTable.insertRow(0);
  row.className = "table-row clas-body book2show";
  row.dataset.bookid = item.bookid;
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);
  const cell3 = row.insertCell(2);
  const cell4 = row.insertCell(3);
  const cell5 = row.insertCell(4);
  const cell6 = row.insertCell(5);
  const CellList = [cell1, cell2, cell3, cell4, cell5, cell6];
  for (let i = 0; i < 6; i++) {
    try {
      CellList[i].className = "book2show";
    } catch {}
  }
  let param = [
    item.title,
    item.author,
    item.year,
    item.country,
    item.pages,
    item.rating,
  ];
  for (let i = 0; i < param.length; i++) {
    CellList[i].innerHTML = `${param[i]}`;
  }
}
