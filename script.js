let allGames = [];
let displayed = 0;
const batchSize = 12;

const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');
const gamesList = document.getElementById('gamesList');

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
    applyFilter();
  });

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

function createTile(game) {
  return `
    <div class="bg-white/10 rounded-xl p-4 flex items-center gap-4">
      <img src="${game.icon}" alt="${game.name}" class="w-16 h-16 rounded-xl flex-shrink-0" />
      <div class="flex-1">
        <h3 class="text-lg font-bold">${game.name}</h3>
        <p class="text-sm text-gray-300">${game.description}</p>
      </div>
      <a href="${game.download}" class="text-blue-400 underline text-sm flex-shrink-0">Скачать</a>
    </div>
  `;
}
