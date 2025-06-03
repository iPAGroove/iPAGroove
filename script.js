// --- Массив валидных паролей ---
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

// Логирование в консоль
function log(...args) {
  console.log(...args);
}

// Обработчик входа по паролю
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

// Вход по Enter
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    passwordSubmit.click();
  }
});

// Меню
menuToggle.addEventListener('click', () => {
  log('Открываем меню');
  sideMenu.classList.add('open');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');
});
menuClose.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

function closeMenu() {
  log('Закрываем меню');
  sideMenu.classList.remove('open');
  overlay.classList.remove('active');
  setTimeout(() => overlay.classList.add('hidden'), 300);
}

// Кнопки меню — выбор каталога
document.querySelectorAll('.menuItem').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCatalog = btn.dataset.catalog;
    currentList = btn.dataset.list;
    log(`Выбран каталог: ${currentCatalog}, список: ${currentList}`);
    closeMenu();
    resetAndLoad();
  });
});

// Загрузка данных (предполагается, что есть файлы games.json и apps.json)
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

// Отрисовка списка с фильтрами и пагинацией
function renderList() {
  const items = currentCatalog === 'games' ? allGames : allApps;

  let filtered = items.filter(item => {
    const search = searchInput.value.trim().toLowerCase();
    const genre = genreFilter.value;

    if (search && !item.name.toLowerCase().includes(search)) return false;
    if (genre && item.genre !== genre) return false;
    return true;
  });

  mainListTitle.textContent = `${currentCatalog === 'games' ? 'Игры' : 'Приложения'} — всего: ${filtered.length}`;

  // Отображаем часть списка
  const toShow = filtered.slice(0, displayed);
  gamesList.innerHTML = '';

  if (toShow.length === 0) {
    gamesList.innerHTML = '<p>Ничего не найдено</p>';
    showMoreBtn.style.display = 'none';
    return;
  }

  toShow.forEach(item => {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-4 bg-purple-900 bg-opacity-30 p-3 rounded cursor-pointer hover:bg-purple-700 transition';
    div.innerHTML = `
      <img src="${item.icon}" alt="${item.name}" class="w-12 h-12 rounded-xl flex-shrink-0" />
      <div class="flex-grow">
        <h3 class="font-semibold text-lg">${item.name}</h3>
        <p class="text-sm text-purple-200">${item.genre} | ${item.size || '–'}</p>
      </div>
      <div class="text-purple-300 font-semibold">${item.rating ? '⭐'+item.rating : ''}</div>
    `;
    div.addEventListener('click', () => openModal(item));
    gamesList.appendChild(div);
  });

  showMoreBtn.style.display = displayed < filtered.length ? 'inline-block' : 'none';
}

// Кнопка "Показать ещё"
showMoreBtn.addEventListener('click', () => {
  displayed += batchSize;
  renderList();
});

// Фильтры
searchInput.addEventListener('input', () => {
  displayed = batchSize;
  renderList();
});
genreFilter.addEventListener('change', () => {
  displayed = batchSize;
  renderList();
});

// Модальное окно
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalIcon = document.getElementById('modalIcon');
const modalScreenshots = document.getElementById('modalScreenshots');
const modalDownload = document.getElementById('modalDownload');

function openModal(item) {
  modalTitle.textContent = item.name;
  modalDesc.textContent = item.description || 'Нет описания';
  modalIcon.src = item.icon;
  modalScreenshots.innerHTML = '';
  if (item.screenshots && item.screenshots.length > 0) {
    item.screenshots.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${item.name} screenshot`;
      img.className = 'w-full rounded mb-2';
      modalScreenshots.appendChild(img);
    });
  }
  modalDownload.href = item.download || '#';
  modalDownload.textContent = 'Скачать';
  gameModal.classList.remove('hidden');
}

function closeModal() {
  gameModal.classList.add('hidden');
}

// Закрыть модалку при клике вне контента
gameModal.addEventListener('click', (e) => {
  if (e.target === gameModal) closeModal();
});

// Начальная загрузка после правильного пароля
async function resetAndLoad() {
  catalogSection.classList.remove('hidden');
  displayed = batchSize;
  if (allGames.length === 0 && allApps.length === 0) {
    await loadData();
  }
  renderList();
}
