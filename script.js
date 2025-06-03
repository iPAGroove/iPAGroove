let allGames = [];
let allApps = [];
let displayed = 0;
const batchSize = 6;

const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const gamesList = document.getElementById('gamesList');
const topList = document.getElementById('topList');
const listTitle = document.getElementById('listTitle');
const mainListTitle = document.getElementById('mainListTitle');

const sideMenu = document.getElementById('sideMenu');
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const overlay = document.getElementById('overlay');

let currentCatalog = 'games'; // games или apps
let currentList = 'top'; // top или all
let currentFilter = '';

// Открыть/закрыть меню
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

// Обработка выбора из меню
document.querySelectorAll('.menuItem').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCatalog = btn.dataset.catalog;
    currentList = btn.dataset.list;
    closeMenu();
    resetAndLoad();
  });
});

// Сброс и загрузка данных для выбранного каталога и списка
function resetAndLoad() {
  displayed = 0;
  currentFilter = '';
  searchInput.value = '';
  genreFilter.value = '';
  gamesList.innerHTML = '';
  topList.innerHTML = '';

  // Обновляем заголовки и фильтры
  const catalogName = currentCatalog === 'games' ? 'Игры' : 'Приложения';
  if (currentList === 'top') {
    listTitle.textContent = `👑 Топ недели — ${catalogName}`;
    mainListTitle.textContent = '';
    document.getElementById('filterSection').style.display = 'none';
  } else {
    listTitle.textContent = '';
    mainListTitle.textContent = `Все — ${catalogName}`;
    document.getElementById('filterSection').style.display = 'block';
  }

  loadData();
}

// Загрузка данных в зависимости от текущего каталога
function loadData() {
  if (currentCatalog === 'games' && allGames.length === 0) {
    fetch('games.json')
      .then(res => res.json())
      .then(data => {
        allGames = data;
        render();
      });
  } else if (currentCatalog === 'apps' && allApps.length === 0) {
    fetch('apps.json')
      .then(res => res.json())
      .then(data => {
        allApps = data;
        render();
      });
  } else {
    render();
  }
}

// Рендер контента в зависимости от текущего списка
function render() {
  if (currentList === 'top') {
    renderTop();
  } else {
    applyFilter();
  }
}

function renderTop() {
  const data = currentCatalog === 'games' ? allGames : allApps;
  const topItems = data.slice(0, 3);
  topList.innerHTML = '';
  topItems.forEach(item => {
    topList.insertAdjacentHTML('beforeend', createTile(item, true));
  });
  gamesList.innerHTML = '';
}

function applyFilter() {
  displayed = 0;
  currentFilter = searchInput.value.toLowerCase();
  gamesList.innerHTML = '';
  showMore();
}

function showMore() {
  const genre = genreFilter.value;
  const data = currentCatalog === 'games' ? allGames : allApps;
  const filtered = data.filter(g =>
    g.name.toLowerCase().includes(currentFilter) &&
    (genre === "" || g.genre === genre)
  );

  const slice = filtered.slice(displayed, displayed + batchSize);
  slice.forEach(game => {
    gamesList.insertAdjacentHTML('beforeend', createTile(game));
  });
  displayed += slice.length;
}

function createTile(game, small = false) {
  return `
    <div onclick='openModal(${JSON.stringify(game).replace(/'/g, "\\'")})'
         class="bg-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition ${small ? "min-w-[180px]" : ""}">
      <img src="${game.icon}" alt="${game.name}" class="w-16 h-16 rounded-xl flex-shrink-0" />
      <div class="flex-1 ${small ? "overflow-hidden" : ""}">
        <h3 class="text-lg font-bold truncate">${game.name}</h3>
        ${small ? '' : `<p class="text-sm text-gray-300 line-clamp-2">${game.description}</p>`}
      </div>
    </div>
  `;
}

function openModal(game) {
  const modal = document.getElementById('gameModal');
  modal.querySelector('#modalIcon').src = game.icon;
  modal.querySelector('#modalTitle').textContent = game.name;
  modal.querySelector('#modalDesc').textContent = game.description;
  modal.querySelector('#modalDownload').href = game.download;

  const screenshots = modal.querySelector('#modalScreenshots');
  screenshots.innerHTML = '';
  if (game.screenshot) {
    screenshots.innerHTML += `<img src="${game.screenshot}" class="w-full rounded-xl mb-2" />`;
  }
  if (game.screenshots && Array.isArray(game.screenshots)) {
    game.screenshots.forEach(src => {
      screenshots.innerHTML += `<img src="${src}" class="w-full rounded-xl mb-2" />`;
    });
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('gameModal').classList.add('hidden');
}

// Слушатели фильтра
searchInput.addEventListener('input', applyFilter);
genreFilter.addEventListener('change', applyFilter);

// Изначальная загрузка каталога игр, топ
resetAndLoad();

// Подгрузка при скролле вниз
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    if (currentList === 'all') {
      showMore();
    }
  }
});
