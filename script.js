let allGames = [];
let allApps = [];
let displayed = 0;
const batchSize = 5;

const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const gamesList = document.getElementById('gamesList');
const showMoreBtn = document.getElementById('showMoreBtn');
const mainListTitle = document.getElementById('mainListTitle');

const sideMenu = document.getElementById('sideMenu');
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const overlay = document.getElementById('overlay');

const catalogSection = document.getElementById('catalogSection');

let currentCatalog = 'games';
let currentList = 'all';
let currentFilter = '';

// Меню
menuToggle.addEventListener('click', () => {
  sideMenu.classList.add('open');
  overlay.classList.add('active');
});
menuClose.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
function closeMenu() {
  sideMenu.classList.remove('open');
  overlay.classList.remove('active');
}

// Навигация
document.querySelectorAll('.menuItem').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCatalog = btn.dataset.catalog;
    currentList = btn.dataset.list;
    closeMenu();
    catalogSection.classList.remove('hidden');
    resetAndLoad();
  });
});

// Обновление списка
function resetAndLoad() {
  displayed = 0;
  currentFilter = '';
  searchInput.value = '';
  genreFilter.value = '';
  gamesList.innerHTML = '';
  showMoreBtn.classList.add('hidden');

  const catalogName = currentCatalog === 'games' ? 'Игры' : 'Приложения';
  mainListTitle.textContent = `Все — ${catalogName}`;
  document.getElementById('filterSection').style.display = 'block';

  loadData();
}

function loadData() {
  if (currentCatalog === 'games' && allGames.length === 0) {
    fetch('games.json')
      .then(res => res.json())
      .then(data => {
        allGames = data;
        renderBatch();
      });
  } else if (currentCatalog === 'apps' && allApps.length === 0) {
    fetch('apps.json')
      .then(res => res.json())
      .then(data => {
        allApps = data;
        renderBatch();
      });
  } else {
    renderBatch();
  }
}

function filterItems(items) {
  let filtered = items;

  // Поиск
  if (searchInput.value.trim()) {
    const search = searchInput.value.trim().toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(search));
  }
  // Фильтр по жанру
  if (genreFilter.value) {
    filtered = filtered.filter(i => i.genre === genreFilter.value);
  }
  return filtered;
}

function renderBatch() {
  const items = currentCatalog === 'games' ? allGames : allApps;
  const filtered = filterItems(items);

  if (displayed === 0) {
    gamesList.innerHTML = '';
  }

  const nextBatch = filtered.slice(displayed, displayed + batchSize);
  for (const item of nextBatch) {
    gamesList.appendChild(createItemCard(item));
  }

  displayed += nextBatch.length;

  if (displayed < filtered.length) {
    showMoreBtn.classList.remove('hidden');
  } else {
    showMoreBtn.classList.add('hidden');
  }
}

// Создание карточки игры/приложения
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'bg-purple-900 bg-opacity-50 rounded-lg p-3 flex gap-4 cursor-pointer hover:bg-purple-800 transition';

  const icon = document.createElement('img');
  icon.src = item.icon;
  icon.alt = item.title;
  icon.className = 'w-16 h-16 rounded-xl flex-shrink-0';
  card.appendChild(icon);

  const info = document.createElement('div');
  info.className = 'flex flex-col justify-between flex-grow';

  const title = document.createElement('h3');
  title.textContent = item.title;
  title.className = 'font-semibold text-lg truncate';
  info.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = item.description;
  desc.className = 'text-sm text-gray-300 line-clamp-2';
  info.appendChild(desc);

  card.appendChild(info);

  card.addEventListener('click', () => {
    openModal(item);
  });

  return card;
}

// Модалка
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalIcon = document.getElementById('modalIcon');
const modalDownload = document.getElementById('modalDownload');
const modalScreenshots = document.getElementById('modalScreenshots');

function openModal(item) {
  modalTitle.textContent = item.title;
  modalDesc.textContent = item.description;
  modalIcon.src = item.icon;
  modalDownload.href = item.downloadUrl || '#';
  modalDownload.textContent = item.downloadUrl ? 'Скачать' : 'Ссылки отсутствуют';

  // Скриншоты
  modalScreenshots.innerHTML = '';
  if (item.screenshots && item.screenshots.length) {
    for (const scr of item.screenshots) {
      const img = document.createElement('img');
      img.src = scr;
      img.alt = item.title + ' screenshot';
      img.className = 'rounded-lg mb-2 w-full max-h-48 object-contain';
      modalScreenshots.appendChild(img);
    }
  }

  modal.classList.remove('hidden');
}

window.closeModal = function () {
  modal.classList.add('hidden');
};

// Ленивый показ "Показать ещё"
showMoreBtn.addEventListener('click', () => {
  renderBatch();
});

// Фильтры
searchInput.addEventListener('input', () => {
  displayed = 0;
  gamesList.innerHTML = '';
  renderBatch();
});
genreFilter.addEventListener('change', () => {
  displayed = 0;
  gamesList.innerHTML = '';
  renderBatch();
});
