"use strict";

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", (e) => {
    const tar = e.target;

    // get book id from data attribute in title div
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

  // ! What's the next book?
  let isClassic =
    document.querySelector(".upcoming-book-container").dataset.isclassic ===
    "True";
  if (isClassic) {
    setStyle("modern");
  } else {
    setStyle("classic");
  }

  // ! Switch classic and modern tables and styles
  const switchBtn = document.querySelector(".switch");
  const classicTable = document.querySelector("#classicTable");
  const modernTable = document.querySelector("#modernTable");
  switchBtn.addEventListener("click", () => {
    classicTable.classList.toggle("hidden-table");
    modernTable.classList.toggle("hidden-table");
    // for Modern view:
    if (classicTable.classList.contains("hidden-table")) {
      setStyle("modern");
    } else {
      setStyle("classic");
    }
  });

  // ! search for the book
  document.querySelector(".searchBtn").addEventListener("click", () => {
    let title = document.querySelector(".searchField").value;
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=+intitle:${title}&maxResults=10`
    )
      .then((response) => response.json())
      .then((data) => {
        showSearchResults(data);
      });
  });

  // ! add book to the reading list
  document.querySelector(".add-btn").addEventListener("click", () => {
    const bookToList = document.querySelector(".view-title").dataset.bookid;
    let form = document.querySelector(".modal-form");
    let close = document.querySelector(".close");
    let modal = document.querySelector(".modal");
    modal.style.display = "block";
    close.onclick = () => {
      modal.style.display = "none";
    };
    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
    form.onsubmit = (e) => {
      e.preventDefault();
      const year = document.querySelector("#year-input").value;
      const country = document.querySelector("#country-input").value;
      fetch(`/add/${bookToList}/${year}/${country}`);
      // give time for python to work
      setTimeout(function () {
        window.location.reload();
      }, 500);
    };
  });

  // ! Show history
  const histLink = document.querySelector("#history-link");
  histLink.addEventListener("click", () => {
    showHistory();
  });
});

function showBook(book) {
  // todo - show book from DB if it's already there
  // todo - description and cover shouldn't stay old when new ones are absent
  document.querySelector(".upcoming-book-container").style.display = "none";
  document.querySelector(".switch").style.display = "none";
  document.querySelector("#classicTable").style.display = "none";
  document.querySelector("#modernTable").style.display = "none";
  document.querySelector(".switch").style.display = "none";
  document.querySelector("#history-view").style.display = "none";
  document.querySelector("#search-results").style.display = "none";
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

      title.innerHTML = volumeInfo.title;
      title.dataset.bookid = book.id;
      author.innerHTML = volumeInfo.authors[0];
      pages.innerHTML = `Page count: ${volumeInfo.pageCount}`;

      // * image for book cover
      const imgUrl = volumeInfo.imageLinks.thumbnail;
      control.style.display = "flex";
      image.src = imgUrl;

      // * description:
      const fullText = volumeInfo.description || "no description available";
      description.innerHTML = truncate(fullText, 3000);

      // ? manage book view buttons
      // todo - remove button should be inactive in read books
      fetch(`/check/${book.id}`)
        .then((response) => response.json())
        .then((response) => {
          if (response.year !== null) {
            document.querySelector(".add-btn").style.display = "none";
            document.querySelector(".simple-text").innerHTML = `from the ${
              response.year <= 1973 ? "Classic" : "Modern"
            } reading list`;
            document.querySelector(".remove-btn-container").style.display =
              "flex";
            if (response.upcoming) {
              document.querySelector(".rate-btn-container").style.display =
                "block";
              document.querySelector(".remove-btn-container").style.display =
                "none";
            }
          } else {
            document.querySelector(".remove-btn-container").style.display =
              "none";
            document.querySelector(".add-btn").style.display = "flex";
          }
        });
    });
}

function showHistory() {
  document.querySelector(".switch").style.display = "none";
  document.querySelector("#classicTable").style.display = "none";
  document.querySelector("#modernTable").style.display = "none";
  document.querySelector("#book-view").style.display = "none";
  document.querySelector("#search-results").style.display = "none";
  document.querySelector("#history-view").style.display = "block";
}

function showSearchResults(response) {
  // todo - don't show if no results to show
  document.querySelector(".switch").style.display = "none";
  document.querySelector("#classicTable").style.display = "none";
  document.querySelector("#modernTable").style.display = "none";
  document.querySelector("#book-view").style.display = "none";
  document.querySelector("#history-view").style.display = "none";
  document.querySelector("#search-results").style.display = "block";
  const SearchTable = document.querySelector(".search-table");

  for (let i = 0; i < response.items.length; i++) {
    let link;
    let item = response.items[i];
    // console.log(item.id);
    try {
      link = item.volumeInfo.imageLinks.smallThumbnail;
    } catch {
      link = "cover";
    }
    // todo - make table for search results. data-atr to table row. clear the table
    // creatig new row in table on 1st position
    let row = SearchTable.insertRow(0);
    row.className = "table-row clas-body book2show";
    row.dataset.bookid = item.id;
    var cell1 = row.insertCell(0);
    cell1.dataset.bookid = item.id;
    var cell2 = row.insertCell(1);
    cell2.className = "book2show";
    var cell3 = row.insertCell(2);
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
  const links = document.querySelectorAll("a");
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
