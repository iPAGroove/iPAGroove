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
  let currentItems = [];  // текущий массив для отображения (игры или приложения)

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

  // Отрисовка списка элементов
  function renderList(items) {
    gamesList.innerHTML = "";
    if (items.length === 0) {
      gamesList.innerHTML = '<p class="text-center text-gray-400">Ничего не найдено</p>';
      return;
    }
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "bg-[rgba(255,255,255,0.05)] p-4 rounded shadow hover:bg-purple-800 cursor-pointer transition";

      const lastModifiedText = formatDate(item.lastModified);

      card.innerHTML = `
        <div class="flex items-center gap-4">
          <img src="${item.icon}" alt="${item.name}" class="w-12 h-12 rounded" />
          <div>
            <h3 class="text-lg font-bold">${item.name}</h3>
            <p class="text-sm text-gray-300">${lastModifiedText}</p>
          </div>
        </div>
      `;

      card.addEventListener("click", () => openModal(item));
      gamesList.appendChild(card);
    });
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `Обновлено: ${d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}`;
  }

  // Фильтрация текущего списка по поисковому запросу
  function filterList(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      renderList(currentItems);
      return;
    }
    const filtered = currentItems.filter(item => item.name.toLowerCase().includes(q));
    renderList(filtered);
  }

  // При выборе меню — загрузка нужных данных и показ поиска для games и apps
  menuItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const catalog = btn.dataset.catalog;
      closeMenu();
      searchInput.value = "";

      if (catalog === "games") {
        mainListTitle.textContent = "Все игры";
        currentItems = gamesData;
        searchInput.classList.remove("hidden");
      } else if (catalog === "apps") {
        mainListTitle.textContent = "Все приложения";
        currentItems = appsData;
        searchInput.classList.remove("hidden");
      } else {
        // Если другие разделы появятся, можно добавить сюда логику
        mainListTitle.textContent = "";
        currentItems = [];
        searchInput.classList.add("hidden");
      }

      renderList(currentItems);
    });
  });

  // Поиск по названию
  searchInput.addEventListener("input", (e) => {
    filterList(e.target.value);
  });

  // Загрузка данных при старте
  loadData();
});
