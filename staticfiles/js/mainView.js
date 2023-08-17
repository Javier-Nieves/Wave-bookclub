import { CLASSIC_LIMIT } from "./config.js";
import { HideAll } from "./helpers.js";
switchBtnFunction();
capitalizeName();
resizeTitle();
addTableSorting();

export function showAllBooks(classicBooks, modernBooks) {
  HideAll();
  setStyle();
  document.querySelector(".searchField").value = "";
  document.querySelector(".classic-table").innerHTML = "";
  document.querySelector(".modern-table").innerHTML = "";
  document.querySelector(".upcoming-book-container").style.display = "block";
  classicBooks.forEach((book) => fillTableRow(book, "classic"));
  modernBooks.forEach((book) => fillTableRow(book, "modern"));
}

export function fillTableRow(book, where) {
  let row = createRow(book, `${where}`);
  book.upcoming && row.classList.add("upcom-book");
  Array.from(row.cells).forEach((cell, i) => (cell.className = `cl${i}`));
  // prettier-ignore
  let parameters = [book.title, book.author, +book.year, book.country, +book.pages];
  where === "history" && parameters.push(+book.rating || "-");
  for (let [i, param] of parameters.entries()) row.cells[i].innerHTML = param;
}

export function createRow(book, where) {
  const row = document.querySelector(`.${where}-table`).insertRow(0);
  row.className = `table-row ${where}-body dataContainer`;
  row.dataset.bookid = book.bookid;
  const cellCount = where === "history" ? 6 : 5;
  for (let i = 0; i < cellCount; i++) row.insertCell(i);
  return row;
}

export function NavBtnsFunction(handler1, handler2) {
  const readLink = document.querySelector("#reading-link");
  const histLink = document.querySelector("#history-link");
  readLink.addEventListener("click", handler1);
  histLink.addEventListener("click", handler2);
}

export function sessionBtnsFunction(handler) {
  document.querySelector(".exit-btn")?.addEventListener("click", handler);
  // prettier-ignore
  document.querySelector(".enter-btn")?.addEventListener("click", () => showModal("enter"));
  // change login modal to register and back
  // prettier-ignore
  document.querySelector(".register-link")?.addEventListener("click", changeRegLink);
}

export function meetingBtnFunction(handler) {
  // prettier-ignore
  document.querySelector(".meetingBtn")?.addEventListener("click", handler);
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

// todo:
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
    item.classList.toggle("brand", !makeModern);
    item.classList.toggle("brandNeon", makeModern);
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

function addTableSorting() {
  const allTables = document.querySelectorAll("table");
  allTables.forEach((table) =>
    table.addEventListener("click", (e) => {
      const classes = e.target.classList;
      if (!classes.contains("Up") && !classes.contains("Down")) return;
      // sorting parameter === column number
      const sortBy = e.target.className[2];
      deleteYearRows(table);
      sortTable(table, sortBy);
    })
  );
}

function sortTable(table, sortBy) {
  const clickedCell = table.rows[0].cells[sortBy].classList;
  const rowMap = new Map();
  Array.from(table.rows).forEach((row, i) => {
    if (i == 0) return;
    let param = row.cells[sortBy].innerHTML;
    // if sorting by country (column #3) - remove flag
    sortBy == 3 && (param = row.cells[sortBy].dataset.country);
    // create Map in which sorting parameters will be keys and their rows - values
    rowMap.set(row, param);
  });
  // converting Map to array and sorting it depending by the content type
  const sortedArray = [...rowMap];
  if (isNaN(+sortedArray[0][1])) {
    if (clickedCell.contains("Up")) sortedArray.sort();
    else sortedArray.sort((a, b) => b[1].localeCompare(a[1]));
  } else {
    sortedArray.sort((a, b) =>
      clickedCell.contains("Up") ? b[1] - a[1] : a[1] - b[1]
    );
  }
  const sortedMap = new Map(sortedArray);
  // rows change places
  let index = 1;
  for (let [row, _] of sortedMap) {
    const parent = row.parentNode;
    parent.removeChild(row);
    const targetRow = table.rows[index];
    parent.insertBefore(row, targetRow);
    index++;
  }
  // switching classes after sorting in the table
  clickedCell.contains("Up")
    ? clickedCell.replace("Up", "Down")
    : clickedCell.replace("Down", "Up");
}

function deleteYearRows(table) {
  Array.from(table.rows).forEach(
    (row) => row.classList.contains("yearRow") && row.remove()
  );
}
