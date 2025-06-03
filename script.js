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
        applyFilter();
      });
  } else if (currentCatalog === 'apps' && allApps.length === 0) {
    fetch('apps.json')
      .then(res => res.json())
      .then(data => {
        allApps = data;
        applyFilter();
      });
  } else {
    applyFilter();
  }
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

  if (displayed < filtered.length) {
    showMoreBtn.classList.remove('hidden');
  } else {
    showMoreBtn.classList.add('hidden');
  }
}

showMoreBtn.addEventListener('click', showMore);

function createTile(game) {
  return `
    <div onclick='openModal(${JSON.stringify(game).replace(/'/g, "\\'")})'
         class="bg-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition">
      <img src="${game.icon}" alt="${game.name}" class="w-16 h-16 rounded-xl flex-shrink-0" />
      <div class="flex-1">
        <h3 class="text-lg font-bold truncate">${game.name}</h3>
        <p class="text-sm text-gray-300 line-clamp-2">${game.description}</p>
      </div>
    </div>
  `;
}

// Модальное окно
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

// Фильтрация
searchInput.addEventListener('input', applyFilter);
genreFilter.addEventListener('change', applyFilter);

// Удаляем автоматическую загрузку на старте
// resetAndLoad(); <-- Эта строка удалена
