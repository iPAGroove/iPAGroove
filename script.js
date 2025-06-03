fetch('games.json')
  .then(response => response.json())
  .then(games => {
    const container = document.getElementById('game-list');

    games.forEach(game => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow p-4 flex flex-col items-center text-center';

      card.innerHTML = `
        <img src="${game.icon}" alt="${game.name}" class="w-20 h-20 object-contain mb-4">
        <h2 class="text-xl font-semibold">${game.name}</h2>
        <p class="text-sm mb-4">${game.description}</p>
        <a href="${game.download}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Download</a>
      `;

      container.appendChild(card);
    });
  });
