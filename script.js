document.addEventListener('DOMContentLoaded', () => {
  const siteContent = document.getElementById('siteContent');
  const loader = document.getElementById('loader');
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');
  const gameModal = document.getElementById('gameModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalIcon = document.getElementById('modalIcon');
  const modalScreenshots = document.getElementById('modalScreenshots');
  const modalDownload = document.getElementById('modalDownload');
  const gamesList = document.getElementById('gamesList');
  const showMoreBtn = document.getElementById('showMoreBtn');

  siteContent.style.display = 'block';

  menuToggle.onclick = () => {
    sideMenu.classList.add('open');
    overlay.classList.add('active');
    overlay.classList.remove('hidden');
  };

  menuClose.onclick = closeMenu;
  overlay.onclick = closeMenu;

  function closeMenu() {
    sideMenu.classList.remove('open');
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
  }

  function showLoader(show = true) {
    loader.style.display = show ? 'flex' : 'none';
  }

  function openModal(data) {
    modalTitle.textContent = data.title || 'Без названия';
    modalDesc.textContent = data.description || '';
    modalIcon.src = data.icon || '';
    modalDownload.href = data.download || '#';
    modalScreenshots.innerHTML = '';

    if (data.screenshots && Array.isArray(data.screenshots)) {
      data.screenshots.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'w-full rounded';
        modalScreenshots.appendChild(img);
      });
    }

    gameModal.classList.add('show');
  }

  window.closeModal = () => {
    gameModal.classList.remove('show');
  };

  function renderItems(items) {
    gamesList.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'bg-purple-800 rounded p-3 shadow-md cursor-pointer hover:bg-purple-700 transition';
      div.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${item.icon}" class="w-12 h-12 rounded" />
          <div>
            <h3 class="text-lg font-semibold">${item.title}</h3>
            <p class="text-sm text-gray-300">${item.description || ''}</p>
          </div>
        </div>
      `;
      div.onclick = () => openModal(item);
      gamesList.appendChild(div);
    });
  }

  async function fetchData() {
    showLoader(true);
    try {
      // Замените этот массив или подключите fetch из внешнего файла
      const data = [
        {
          title: "Cool Game",
          description: "Awesome gameplay",
          icon: "https://via.placeholder.com/100",
          download: "https://example.com/file.ipa",
          screenshots: ["https://via.placeholder.com/300x600"]
        },
        {
          title: "Cool App",
          description: "Productivity tool",
          icon: "https://via.placeholder.com/100",
          download: "https://example.com/app.ipa",
          screenshots: []
        }
      ];
      renderItems(data);
    } catch (e) {
      alert('Ошибка загрузки данных');
    } finally {
      showLoader(false);
    }
  }

  fetchData();
});
