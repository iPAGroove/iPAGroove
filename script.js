let allGames = [];
let allApps = [];
let displayedGames = 0;
let displayedApps = 0;
const batchSize = 6;

const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');

const gamesList = document.getElementById('gamesList');
const topList = document.getElementById('topList');

const appsList = document.getElementById('appsList');
const topAppsList = document.getElementById('topAppsList');

const tabGames = document.getElementById('tabGames');
const tabApps = document.getElementById('tabApps');

const gamesSection = document.getElementById('gamesSection');
const appsSection = document.getElementById('appsSection');

let currentFilter = '';
let currentGenre = '';
let currentTab = 'games';

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (currentTab === 'games') {
      showMoreGames();
    } else {
      showMoreApps();
    }
  }
});

searchInput.addEventListener('input', applyFilter);
genreFilter.addEventListener('change', () => {
  currentGenre = genreFilter.value;
  applyFilter();
});

tabGames.addEventListener('click', () => switchTab('games'));
tabApps.addEventListener('click', () => switchTab('apps'));

Promise.all([
  fetch('games.json').then(res => res.json()),
  fetch('apps.json').then(res => res.json())
]).then(([gamesData, appsData]) => {
  allGames = gamesData;
  allApps = appsData;
  populateGenreFilter();
  renderTopGames();
  renderTopApps();
  applyFilter();
});

function switchTab(tab) {
  if (tab === currentTab) return;
  currentTab = tab;

  if (tab === 'games') {
    gamesSection.classList.remove('hidden');
    appsSection.classList.add('hidden');
    tabGames.classList.add('bg-blue-600');
    tabGames.classList.remove('bg-white/20');
    tabApps.classList.remove('bg-blue-600');
    tabApps.classList.add('bg-white/20');
  } else {
    gamesSection.classList.add('hidden');
    appsSection.classList.remove('hidden');
    tabApps.classList.add('bg-blue-600');
    tabApps.classList.remove('bg-white/20');
    tabGames.classList.remove('bg-blue-600');
    tabGames.classList.add('bg-white/20');
  }

  // Сброс поиска и фильтра для удобства (опционально)
  searchInput.value = '';
  genreFilter.value = '';
  currentFilter = '';
  currentGenre = '';

  applyFilter();
}

function populateGenreFilter() {
  // Собираем уникальные жанры из обеих коллекций
  const genresSet = new Set();
  [...allGames, ...allApps].forEach(item => {
    if (item.genre) genresSet.add(item.genre);
  });
  genreFilter.innerHTML = `<option value="">Все жанры</option>` +
    [...genresSet].sort().map(g => `<option value="${g}">${g}</option>`).join('');
}

function renderTopGames() {
  const topGames = allGames.slice(0, 3);
  topList.innerHTML = '';
  topGames.forEach(game => {
    topList.insertAdjacentHTML('beforeend', createTile(game, true));
  });
}

function renderTopApps() {
  const topApps = allApps.slice(0, 3);
  topAppsList.innerHTML = '';
  topApps.forEach(app => {
    topAppsList.insertAdjacentHTML('beforeend', createTile(app, true));
  });
}

function applyFilter() {
  displayedGames = 0;
  displayedApps = 0;
  currentFilter = searchInput.value.toLowerCase();
  gamesList.innerHTML = '';
  appsList.innerHTML = '';
  if (currentTab === 'games') {
    showMoreGames();
  } else {
    showMoreApps();
  }
}

function showMoreGames() {
  const filtered = allGames.filter(g =>
    g.name.toLowerCase().includes(currentFilter) &&
    (currentGenre === "" || g.genre === currentGenre)
  );

  const slice = filtered.slice(displayedGames, displayedGames + batchSize);
  slice.forEach(game => {
    gamesList.insertAdjacentHTML('beforeend', createTile(game));
  });
  displayedGames += slice.length;
}

function showMoreApps() {
  const filtered = allApps.filter(app =>
    app.name.toLowerCase().includes(currentFilter) &&
    (currentGenre === "" || app.genre === currentGenre)
  );

  const slice = filtered.slice(displayedApps, displayedApps + batchSize);
  slice.forEach(app => {
    appsList.insertAdjacentHTML('beforeend', createTile(app));
  });
  displayedApps += slice.length;
}

function createTile(item, small = false) {
  return `
    <div onclick='openModal(${JSON.stringify(item).replace(/'/g, "\\'")})'
         class="bg-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition ${small ? "min-w-[180px]" : ""}">
      <img src="${item.icon}" alt="${item.name}" class="w-16 h-16 rounded-xl flex-shrink-0" />
      <div class="flex-1 ${small ? "overflow-hidden" : ""}">
        <h3 class="text-lg font-bold truncate">${item.name}</h3>
        ${small ? '' : `<p class="text-sm text-gray-300 line-clamp-2">${item.description}</p>`}
      </div>
    </div>
  `;
}

function openModal(item) {
  const modal = document.getElementById('itemModal');
  modal.querySelector('#modalIcon').src = item.icon;
  modal.querySelector('#modalTitle').textContent = item.name;
  modal.querySelector('#modalDesc').textContent = item.description;
  modal.querySelector('#modalDownload').href = item.download;

  const screenshots = modal.querySelector('#modalScreenshots');
  screenshots.innerHTML = '';
  if (item.screenshot) {
    screenshots.innerHTML += `<img src="${item.screenshot}" class="w-full rounded-xl mb-2" />`;
  }
  if (item.screenshots && Array.isArray(item.screenshots)) {
    item.screenshots.forEach(src => {
      screenshots.innerHTML += `<img src="${src}" class="w-full rounded-xl mb-2" />`;
    });
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('itemModal').classList.add('hidden');
}
