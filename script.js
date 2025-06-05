document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const catalogSection = document.getElementById("catalogSection");
  const mainListTitle = document.getElementById("mainListTitle");
  const gamesList = document.getElementById("gamesList");
  const gameModal = document.getElementById("gameModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDownload = document.getElementById("modalDownload");
  const modalIcon = document.getElementById("modalIcon");

  const menuItems = document.querySelectorAll(".menuItem");

  // Данные
  let gamesData = [];
  let appsData = [];

  // Загрузка JSON
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

  // Загрузка данных из файлов
  async function loadData() {
    gamesData = await loadJSON("games.json");
    appsData = await loadJSON("apps.json");
  }

  // Закрыть меню
  function closeMenu() {
    sideMenu.classList.remove("open");
    overlay.classList.remove("active");
    overlay.classList.add("hidden");
  }

  // Открыть модальное окно
  function openModal(item) {
    modalTitle.textContent = item.name + (item.version ? ` — версия ${item.version}` : "");
    modalDesc.textContent = item.description || "";
    modalIcon.src = item.icon || "";
    modalIcon.alt = item.name || "";
    if (item.download && item.download !== "#") {
      modalDownload.href = item.download;
      modalDownload.style.display = "block";
    } else {
      modalDownload.style.display = "none";
    }
    gameModal.classList.add("show");
    overlay.classList.add("active");
    overlay.classList.remove("hidden");
  }

  // Закрыть модальное окно
  window.closeModal = function() {
    gameModal.classList.remove("show");
    overlay.classList.remove("active");
    overlay.classList.add("hidden");
  };

  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("open");
    overlay.classList.add("active");
    overlay.classList.remove("hidden");
  });

  menuClose.addEventListener("click", closeMenu);
  overlay.addEventListener("click", () => {
    closeMenu();
    closeModal();
  });

  // Рендер списка
  function renderList(title, items) {
    mainListTitle.textContent = title;
    gamesList.innerHTML = "";

    if (items.length === 0) {
      gamesList.innerHTML = "<p>Список пуст.</p>";
      return;
    }

    items.forEach(item => {
      const container = document.createElement("div");
      container.className = "flex items-center gap-4 bg-purple-900 bg-opacity-30 p-3 rounded cursor-pointer hover:bg-purple-700";

      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = item.name;
      img.className = "w-12 h-12 rounded-xl flex-shrink-0";
      container.appendChild(img);

      const textWrapper = document.createElement("div");
      textWrapper.className = "flex-grow";

      const h3 = document.createElement("h3");
      h3.className = "font-semibold text-lg";
      h3.textContent = item.name;
      textWrapper.appendChild(h3);

      if (item.description) {
        const desc = document.createElement("p");
        desc.className = "text-sm text-gray-300";
        desc.textContent = item.description;
        textWrapper.appendChild(desc);
      }

      container.appendChild(textWrapper);

      // Удаляем кнопку скачивания из списка, чтобы была только в модальном окне
      // container.appendChild(downloadLink); - не добавляем

      // При клике по элементу открываем модальное окно с деталями
      container.addEventListener("click", () => openModal(item));

      gamesList.appendChild(container);
    });

    catalogSection.scrollIntoView({ behavior: "smooth" });
  }

  // Обработчик клика по меню
  menuItems.forEach(button => {
    button.addEventListener("click", async () => {
      const catalogType = button.getAttribute("data-catalog");
      closeMenu();

      if (gamesData.length === 0 || appsData.length === 0) {
        document.getElementById("loader").style.display = "flex";
        await loadData();
        document.getElementById("loader").style.display = "none";
      }

      if (catalogType === "games") {
        renderList("🎮 Все игры", gamesData);
      } else if (catalogType === "apps") {
        renderList("📱 Все приложения", appsData);
      }
    });
  });
});
