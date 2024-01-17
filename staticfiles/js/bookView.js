import { Authenticated } from './model.js';
import { HideAll } from './helpers.js';

export function bookSummon(handler) {
  // prettier-ignore
  [".search-table", ".classic-table", ".modern-table", ".history-table", ".upcoming-book-container"]
    .forEach((item) => document.querySelector(item).addEventListener("click", (e) => {
      if (!e.target.closest(".add-date-container"))
        handler(e.target.closest(".dataContainer").dataset.bookid);
    }
    ));
}

export function showBook(book) {
  HideAll();
  chooseButtons(book);
  document.querySelector('#book-view').style.display = 'flex';

  const title = document.querySelector('.view-title');
  const author = document.querySelector('.view-author');
  const description = document.querySelector('.view-desc');
  const image = document.querySelector('.view-image');
  const control = document.querySelector('.control-group');
  const pages = document.querySelector('.view-pages');
  const rating = document.querySelector('.view-rating');
  control.style.display = 'flex';
  title.innerHTML = book.title;
  title.dataset.bookid = book.bookid;
  author.innerHTML = book.author;
  pages.innerHTML = `${book.pages}`;
  description.innerHTML = book.desc;
  image.src = book.image_link;
  if (book.rating) {
    rating.style.display = 'block';
    rating.innerHTML = book.rating;
  }
}

export function bookBtnsFunctions(add, remove, onEdit, next, rate) {
  // FYI: other way to havecallback function with parameter here -
  // is pass that function and call is with parameter.. doh
  document.querySelector('.add-btn').addEventListener('click', add);
  document.querySelector('.remove-btn').addEventListener('click', remove);
  document.querySelector('.next-btn').addEventListener('click', next);
  document.querySelector('.rate-btn').addEventListener('click', rate);
  document.querySelector('.edit-btn').addEventListener('click', () => {
    changeEditBtn(onEdit);
  });
}

function chooseButtons(book) {
  if (Authenticated()) {
    book.year && displayButtons('edit');
    book.year && !book.read && displayButtons('remove', 'edit');
    book.year && book.upcoming && displayButtons('rate', 'edit');
    !book.year && displayButtons('add');
  } else displayButtons();
}

function displayButtons(...buttons) {
  const removeBtn = document.querySelector('.remove-btn-container');
  const addBtn = document.querySelector('.add-btn');
  const rateBtn = document.querySelector('.rate-btn-container');
  const nextBtn = document.querySelector('.next-btn');
  const editBtn = document.querySelector('.edit-btn');
  const nextBook = document.querySelector('.upcoming-book-container').dataset
    .bookid;
  [removeBtn, addBtn, rateBtn, nextBtn, editBtn].map(
    (btn) => (btn.style.display = 'none')
  );
  if (buttons.includes('remove')) {
    removeBtn.style.display = 'flex';
    !nextBook && (nextBtn.style.display = 'block');
  }
  buttons.includes('add') && (addBtn.style.display = 'flex');
  buttons.includes('rate') && (rateBtn.style.display = 'block');
  buttons.includes('edit') && (editBtn.style.display = 'block');
}

export function hideControls() {
  const dialog = document.querySelector('#welcome-dialog');
  console.log('selected');
  dialog.showModal();
  dialog.addEventListener('click', () => {
    console.log('clicked');
    dialog.close();
  });
  document.querySelector('.control-group').style.display = 'none';
  document.querySelector('.add-date-container').style.display = 'none';
}

export function clearUpcomBook() {
  const container = document.querySelector('.upcoming-book-container');
  container.dataset.bookid = '';
  container.dataset.year = '';
}

export function bookChange() {
  const newAuthor = document.querySelector('.newAuthorInput');
  const newTitle = document.querySelector('.newTitleInput');
  const newPages = document.querySelector('.newPagesInput');
  const newDesc = document.querySelector('.newDesc');
  newAuthor.style.display = 'none';
  newTitle.style.display = 'none';
  newPages.style.display = 'none';
  newDesc.style.display = 'none';
  return {
    save: true,
    newAuthor: newAuthor.value,
    newTitle: newTitle.value,
    newPages: newPages.value,
    newDesc: newDesc.value,
  };
}

function changeEditBtn(handler) {
  mutateInputs();
  const editBtn = document.querySelector('.edit-btn');
  const saveBtn = document.querySelector('.save-btn');
  editBtn.style.display = 'none';
  saveBtn.style.display = 'block';
  saveBtn.addEventListener('click', () => {
    saveBtn.style.display = 'none';
    document.querySelector('.book-info').style = '';
    handler();
  });
}

// todo: cleaning
function mutateInputs() {
  const title = document.querySelector('.view-title');
  const author = document.querySelector('.view-author');
  const desc = document.querySelector('.view-desc');
  const pages = document.querySelector('.view-pages');
  const info = document.querySelector('.book-info');
  const heig = info.offsetHeight;
  const wid = info.offsetWidth;
  info.style.height = `${heig + 200}px`;

  const newTitle = document.createElement('input');
  newTitle.value = title.innerHTML;
  newTitle.classList.add('newTitleInput');
  newTitle.style.width = `${wid - 40}px`;
  title.parentElement.prepend(newTitle);
  title.style.display = 'none';

  const newAuthor = document.createElement('input');
  newAuthor.value = author.innerHTML;
  newAuthor.classList.add('newAuthorInput');
  author.parentElement.prepend(newAuthor);
  author.style.display = 'none';

  const newPages = document.createElement('input');
  newPages.value = pages.innerHTML;
  newPages.classList.add('newPagesInput');
  newPages.setAttribute('type', 'number');
  pages.parentElement.append(newPages);
  pages.style.display = 'none';

  const newDesc = document.createElement('textarea');
  newDesc.classList.add('newDesc');
  newDesc.innerHTML = desc.innerText;
  desc.parentElement.append(newDesc);
  desc.style.display = 'none';
}
