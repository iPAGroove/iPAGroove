"use strict";

const loader = document.getElementById('loader');
const sideMenu = document.getElementById('sideMenu');
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const overlay = document.getElementById('overlay');

const mainListTitle = document.getElementById('mainListTitle');
const gamesList = document.getElementById('gamesList');
const showMoreBtn = document.getElementById('showMoreBtn');

const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalVersion = document.getElementById('modalVersion');
const modalDownload = document.getElementById('modalDownload');
const modalIcon = document.getElementById('modalIcon');
const modalClose = document.getElementById('modalClose');

let currentItems = [];
let itemsPerPage = 6;
let currentPage = 1;

async function fetchJSON(filename) {
  showLoader();
  try {
    const response = await fetch(filename);
    if (!response.ok) throw new Error(`Ошибка загрузки ${filename}`);
    const data = await response.json();
    return data;
  } catch (e) {
    alert(e.message);
    return [];
  } finally {
    hideLoader();
  }
}

function showLoader() {
  loader.style.display = 'flex';
}
function hideLoader() {
  loader.style.display = 'none';
}

function openMenu() {
  sideMenu.classList.add('open');
  overlay.classList.add('active');
}
function closeMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('active');
}

menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
overlay.addEventListener('click', () => {
  closeMenu();
  closeModal();
});

modalClose.addEventListener('click', closeModal);

// Отобразить список игр или приложений
function renderList(items, page = 1) {
  if (!items || !items.length) {
    gamesList.innerHTML = '<p class="text-center text-lg text-purple-300">Пусто</p>';
    showMoreBtn.style.display = 'none';
    return;
  }

  if (page === 1) gamesList.innerHTML = '';

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pagedItems = items.slice(start, end);

  for (const item of pagedItems) {
    const div = document.createElement('div');
    div.className = "bg-purple-900/60 rounded-xl p-3 flex gap-3 items-center cursor-pointer hover:bg-purple-700 transition";
    div.tabIndex = 0;
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', `Открыть ${item.title}`);

    div.innerHTML = `
      <img src="${item.icon}" alt="Иконка ${item.title}" class="w-16 h-16 rounded-lg flex-shrink-0 object-cover" />
      <div class="flex flex-col justify-center">
        <h3 class="font-semibold text-lg">${item.title}</h3>
        <p class="text-sm text-purple-300">Версия: ${item.version}</p>
      </div>
    `;

    div.addEventListener('click', () => openModal(item));
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(item);
      }
    });

    gamesList.appendChild(div);
  }

  // Показать или скрыть кнопку "Показать ещё"
  if (end < items.length) {
    showMoreBtn.style.display = 'inline-block';
  } else {
    showMoreBtn.style.display = 'none';
  }
}

// Открыть модальное окно с информацией
function openModal(item) {
  modalTitle.textContent = item.title;
  modalVersion.textContent = `Версия: ${item.version}`;
  modalDownload.href = item.downloadUrl;
  modalDownload.setAttribute('download', '');
  modalIcon.src = item.icon;
  modalIcon.alt = `Иконка ${item.title}`;
  gameModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Закрыть модальное окно
function closeModal() {
  gameModal.classList.remove('show');
  document.body.style.overflow = '';
}

let currentCatalog = 'games';

async function loadCatalog(catalog) {
  currentCatalog = catalog;
  currentPage = 1;
  mainListTitle.textContent = catalog === 'games' ? 'Все игры' : 'Все приложения';
  const data = await fetchJSON(`${catalog}.json`);
  currentItems = data;
  renderList(currentItems, currentPage);
  closeMenu();
}

showMoreBtn.addEventListener('click', () => {
  currentPage++;
  renderList(currentItems, currentPage);
});

// При загрузке страницы - по умолчанию игры
window.addEventListener('DOMContentLoaded', () => {
  loadCatalog('games');
});

// Обработчики для меню
document.querySelectorAll('.menuItem').forEach(btn => {
  btn.addEventListener('click', () => {
    loadCatalog(btn.dataset.catalog);
  });
});
