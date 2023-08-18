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
  try {
    const books = await AJAX("/allbooks");
    state.historyBooks = books
      .filter((book) => book.read)
      .sort((a, b) => (a.meeting_date < b.meeting_date ? -1 : 1));
    const readList = books.filter((book) => !book.read);
    state.modernBooks = readList.filter((book) => book.year > CLASSIC_LIMIT);
    state.classicBooks = readList.filter((book) => book.year <= CLASSIC_LIMIT);
    state.upcommingBook = books.find((book) => book.upcoming);
  } catch (err) {
    throw err;
  }
}

export async function getBook(id) {
  try {
    let book = await AJAX(`/check/${id}`);
    if (book.notInDB) book = await createBook(id);
    state.bookToShow = book;
  } catch (err) {
    throw err;
  }
}

async function createBook(id) {
  try {
    const book = await AJAX(`${BOOK_API}/${id}`);
    const info = book.volumeInfo;
    return {
      author: info.authors?.[0] || "-",
      bookid: book.id,
      desc: info.description,
      image_link:
        info.imageLinks?.smallThumbnail || "/staticfiles/bookclub/club2.png",
      pages: info.pageCount,
      title: info.title,
    };
  } catch (err) {
    throw err;
  }
}

export async function addBook(book) {
  try {
    await AJAX(`/add`, book);
    book.year > CLASSIC_LIMIT
      ? state.modernBooks.push(book)
      : state.classicBooks.push(book);
  } catch (err) {
    throw err;
  }
}

export async function removeBook(book) {
  try {
    await AJAX(`/remove`, book);
    if (book.year > CLASSIC_LIMIT) {
      const index = state.modernBooks.findIndex((element) => element === book);
      state.modernBooks.splice(index);
    } else {
      const index = state.classicBooks.findIndex((element) => element === book);
      state.classicBooks.splice(index);
    }
  } catch (err) {
    throw err;
  }
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
  try {
    // todo - if title contains several words - data is strange in pagination somehow
    // prettier-ignore
    return AJAX(`${BOOK_API}?q=+intitle:${title}&startIndex=${(+page - 1) * +RES_PAGE}&maxResults=${RES_PAGE}`);
  } catch (err) {
    throw err;
  }
}

async function getCountryList() {
  try {
    if (!countries) return;
    const data = await AJAX(COUNTRIES_API);
    countries = data.map((item) => {
      if (item.name.common === "United States") item.name.common = "USA";
      if (item.name.common === "United Kingdom") item.name.common = "UK";
      return item;
    });
  } catch (err) {
    console.error("Error in country list API", err.message);
  }
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
