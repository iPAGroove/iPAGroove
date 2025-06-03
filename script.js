let allGames = [];

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    allGames = data;
    renderList(data);
  });

const gamesList = document.getElementById('gamesList');
const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');

searchInput.addEventListener('input', filterGames);
genreFilter.addEventListener('change', filterGames);

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

function renderList(games) {
  gamesList.innerHTML = games.map(createTile).join('');
}

function filterGames() {
  const search = searchInput.value.toLowerCase();
  const genre = genreFilter.value;

  const filtered = allGames.filter(g =>
    g.name.toLowerCase().includes(search) &&
    (genre === "" || g.genre === genre)
  );

  renderList(filtered);
}
