// --- Исправленный массив паролей (строки в кавычках) ---
const validPasswords = ['password123', 'letmein', 'secret2025', 'mySuperPass'];

const passwordOverlay = document.getElementById('passwordOverlay');
const passwordInput = document.getElementById('passwordInput');
const passwordSubmit = document.getElementById('passwordSubmit');
const passwordError = document.getElementById('passwordError');
const siteContent = document.getElementById('siteContent');

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

// Простое логирование в консоль вместо вывода на страницу
function log(...args) {
  console.log(...args);
}

// Обработка нажатия кнопки входа по паролю
passwordSubmit.addEventListener('click', () => {
  const entered = passwordInput.value.trim();
  log(`Введён пароль: "${entered}"`);
  if (validPasswords.includes(entered)) {
    log('Пароль правильный, показываем сайт');
    passwordOverlay.style.display = 'none';
    siteContent.style.display = 'block';
    resetAndLoad();
  } else {
    log('Пароль НЕ правильный');
    passwordError.textContent = 'Неверный пароль. Попробуйте ещё раз.';
    passwordInput.value = '';
    passwordInput.focus();
  }
});

// Вход по Enter в поле
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    passwordSubmit.click();
  }
});

// Меню
menuToggle.addEventListener('click', () => {
  log('Открываем меню');
  sideMenu.classList.add('open');
  overlay.classList.add('active');
});
menuClose.addEventListener('click', () => {
  closeMenu();
});
overlay.addEventListener('click', () => {
  closeMenu();
});

function closeMenu() {
  log('Закрываем меню');
  sideMenu.classList.remove('open');
  overlay.classList.remove('active');
}

// При клике по пунктам меню — загружаем список
document.querySelectorAll('.menuItem').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCatalog = btn.dataset.catalog;
    currentList = btn.dataset.list;
    log(`Выбран каталог: ${currentCatalog}, список: ${currentList}`);
    closeMenu();
    resetAndLoad();
  });
});

// Загрузка JSON с играми и приложениями
async function loadData() {
  try {
    log('Загрузка данных...');
    const gamesResponse = await fetch('games.json');
    const appsResponse = await fetch('apps.json');
    allGames = await gamesResponse.json();
    allApps = await appsResponse.json();
    log(`Данные загружены: игр=${allGames.length}, приложений=${allApps.length}`);
  } catch (e) {
    console.error('Ошибка загрузки данных:', e);
  }
}

// Отрисовка списка с учётом фильтров и пагинации
function renderList() {
  const items = currentCatalog === 'games' ? allGames : allApps;

  // Фильтрация
  let filtered = items.filter(item => {
    const searchLower = searchInput.value.toLowerCase();
    const genre = genreFilter.value;
    const titleMatch = item.title.toLowerCase().includes(searchLower);
    const genreMatch = genre === '' || (item.genre && item.genre === genre);
    return titleMatch && genreMatch;
  });

  displayed = 0;
  gamesList.innerHTML = '';
  showMoreBtn.style.display = filtered.length > batchSize ? 'inline-block' : 'none';
  mainListTitle.textContent = currentCatalog === 'games' ? 'Игры' : 'Приложения';

  log(`Отрисовка списка: найдено ${filtered.length} элементов, показываем первые ${batchSize}`);

  loadMore(filtered);
}

// Подгрузка следующей партии
function loadMore(filtered) {
  const items = currentCatalog === 'games' ? allGames : allApps;

  let filteredItems = filtered || items;

  const nextBatch = filteredItems.slice(displayed, displayed + batchSize);
  nextBatch.forEach(item => {
    const el = document.createElement('div');
    el.className = 'game-item p-3 rounded-lg cursor-pointer bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-800';
    el.textContent = item.title;
    el.addEventListener('click', () => showModal(item));
    gamesList.appendChild(el);
  });
  displayed += nextBatch.length;

  if (displayed >= filteredItems.length) {
    showMoreBtn.style.display = 'none';
    log('Показаны все элементы');
  } else {
    showMoreBtn.style.display = 'inline-block';
    log(`Показано ${displayed} элементов, осталось ещё`);
  }
}

// Кнопка "Показать ещё"
showMoreBtn.addEventListener('click', () => {
  const items = currentCatalog === 'games' ? allGames : allApps;
  let filtered = items.filter(item => {
    const searchLower = searchInput.value.toLowerCase();
    const genre = genreFilter.value;
    const titleMatch = item.title.toLowerCase().includes(searchLower);
    const genreMatch = genre === '' || (item.genre && item.genre === genre);
    return titleMatch && genreMatch;
  });
  loadMore(filtered);
});

// Обработчики фильтров
searchInput.addEventListener('input', renderList);
genreFilter.addEventListener('change', renderList);

// Модальное окно
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalIcon = document.getElementById('modalIcon');
const modalDownload = document.getElementById('modalDownload');
const modalScreenshots = document.getElementById('modalScreenshots');

function showModal(item) {
  modalTitle.textContent = item.title;
  modalDesc.textContent = item.description || '';
  modalIcon.src = item.icon || '';
  modalDownload.href = item.download || '#';
  modalScreenshots.innerHTML = '';

  if (item.screenshots && item.screenshots.length > 0) {
    item.screenshots.forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'rounded-lg mb-2 w-full';
      modalScreenshots.appendChild(img);
    });
  }

  gameModal.classList.remove('hidden');
}

function closeModal() {
  gameModal.classList.add('hidden');
}

gameModal.addEventListener('click', (e) => {
  if (e.target === gameModal) closeModal();
});

// Инициализация
async function resetAndLoad() {
  await loadData();
  catalogSection.classList.remove('hidden');
  searchInput.value = '';
  genreFilter.value = '';
  renderList();
}

  searchInput.value = '';
  genreFilter.value = '';
  renderList();
}
