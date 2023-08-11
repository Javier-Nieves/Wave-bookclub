import { CLASSIC_LIMIT, HideAll } from "./helpers.js";
switchBtnFunction();
capitalizeName();
resizeTitle();

export function showAllBooks(books) {
  HideAll();
  setStyle();
  document.querySelector(".searchField").value = "";
  document.querySelector(".classic-table").innerHTML = "";
  document.querySelector(".modern-table").innerHTML = "";
  document.querySelector(".upcoming-book-container").style.display = "block";
  books.forEach((book) => {
    book.year <= CLASSIC_LIMIT && !book.read && fillTableRow(book, "classic");
    book.year > CLASSIC_LIMIT && !book.read && fillTableRow(book, "modern");
  });
  window.history.pushState("_", "_", `/`);
}

export function fillTableRow(item, where) {
  let CellList = createRow(item, `${where}`);
  for (let i = 0; i < 6; i++) {
    try {
      CellList[i].className = `cl${i}`;
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

export function createRow(item, where) {
  const row = document.querySelector(`.${where}-table`).insertRow(0);
  row.className = `table-row ${where}-body dataContainer`;
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

export function NavBtnsFunction(function1, function2) {
  const readLink = document.querySelector("#reading-link");
  const histLink = document.querySelector("#history-link");
  readLink.addEventListener("click", function1);
  histLink.addEventListener("click", function2);
}

export function sessionBtnsFunction(function1, function2) {
  // prettier-ignore
  document.querySelector(".enter-btn")?.addEventListener("click", () => showModal("enter"));
  // prettier-ignore
  document.querySelector(".exit-btn")?.addEventListener("click", function1);
  // change login modal to register and back
  document.querySelector(".register-link").addEventListener("click", function2);
}

export function meetingBtnFunction(function1) {
  // prettier-ignore
  document
      .querySelector(".meetingBtn")
      ?.addEventListener("click", function1);
}

function switchBtnFunction() {
  const switchBtn = document.querySelector(".switch");
  switchBtn.addEventListener("click", () => setStyle(true));
}

export function showModal(action) {
  // todo - use Dialog
  const close = document.querySelector(".close");
  const modal = document.querySelector(".modal");
  const modalContent = document.querySelector(`#modal${action}`);
  modal.style.display = "block";
  modalContent.style.display = "block";
  close.addEventListener("click", () => {
    modal.style.display = "none";
    modalContent.style.display = "none";
  });
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      modalContent.style.display = "none";
    }
  };
}

export function setStyle(changeStyle = false) {
  const upcomBookYear =
    document.querySelector(".upcoming-book-container").dataset.year || 1666;
  // if book is classic => style should be made modern
  let makeModern = upcomBookYear < CLASSIC_LIMIT;
  document.querySelector(".switch-container").style.display = "flex";
  const classicTable = document.querySelector("#classicTable");
  const modernTable = document.querySelector("#modernTable");
  // if switch btn is clicked - style will change to the other one
  if (changeStyle) makeModern = classicTable.style.display !== "none";

  classicTable.style.display = makeModern ? "none" : "block";
  modernTable.style.display = makeModern ? "block" : "none";
  document.body.style.backgroundImage = makeModern
    ? "URL('/staticfiles/bookclub/13small.jpg')"
    : "URL('/staticfiles/bookclub/back2small.jpg')";
  const switchBtn = document.querySelector(".switch");
  switchBtn.style.backgroundImage = makeModern
    ? "URL('/staticfiles/bookclub/Modern2.png')"
    : "URL('/staticfiles/bookclub/classic2.png')";
  let img = new Image();
  img.src = makeModern
    ? "/staticfiles/bookclub/13.jpg"
    : "/staticfiles/bookclub/back2.jpeg";
  img.addEventListener("load", () => {
    document.body.style.backgroundImage = `URL(${img.src})`;
  });
  document.querySelectorAll(".link").forEach((item) => {
    makeModern && item.classList.replace("brand", "brandNeon");
    !makeModern && item.classList.replace("brandNeon", "brand");
  });
}

function capitalizeName() {
  const club = document.querySelector(".name-text");
  if (!club) return;
  let clubName = club.innerHTML;
  let capitalized = clubName.at(0).toUpperCase() + clubName.slice(1);
  club.innerHTML = capitalized;
}

function resizeTitle() {
  const title = document.querySelector("#upcoming-title");
  title?.innerHTML.length > 20 && (title.style.fontSize = "4vh");
}
