let allGames = [];

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    allGames = data;
    renderSections(data);
  });

function createCard(game) {
  return `
    <div class="game-card">
      <img src="${game.icon}" class="w-16 h-16 rounded-lg mb-2 mx-auto" />
      <h3 class="text-sm font-semibold text-center">${game.name}</h3>
      <a href="${game.download}" class="block mt-2 text-center text-blue-300 underline text-sm">Скачать</a>
    </div>
  `;
}

function createTile(game) {
  return `
    <div class="tile">
      <img src="${game.icon}" class="w-12 h-12 rounded-lg mr-4" />
      <div class="flex-1">
        <h3 class="text-base font-bold">${game.name}</h3>
        <p class="text-sm text-gray-300">${game.description}</p>
      </div>
      <a href="${game.download}" class="ml-3 text-blue-400 underline text-sm">Скачать</a>
    </div>
  `;
}

function renderSections(data) {
  const topList = document.getElementById('top-list');
  const arcadeList = document.getElementById('arcade-list');
  const puzzleList = document.getElementById('puzzle-list');
  const allList = document.getElementById('all-list');

  topList.innerHTML = data
    .filter(g => g.top)
    .map(createCard).join('');

  arcadeList.innerHTML = data
    .filter(g => g.genre === 'Arcade')
    .map(createCard).join('');

  puzzleList.innerHTML = data
    .filter(g => g.genre === 'Puzzle')
    .map(createCard).join('');

  allList.innerHTML = data.map(createTile).join('');
}

// Поиск и фильтрация
document.getElementById('searchInput').addEventListener('input', filterGames);
document.getElementById('genreFilter').addEventListener('change', filterGames);

function filterGames() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const genre = document.getElementById('genreFilter').value;

  const filtered = allGames.filter(g =>
    g.name.toLowerCase().includes(search) &&
    (genre === "" || g.genre === genre)
  );

  document.getElementById('all-list').innerHTML = filtered.map(createTile).join('');
}
