export function loadScreen(bool) {
  const loadScreen = document.querySelector("#load-screen");
  if (bool) loadScreen.style.display = "block";
  else loadScreen.style.display = "none";
}

export function HideAll() {
  // prettier-ignore
  const hideList = [".switch-container", ".upcoming-book-container", "#modernTable", 
    "#classicTable", "#book-view", "#history-view", "#search-results", ".control-group",
    ".rate-btn-container", ".view-rating"];
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

export const resizeTitle = () => {
  const title = document.querySelector("#upcoming-title");
  title?.innerHTML.length > 20 && (title.style.fontSize = "4vh");
};
