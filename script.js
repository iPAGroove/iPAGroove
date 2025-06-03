// ----- ХЭШИРОВАНИЕ ПАРОЛЕЙ (SHA-256) -----
const validPasswordHashes = [
  // sha256('password123')
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  // sha256('letmein')
  '1c8bfe8f801d79745c4631d09fff36c82aa37fc4cce4fc946683d7b336b63032',
  // sha256('secret2025')
  'ebc323601c4461ee9026cf1958047246253c66f3a1bad3fd24ce806de865082a',
  // sha256('mySuperPass')
  '632321774977f370359d966cd45112e46d2389a501a663de1c44ab1486d8d9a1'
];

// Элементы DOM
const passwordOverlay = document.getElementById('passwordOverlay');
const passwordInput   = document.getElementById('passwordInput');
const passwordSubmit  = document.getElementById('passwordSubmit');
const passwordError   = document.getElementById('passwordError');
const siteContent     = document.getElementById('siteContent');
const loader          = document.getElementById('loader');

let allGames  = [];
let allApps   = [];
let displayed = 0;
const batchSize = 5;

const searchInput    = document.getElementById('searchInput');
const genreFilter    = document.getElementById('genreFilter');
const gamesList      = document.getElementById('gamesList');
const showMoreBtn    = document.getElementById('showMoreBtn');
const mainListTitle  = document.getElementById('mainListTitle');

const sideMenu   = document.getElementById('sideMenu');
const menuToggle = document.getElementById('menuToggle');
const menuClose  = document.getElementById('menuClose');
const overlay    = document.getElementById('overlay');

const catalogSection = document.getElementById('catalogSection');
let currentCatalog = '';
let currentList    = '';

/** Логирование в консоль */
function log(...args) {
  console.log(...args);
}

/** ----- ФУНКЦИЯ ХЕШИРОВАНИЯ ВВЕДЁННОГО ПАРОЛЯ ----- */
async function hashPassword(pass) {
  const enc = new TextEncoder();
  const data = enc.encode(pass);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/** ----- ПРОВЕРКА, БЫЛ ЛИ УЖЕ РАЗ РАЗРЕШЕН ДОСТУП (localStorage) ----- */
async function checkLocalAccess() {
  if (localStorage.getItem('accessGranted') === 'true') {
    // Показать лоадер, загрузить данные, а потом основной контент
    loader.style.display = 'flex';
    await preloadData();
    loader.style.display = 'none';
    showMainContent();
  }
}

/** ----- ПОКАЗАТЬ ОСНОВНОЙ КОНТЕНТ С ПЛАВНЫМ ПЕРЕХОДОМ ----- */
function showMainContent() {
  siteContent.classList.add('visible');
}

/** ----- ОБРАБОТЧИК КНОПКИ "Войти" ----- */
passwordSubmit.addEventListener('click', async () => {
  const entered = passwordInput.value.trim();
  log(`Введён пароль: "${entered}"`);

  // Вычисляем SHA-256 для введённого пароля:
  const hash = await hashPassword(entered);
  if (validPasswordHashes.includes(hash)) {
    log('Пароль правильный, показываем сайт');
    passwordOverlay.style.display = 'none';
    localStorage.setItem('accessGranted', 'true');

    // Сначала показываем лоадер:
    loader.style.display = 'flex';
    // Ждём загрузки данных:
    await preloadData();
    // Спрячем лоадер и покажем основной контент:
    loader.style.display = 'none';
    showMainContent();
  } else {
    log('Пароль НЕ правильный');
    passwordError.textContent = 'Неверный пароль. Попробуйте ещё раз.';
    passwordInput.value = '';
    passwordInput.focus();
  }
});

/** ----- ОБРАБОТЧИК Enter в поле пароля ----- */
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    passwordSubmit.click();
  }
});

/** ----- МЕНЮ: Открытие / Закрытие ----- */
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

/** ----- КНОПКИ МЕНЮ: выбор каталога ----- */
document.querySelectorAll('.menuItem').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCatalog = btn.dataset.catalog;
    currentList    = btn.dataset.list;
    log(`Выбран каталог: ${currentCatalog}, список: ${currentList}`);
    closeMenu();
    resetAndLoad();
  });
});

/** ----- ПРЕДЗАГРУЗКА ДАННЫХ ИЗ JSON ----- */
async function preloadData() {
  try {
    log('Предзагрузка данных...');
    const [gamesResponse, appsResponse] = await Promise.all([
      fetch('games.json'),
      fetch('apps.json')
    ]);
    allGames = await gamesResponse.json();
    allApps  = await appsResponse.json();
    log(`Данные загружены: игр=${allGames.length}, приложений=${allApps.length}`);
  } catch (e) {
    console.error('Ошибка загрузки данных:', e);
  }
}

/** ----- ОЧИСТКА И ПОДГОТОВКА ПАГИНАЦИИ/ФИЛЬТРА ----- */
function resetAndLoad() {
  catalogSection.classList.remove('hidden');
  displayed = batchSize;
  renderList();
}

/** ----- РЕНДЕР СПИСКА С ФИЛЬТРАМИ + ПАГИНАЦИЕЙ ----- */
function renderList() {
  if (!currentCatalog || !currentList) return;

  const items = currentCatalog === 'games' ? allGames : allApps;

  // 1) Фильтрация
  const search = searchInput.value.trim().toLowerCase();
  const genre  = genreFilter.value;

  const filtered = items.filter(item => {
    if (search && !item.name.toLowerCase().includes(search)) return false;
    if (genre && item.genre !== genre) return false;
    return true;
  });

  mainListTitle.textContent = `${currentCatalog === 'games' ? 'Игры' : 'Приложения'} — всего: ${filtered.length}`;

  // 2) Пагинация
  const toShow = filtered.slice(0, displayed);
  gamesList.innerHTML = '';

  if (toShow.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'Ничего не найдено';
    gamesList.appendChild(p);
    showMoreBtn.style.display = 'none';
    return;
  }

  // 3) Генерация карточек безопасно (без innerHTML)
  toShow.forEach(item => {
    const container = document.createElement('div');
    container.className = 'flex items-center gap-4 bg-purple-900 bg-opacity-30 p-3 rounded cursor-pointer hover:bg-purple-700 transition';

    // Иконка
    const img = document.createElement('img');
    img.src = item.icon;
    img.alt = item.name;
    img.loading = 'lazy';
    img.className = 'w-12 h-12 rounded-xl flex-shrink-0';
    container.appendChild(img);

    // Блок с именем/жанром
    const textWrapper = document.createElement('div');
    textWrapper.className = 'flex-grow';

    const h3 = document.createElement('h3');
    h3.className = 'font-semibold text-lg';
    h3.textContent = item.name;
    textWrapper.appendChild(h3);

    const p = document.createElement('p');
    p.className = 'text-sm text-purple-200';
    p.textContent = `${item.genre} | ${item.size || '–'}`;
    textWrapper.appendChild(p);

    container.appendChild(textWrapper);

    // Рейтинг
    if (item.rating) {
      const span = document.createElement('div');
      span.className = 'text-purple-300 font-semibold';
      span.textContent = '⭐' + item.rating;
      container.appendChild(span);
    }

    container.addEventListener('click', () => openModal(item));
    gamesList.appendChild(container);
  });

  showMoreBtn.style.display = displayed < filtered.length ? 'inline-block' : 'none';
}

/** ----- ПАГИНАЦИЯ: кнопка "Показать ещё" ----- */
showMoreBtn.addEventListener('click', () => {
  displayed += batchSize;
  renderList();
});

/** ----- ФИЛЬТРЫ: сброс пагинации при вводе/смене жанра ----- */
searchInput.addEventListener('input', () => {
  displayed = batchSize;
  renderList();
});
genreFilter.addEventListener('change', () => {
  displayed = batchSize;
  renderList();
});

/** ----- МОДАЛЬНОЕ ОКНО (XSS‐БЕЗОПАСНО) ----- */
const gameModal        = document.getElementById('gameModal');
const modalTitle       = document.getElementById('modalTitle');
const modalDesc        = document.getElementById('modalDesc');
const modalIcon        = document.getElementById('modalIcon');
const modalScreenshots = document.getElementById('modalScreenshots');
const modalDownload    = document.getElementById('modalDownload');

function openModal(item) {
  modalTitle.textContent = item.name;
  modalDesc.textContent  = item.description || 'Нет описания';

  modalIcon.src = item.icon;
  modalIcon.alt = item.name;
  modalIcon.loading = 'lazy';

  modalScreenshots.innerHTML = '';
  if (Array.isArray(item.screenshots) && item.screenshots.length > 0) {
    item.screenshots.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${item.name} screenshot`;
      img.loading = 'lazy';
      img.className = 'w-full rounded mb-2';
      modalScreenshots.appendChild(img);
    });
  }

  modalDownload.href = item.download || '#';
  modalDownload.textContent = 'Скачать';

  gameModal.classList.add('show');
}

function closeModal() {
  gameModal.classList.remove('show');
}

gameModal.addEventListener('click', (e) => {
  if (e.target === gameModal) closeModal();
});

/** ----- ПОКАЗ СПИСКА ПОСЛЕ ВЫБОРА ИЗ МЕНЮ ----- */
function resetAndLoad() {
  catalogSection.classList.remove('hidden');
  displayed = batchSize;
  renderList();
}

/** ----- КОД ВЫПОЛНЯЕТСЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ----- */
document.addEventListener('DOMContentLoaded', () => {
  checkLocalAccess();
});
