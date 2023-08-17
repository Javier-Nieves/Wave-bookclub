import { BOOK_API, COUNTRIES_API, RES_PAGE, CLASSIC_LIMIT } from "./config.js";
import { AJAX } from "./helpers.js";

let countries = [];
await getCountryList();
createCountryOptions();

export const state = {
  upcommingBook: {},
  bookToShow: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RES_PAGE,
  },
  classicBooks: [],
  modernBooks: [],
  historyBooks: [],
};

export async function getAllBooks() {
  const books = await AJAX("/allbooks");
  state.historyBooks = books
    .filter((book) => book.read)
    .sort((a, b) => (a.meeting_date < b.meeting_date ? -1 : 1));
  const readList = books.filter((book) => !book.read);
  state.modernBooks = readList.filter((book) => book.year > CLASSIC_LIMIT);
  state.classicBooks = readList.filter((book) => book.year <= CLASSIC_LIMIT);
  state.upcommingBook = books.find((book) => book.upcoming);
}

export async function getBook(id) {
  let book = await AJAX(`/check/${id}`);
  if (book.notInDB) book = await createBook(id);
  state.bookToShow = book;
}

async function createBook(id) {
  // prettier-ignore
  const book = await AJAX(`${BOOK_API}/${id}`);
  const info = book.volumeInfo;
  return {
    author: info.authors?.[0] || "-",
    bookid: book.id,
    country: null,
    desc: info.description,
    image_link:
      info.imageLinks?.smallThumbnail || "/staticfiles/bookclub/club2.png",
    meeting_date: null,
    pages: info.pageCount,
    rating: null,
    read: false,
    title: info.title,
    upcoming: false,
    year: null,
  };
}

export function fillFlags(where) {
  let toFill;
  if (where === "main") toFill = [".classic-table", ".modern-table"];
  if (where === "history") toFill = [".history-table"];
  toFill.forEach((table) => {
    Array.from(document.querySelector(table).rows)
      .filter((row) => !row.classList.contains("yearRow"))
      .forEach((row) => {
        // prettier-ignore
        const country = countries.find((country) => country.name.common === row.cells[3].innerHTML);
        row.cells[3].innerHTML = `
        <div class='flagContainer'>
            <div>${country.name.common}</div>
            <img src="${country.flags.png}" class='smallFlag'>
        </div>`;
        row.cells[3].dataset.country = country.name.common;
      });
  });
}

export function Authenticated() {
  const loggedIn = document.querySelector("#authenticated")?.value
    ? true
    : false;
  localStorage.setItem("loggedIn", loggedIn);
  return localStorage.getItem("loggedIn") === "true";
}

export function searchBooks(title, page) {
  // todo - if title contains several words - data is strange in pagination somehow
  return AJAX(`${BOOK_API}?q=+intitle:${title}
    &startIndex=${(+page - 1) * +RES_PAGE}&maxResults=${RES_PAGE}`);
}

async function getCountryList() {
  // todo - try-catch
  if (!countries) return;
  // prettier-ignore
  const data = await AJAX(COUNTRIES_API);
  countries = data.map((item) => {
    if (item.name.common === "United States") item.name.common = "USA";
    if (item.name.common === "United Kingdom") item.name.common = "UK";
    return item;
  });
}

function createCountryOptions() {
  // create countries list for new book country selector
  const countryInput = document.querySelector("#country-input");
  const countryList = document.querySelector("#countryList");
  // Populate the datalist options
  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.name.common;
    countryList.appendChild(option);
  });
  // validate input
  countryInput.addEventListener("change", (event) => {
    let selectedCountry = event.target.value;
    // prettier-ignore
    let isValidCountry = countries.map((item) => item.name.common).includes(selectedCountry);
    if (!isValidCountry)
      event.target.setCustomValidity("Please select a valid country");
  });
}
