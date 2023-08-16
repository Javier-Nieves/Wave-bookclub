import { RES_PAGE } from "./searchView.js";

let countries = [];
await getCountryList();
createCountryOptions();

export async function getJSON(url) {
  const response = await fetch(url);
  return await response.json();
}

export async function createBook(id) {
  // prettier-ignore
  const book = await getJSON(`https://www.googleapis.com/books/v1/volumes/${id}`);
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

async function getCountryList() {
  // todo - try-catch
  if (!countries) return;
  // prettier-ignore
  const data = await getJSON(`https://restcountries.com/v3.1/all?fields=name,flags`);
  countries = data.map((item) => {
    if (item.name.common === "United States") item.name.common = "USA";
    if (item.name.common === "United Kingdom") item.name.common = "UK";
    return item;
  });
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

export function searchBooks(title, page) {
  // todo - if title contains several words - data is strange in pagination
  return getJSON(`https://www.googleapis.com/books/v1/volumes?q=+intitle:${title}
  &startIndex=${(+page - 1) * +RES_PAGE}&maxResults=${RES_PAGE}`);
}
