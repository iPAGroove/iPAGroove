let allGames = [];

fetch('games.json')
  .then(response => response.json())
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
    card.className =
      'bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center transform hover:scale-105 transition duration-300 fade-in';
    card.innerHTML = `
      <img src="${game.icon}" alt="${game.name}" class="w-20 h-20 object-contain mb-4">
      <h2 class="text-xl font-bold mb-1">${game.name}</h2>
      <p class="text-gray-500 mb-3">${game.description}</p>
      <a href="${game.download}" class="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">Download</a>
    `;
    gameList.appendChild(card);
  });
}
