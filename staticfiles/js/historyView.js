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
    if (book.read) {
      if (!yearChange) {
        yearChange = book.meeting_date.slice(0, 4);
      }
      if (book.meeting_date.slice(0, 4) !== yearChange) {
        let CellList = createRow(book, "history");
        CellList[0].innerHTML = `<b>${yearChange}</b>`;
        // add separator Year-row if new year has started
        for (let h = 0; h < CellList.length; h++) {
          CellList[h].classList.add("yearRow");
        }
      }
      yearChange = book.meeting_date.slice(0, 4);
      fillTableRow(book, "history");
    }
  });
  window.history.pushState("_", "_", `/history`);
}
