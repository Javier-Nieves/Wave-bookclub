export const CLASSIC_LIMIT = new Date().getFullYear() - 50;

export function loadScreen(bool) {
  const loadScreen = document.querySelector("#load-screen");
  if (bool) loadScreen.style.display = "block";
  else loadScreen.style.display = "none";
}

export function HideAll() {
  // prettier-ignore
  const hideList = [".switch-container", ".upcoming-book-container", "#modernTable", 
    "#classicTable", "#book-view", "#history-view", "#search-results", "#searchInfo",
    ".control-group", ".rate-btn-container", ".view-rating"];
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

export function waitNreload(message) {
  const reloadList = ["rate", "next", "logout", "save"];
  if (reloadList.includes(message)) {
    document.querySelector("#modalmessage").style.display = "flex";
    document.querySelector(".message-text").innerHTML = `${
      message === "logout" ? "Logged out" : "Updated"
    }`;
    setTimeout(function () {
      window.location.reload();
    }, 800);
    return;
  }
  // some time is needed to update DB
  setTimeout(() => {
    showAllBooks_control();
    showMessage(message);
  }, 600);
  hideModals();
}

function hideModals() {
  [".modal", "#modalenter", "#modaladd", "#modalremove", "#modalrate"].map(
    (elem) => (document.querySelector(elem).style.display = "none")
  );
}
