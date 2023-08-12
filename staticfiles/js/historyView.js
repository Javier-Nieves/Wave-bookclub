import { HideAll } from "./helpers.js";
import { fillTableRow, createRow } from "./mainView.js";

export function showHistory(oldBooks) {
  HideAll();
  window.history.pushState("_", "_", `/`);
  document.querySelector("#history-view").style.display = "block";
  document.querySelector(".upcoming-book-container").style.display = "block";
  document.querySelector(".history-table").innerHTML = "";
  let yearChange;
  oldBooks.forEach((book) => {
    if (!book.read) return;
    if (!yearChange) yearChange = book.meeting_date.slice(0, 4);
    // create yearRows to separate bookclub years
    if (book.meeting_date.slice(0, 4) !== yearChange) {
      let row = createRow(book, "history");
      row.classList.add("yearRow");
      row.cells[0].innerHTML = `<b>${yearChange}</b>`;
    }
    yearChange = book.meeting_date.slice(0, 4);
    fillTableRow(book, "history");
  });
  window.history.pushState("_", "_", `/history`);
}
