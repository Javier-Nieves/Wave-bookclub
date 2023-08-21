import { TIMEOUT_SEC } from "./config.js";

export function loadScreen(bool) {
  const loadScreen = document.querySelector("#load-screen");
  if (bool) loadScreen.style.display = "block";
  else loadScreen.style.display = "none";
}

export function HideAll() {
  // prettier-ignore
  const hideList = [".switch-container", ".upcoming-book-container", "#modernTable", 
    "#classicTable", "#book-view", "#history-view", "#search-results", "#searchInfo",
    ".control-group", ".rate-btn-container", ".view-rating" ];
  hideList.forEach(
    (elem) => (document.querySelector(elem).style.display = "none")
  );
  ["#year-input", "#country-input"].map(
    (elem) => (document.querySelector(elem).value = "")
  );
  // todo - in case Edit function wasn't completed:
  try {
    [".newTitleInput", ".newAuthorInput", ".newPagesInput", ".newDesc"].map(
      (elem) => document.querySelector(elem).remove()
    );
    document.querySelector(".view-title").style.display = "block";
    document.querySelector(".view-author").style.display = "block";
    document.querySelector(".view-desc").style.display = "block";
    document.querySelector(".view-pages").style.display = "block";
    document.querySelector(".book-info").style.overflow = "auto";
    const editBtn = document.querySelector(".edit-btn");
    editBtn.classList.remove("save-btn");
    editBtn.innerHTML = "Edit";
  } catch {}
}

export function showMessage(message) {
  document.querySelector("#modalmessage").style.display = "flex";
  document.querySelector(".message-text").innerHTML = message;
  try {
    document.querySelector("#message").innerHTML = "";
  } catch {}
  setTimeout(() => {
    document.querySelector("#modalmessage").style.display = "none";
  }, 2500);
}

export function hideModals() {
  [".modal", "#modalenter", "#modaladd", "#modalremove", "#modalrate"].map(
    (elem) => (document.querySelector(elem).style.display = "none")
  );
}

export async function AJAX(url, uploadData = undefined, method = "GET") {
  try {
    let fetchPro;
    if (uploadData) {
      if (method === "POST" || method === "PUT")
        fetchPro = fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadData),
        });
    } else fetchPro = fetch(url);
    const response = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await response.json();
    //   if (!response.ok) throw new Error(`${data.message} (${response.status})`);
    return data;
  } catch (err) {
    throw err;
  }
}

function timeout(s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
}
