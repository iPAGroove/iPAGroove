let allGames = [];

fetch('games.json')
  .then(res => res.json())
  .then(data => {
    allGames = data;
    renderGames(data);
  });

const gameList = document.getElementById('game-list');
const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');

searchInput.addEventListener('input', updateFilters);
genreFilter.addEventListener('change', updateFilters);

function updateFilters() {
  const search = searchInput.value.toLowerCase();
  const genre = genreFilter.value;
  const filtered = allGames.filter(game =>
    game.name.toLowerCase().includes(search) &&
    (genre === "" || game.genre === genre)
  );
  renderGames(filtered);
}

function renderGames(games) {
  gameList.innerHTML = "";
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow p-4 flex flex-col items-center text-center';
    card.innerHTML = `
      <img src="${game.icon}" alt="${game.name}" class="w-16 h-16 object-contain mb-2">
      <h2 class="text-lg font-semibold">${game.name}</h2>
      <p class="text-sm text-gray-600 mb-3">${game.description}</p>
      <a href="${game.download}" class="bg-blue-500 text-white px-4 py-1.5 rounded-full hover:bg-blue-600 text-sm transition">Download</a>
    `;
    gameList.appendChild(card);
  });
}
