document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");

  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("open");
    overlay.classList.add("active");
    overlay.classList.remove("hidden");
  });

  menuClose.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  function closeMenu() {
    sideMenu.classList.remove("open");
    overlay.classList.remove("active");
    overlay.classList.add("hidden");
  }

  const mainListTitle = document.getElementById("mainListTitle");
  const gamesList = document.getElementById("gamesList");
  const showMoreBtn = document.getElementById("showMoreBtn");

  // Примерные данные
  const gamesData = [
    { name: "Clash Royale", icon: "https://via.placeholder.com/100", desc: "Мобильная стратегия." },
    { name: "Subway Surfers", icon: "https://via.placeholder.com/100", desc: "Аркадный раннер." }
  ];
  const appsData = [
    { name: "Telegram", icon: "https://via.placeholder.com/100", desc: "Мессенджер." },
    { name: "Notion", icon: "https://via.placeholder.com/100", desc: "Органайзер и заметки." }
  ];

  function renderList(items) {
    mainListTitle.textContent = `Каталог — всего: ${items.length}`;
    gamesList.innerHTML = "";

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

      const p = document.createElement("p");
      p.className = "text-sm text-gray-300";
      p.textContent = item.desc;
      textWrapper.appendChild(p);

      container.appendChild(textWrapper);
      gamesList.appendChild(container);
    });
  }

  // Обработка кликов по пунктам меню
  const menuItems = document.querySelectorAll(".menuItem");
  menuItems.forEach(button => {
    button.addEventListener("click", () => {
      const catalog = button.dataset.catalog;
      closeMenu();

      if (catalog === "games") {
        renderList(gamesData);
      } else if (catalog === "apps") {
        renderList(appsData);
      }
    });
  });
});
