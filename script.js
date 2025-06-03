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
    card.className = 'card-glow fade-in p-5 rounded-2xl flex flex-col items-center text-center';
    card.innerHTML = `
      <img src="${game.icon}" alt="${game.name}" class="w-20 h-20 object-contain mb-4 rounded-lg shadow-md">
      <h2 class="text-lg font-bold mb-1">${game.name}</h2>
      <p class="text-sm text-gray-300 mb-3">${game.description}</p>
      <a href="${game.download}" class="glass-button">Скачать</a>
    `;
    gameList.appendChild(card);
  });
}
