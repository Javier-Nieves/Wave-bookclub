export async function getAllBooks() {
  const response = await fetch("allbooks/all");
  return await response.json();
}

export async function arrangeCountries(section) {
  const option = document.querySelector("option");
  // if options aren't filled yet:
  if (option) return;
  const response = await fetch(
    `https://restcountries.com/v3.1/all?fields=name,flags`
  );
  const countries = await response.json();
  const flags = countries.map((item) => item.flags.png);
  const countryNames = countries.map((item) => item.name.common);
  countryNames[countryNames.indexOf("United States")] = "USA";
  countryNames[countryNames.indexOf("United Kingdom")] = "UK";

  [".history-table", ".classic-table", ".modern-table"].forEach((table) =>
    fillFlags(document.querySelector(table), countryNames, flags)
  );

  if (section === "new") createCountryOptions(countryNames);
}

function createCountryOptions(countryNames) {
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

function fillFlags(table, countries, flags) {
  const rows = table.rows;
  let flag;
  for (let k = 0; k < rows.length; k++) {
    let cellValue = rows[k].cells[3].innerHTML;
    for (let p = 0; p < countries.length; p++) {
      if (cellValue === countries[p]) {
        flag = flags[p];
        rows[k].cells[3].innerHTML = `
              <div class='flagContainer'>
                <div>${cellValue}</div>
                <img src="${flag}" class='smallFlag'>
              </div>`;
      }
    }
  }
}

export function Authenticated() {
  // todo - LOGOUT localstorage clear
  const loggedIn = document.querySelector("#authenticated")?.value
    ? true
    : false;
  localStorage.setItem("loggedIn", loggedIn);
  return localStorage.getItem("loggedIn") === "true";
}
