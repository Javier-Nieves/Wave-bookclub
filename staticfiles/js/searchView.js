import { HideAll } from "./helpers.js";

let title;
export let currentPage = 1;
export const RES_PAGE = 20; // todo - make changable

export function activateSearchForm(handler) {
  document.querySelector(".search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    title = document.querySelector(".searchField").value;
    currentPage = 1;
    handler(title);
  });
}

export function activatePagination(handler) {
  document.querySelectorAll(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = +btn.dataset.goto;
      handler(title);
    });
  });
}

export function showSearchResults(data) {
  HideAll();
  const SearchTable = document.querySelector(".search-table");
  const searchInfo = document.querySelector("#searchInfo");
  document.querySelector("#search-results").style.display = "block";
  searchInfo.style.display = "flex";
  searchInfo.innerHTML = "";
  SearchTable.innerHTML = "";
  data.items.forEach((book) => {
    const link =
      book.volumeInfo.imageLinks?.smallThumbnail ||
      "/staticfiles/bookclub/club2.png";
    const row = SearchTable.insertRow();
    row.classList.add("table-row", "classic-body", "dataContainer");
    row.dataset.bookid = book.id;
    row.insertCell(0).innerHTML = `<img class='small-pic' src=${link}>`;
    row.insertCell(1).innerHTML = `
    <div class='searchResultBig'>${book.volumeInfo.title}</div>
    <div class='searchResultSmall'>${book.volumeInfo?.authors?.[0] || ""}</div>
    `;
  });
  const markUp = generateMarkUp(data.totalItems);
  searchInfo.insertAdjacentHTML("afterBegin", markUp);
}

function generateMarkUp(total) {
  const allPages = Math.ceil(total / RES_PAGE);
  let markUp = `<div class="paginationText"> Total results: ${total}</div>`;
  // Page 1 and there are others
  if (allPages > 1 && currentPage === 1)
    markUp += `
        <div class="flex-container">
            <button class="pagination-btn_null" style="opacity:0"> <- </button>
            <div class="simple-text">Page ${currentPage} / ${allPages}</div>
            <button data-goto="${
              currentPage + 1
            }" class="pagination-btn"> -> </button>
        </div>
        `;
  // Last page of many
  if (allPages > 1 && currentPage === allPages)
    markUp += `
        <div class="flex-container">
            <button data-goto="${
              currentPage - 1
            }"class="pagination-btn"> <- </button>
            <div class="simple-text">Page ${currentPage} / ${allPages}</div>
            <button class="pagination-btn_null" style="opacity:0"> -> </button>
        </div>
        `;
  // Page in the middle
  if (currentPage < allPages && currentPage !== 1)
    markUp += `
        <div class="flex-container">
            <button data-goto="${
              currentPage - 1
            }" class="pagination-btn"> <- </button>
            <div class="simple-text">Page ${currentPage} / ${allPages}</div>
            <button data-goto="${
              currentPage + 1
            }" class="pagination-btn"> -> </button>
        </div>
        `;
  // Just one page
  //   if (total <= RES_PAGE) markUp = "";
  return markUp;
}
