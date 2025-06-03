let allGames = [];
let displayed = 0;
const batchSize = 6;

const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const gamesList = document.getElementById('gamesList');
const topList = document.getElementById('topList');

let currentFilter = '';

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    showMore();
  }
});

searchInput.addEventListener('input', applyFilter);
genreFilter.addEventListener('change', applyFilter);

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    allGames = data;
    renderTopGames();
    applyFilter();
  });

function renderTopGames() {
  // Берем первые 3 игры для топ-листа, можно заменить логику по рейтингу
  const topGames = allGames.slice(0, 3);
  topList.innerHTML = '';
  topGames.forEach(game => {
    topList.insertAdjacentHTML('beforeend', createTile(game, true));
  });
}

function applyFilter() {
  displayed = 0;
  currentFilter = searchInput.value.toLowerCase();
  gamesList.innerHTML = '';
  showMore();
}

function showMore() {
  const genre = genreFilter.value;
  const filtered = allGames.filter(g =>
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
