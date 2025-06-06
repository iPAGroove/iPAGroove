document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const mainListTitle = document.getElementById("mainListTitle");
  const gamesList = document.getElementById("gamesList");
  const gameModal = document.getElementById("gameModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDownload = document.getElementById("modalDownload");
  const modalIcon = document.getElementById("modalIcon");
  const loader = document.getElementById("loader");
  const searchInput = document.getElementById("searchInput");

  const menuItems = document.querySelectorAll(".menuItem");

  let gamesData = [];
  let appsData = [];
  let currentCategory = null; // "games" или "apps"
  let isSearching = false;

  async function loadJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Ошибка загрузки " + url);
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async function loadData() {
    loader.style.display = "flex";
    gamesData = await loadJSON("games.json");
    appsData = await loadJSON("apps.json");
    loader.style.display = "none";
  }

  function closeMenu() {
    sideMenu.classList.remove("open");
    overlay.classList.add("hidden");
  }

  function openModal(item) {
    modalTitle.textContent = `${item.name}${item.version ? ` — Version ${item.version}` : ""}`;
    modalDesc.textContent = item.description || "Нет описания";
    modalIcon.src = item.icon || "";
    modalIcon.alt = item.name || "";
    modalDownload.href = item.download || "#";
    modalDownload.style.display = item.download ? "block" : "none";

    gameModal.classList.add("show");
    overlay.classList.remove("hidden");
  }

  window.closeModal = function () {
    gameModal.classList.remove("show");
    overlay.classList.add("hidden");
  };

  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("open");
    overlay.classList.remove("hidden");
  });

  menuClose.addEventListener("click", closeMenu);
  overlay.addEventListener("click", () => {
    closeMenu();
    closeModal();
  });

  menuItems.forEach((btn) => {
    btn.addEventListener("click", async () => {
      closeMenu();
      isSearching = false;
      searchInput.value = "";
      const type = btn.dataset.catalog;
      currentCategory = type;
      const items = type === "games" ? gamesData : appsData;
      mainListTitle.textContent = type === "games" ? "🎮 Все игры" : "📱 Все приложения";
      renderList(items);
    });
  });

  function renderList(items) {
    gamesList.innerHTML = "";
    if (!items.length) {
      gamesList.innerHTML = "<p class='text-center text-gray-400'>Пусто</p>";
      return;
    }
    items.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "flex gap-4 p-3 rounded-lg bg-[rgba(110,28,255,0.3)] cursor-pointer hover:bg-purple-700 transition";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-pressed", "false");

      card.innerHTML = `
        <img src="${item.icon}" alt="${item.name}" class="w-16 h-16 rounded-xl flex-shrink-0 object-cover" />
        <div class="flex flex-col justify-between">
          <h3 class="text-lg font-semibold">${item.name}${item.version ? ` — ${item.version}` : ""}</h3>
          <p class="text-gray-300 text-sm line-clamp-2">${item.description || ""}</p>
        </div>
      `;
      card.addEventListener("click", () => openModal(item));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(item);
        }
      });
      gamesList.appendChild(card);
    });
  }

  // Функция поиска по обоим спискам
  function searchItems(query) {
    if (!query) {
      if (currentCategory) {
        renderList(currentCategory === "games" ? gamesData : appsData);
        mainListTitle.textContent = currentCategory === "games" ? "🎮 Все игры" : "📱 Все приложения";
      } else {
        gamesList.innerHTML = "<p class='text-center text-gray-400'>Пожалуйста, выберите категорию или введите поиск</p>";
        mainListTitle.textContent = "";
      }
      return;
    }

    const q = query.toLowerCase();
    // Ищем в играх и приложениях
    const results = [];

    gamesData.forEach(item => {
      if (item.name.toLowerCase().includes(q)) results.push({...item, _type:"game"});
    });
    appsData.forEach(item => {
      if (item.name.toLowerCase().includes(q)) results.push({...item, _type:"app"});
    });

    if (results.length) {
      mainListTitle.textContent = `Результаты поиска: ${results.length} найдено`;
      renderSearchResults(results);
    } else {
      mainListTitle.textContent = `Результаты поиска: ничего не найдено`;
      gamesList.innerHTML = "<p class='text-center text-gray-400'>Совпадений нет.</p>";
    }
  }

  function renderSearchResults(results) {
    gamesList.innerHTML = "";
    results.forEach(item => {
      const card = document.createElement("div");
      card.className = "flex gap-4 p-3 rounded-lg bg-[rgba(110,28,255,0.3)] cursor-pointer hover:bg-purple-700 transition";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-pressed", "false");

      const labelEmoji = item._type === "game" ? "🎮" : "📱";

      card.innerHTML = `
        <img src="${item.icon}" alt="${item.name}" class="w-16 h-16 rounded-xl flex-shrink-0 object-cover" />
        <div class="flex flex-col justify-between">
          <h3 class="text-lg font-semibold">${labelEmoji} ${item.name}${item.version ? ` — ${item.version}` : ""}</h3>
          <p class="text-gray-300 text-sm line-clamp-2">${item.description || ""}</p>
        </div>
      `;

      card.addEventListener("click", () => openModal(item));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(item);
        }
      });

      gamesList.appendChild(card);
    });
  }

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    isSearching = !!query;
    if (isSearching) {
      // При поиске блокируем выбор категорий, чтобы не путать пользователя
      menuItems.forEach(btn => btn.disabled = true);
    } else {
      menuItems.forEach(btn => btn.disabled = false);
    }
    searchItems(query);
  });

  // Начальная загрузка
  loadData().then(() => {
    // Для начала можем показать все игры по умолчанию
    currentCategory = "games";
    mainListTitle.textContent = "🎮 Все игры";
    renderList(gamesData);
  });
});
