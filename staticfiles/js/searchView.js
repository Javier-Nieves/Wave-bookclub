import { HideAll } from "./helpers.js";

export function activateSearchForm(handler) {
  document.querySelector(".search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    let title = document.querySelector(".searchField").value;
    handler(title);
  });
}

export function showSearchResults(data) {
  HideAll();
  document.querySelector("#search-results").style.display = "block";
  const SearchTable = document.querySelector(".search-table");
  SearchTable.innerHTML = "";
  for (const item of data.items) {
    const link =
      item.volumeInfo.imageLinks?.smallThumbnail ||
      "/staticfiles/bookclub/club2.png";
    const row = SearchTable.insertRow();
    row.classList.add("table-row", "classic-body", "dataContainer");
    row.dataset.bookid = item.id;
    row.insertCell(0).innerHTML = `<img class='small-pic' src=${link}>`;
    row.insertCell(1).innerHTML = item.volumeInfo?.authors?.[0] || "";
    row.insertCell(2).innerHTML = `${item.volumeInfo.title}`;
  }
}
