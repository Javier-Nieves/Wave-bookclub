let countries = [];

await getCountryList();

export async function getJSON(url) {
  const response = await fetch(url);
  return await response.json();
}

export async function getCountryList(section) {
  console.log("start arranging");
  if (!countries) return;
  console.log("fetching");
  // prettier-ignore
  countries = await getJSON(`https://restcountries.com/v3.1/all?fields=name,flags`);
  //   flags = countries.map((item) => item.flags.png);
  countries = countries.map((item) => {
    if (item.name.common === "United States") item.name.common = "USA";
    if (item.name.common === "United Kingdom") item.name.common = "UK";
    return item;
  });

  if (section === "new") createCountryOptions(countryNames);
}

function createCountryOptions(countryNames) {
  console.log("createOptions");
  // create countries list for new book country selector
  const countryInput = document.getElementById("country-input");
  const countryList = document.getElementById("countryList");
  // Populate the datalist options
  countryNames.forEach(function (country) {
    let option = document.createElement("option");
    option.value = country;
    countryList.appendChild(option);
  });
  // validate input
  countryInput.addEventListener("change", function (event) {
    let selectedCountry = event.target.value;
    let isValidCountry = countryNames.includes(selectedCountry);
    if (!isValidCountry)
      event.target.setCustomValidity("Please select a valid country");
  });
}

export function fillFlags(where) {
  let toFill;
  if (where === "main") toFill = [".classic-table", ".modern-table"];
  if (where === "history") toFill = [".history-table"];
  toFill.forEach((table) => {
    const rows = Array.from(document.querySelector(table).rows);
    rows.forEach((row) => {
      // prettier-ignore
      const country = countries.find((country) => country.name.common === row.cells[3].innerHTML);
      row.cells[3].innerHTML = `
              <div class='flagContainer'>
                <div>${country.name.common}</div>
                <img src="${country.flags.png}" class='smallFlag'>
              </div>`;
    });
  });
}

export function Authenticated() {
  // todo - LOGOUT localstorage clear
  const loggedIn = document.querySelector("#authenticated")?.value
    ? true
    : false;
  localStorage.setItem("loggedIn", loggedIn);
  return localStorage.getItem("loggedIn") === "true";
}
