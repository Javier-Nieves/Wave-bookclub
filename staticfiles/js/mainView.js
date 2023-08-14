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
}

export function fillTableRow(book, where) {
  let row = createRow(book, `${where}`);
  book.upcoming && row.classList.add("upcom-book");
  Array.from(row.cells).forEach((cell, i) => (cell.className = `cl${i}`));
  // prettier-ignore
  let parameters = [book.title, book.author, book.year, book.country, book.pages];
  where === "history" && parameters.push(book.rating || "-");
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

export function NavBtnsFunction(function1, function2) {
  const readLink = document.querySelector("#reading-link");
  const histLink = document.querySelector("#history-link");
  readLink.addEventListener("click", function1);
  histLink.addEventListener("click", function2);
}

export function sessionBtnsFunction(function1) {
  document.querySelector(".exit-btn")?.addEventListener("click", function1);
  // prettier-ignore
  document.querySelector(".enter-btn")?.addEventListener("click", () => showModal("enter"));
  // change login modal to register and back
  // prettier-ignore
  document.querySelector(".register-link")?.addEventListener("click", changeRegLink);
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
