document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const catalogSection = document.getElementById("catalogSection");
  const mainListTitle = document.getElementById("mainListTitle");
  const gamesList = document.getElementById("gamesList");

  const menuItems = document.querySelectorAll(".menuItem");

  const demoGames = [
    {
      name: "Clash Royale",
      icon: "https://upload.wikimedia.org/wikipedia/en/6/6f/Clash_Royale_app_icon.png"
    },
    {
      name: "Subway Surfers",
      icon: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/Subway_Surfers_app_icon.png/220px-Subway_Surfers_app_icon.png"
    },
    {
      name: "Among Us",
      icon: "https://upload.wikimedia.org/wikipedia/en/f/f2/Among_Us_cover_art.png"
    }
  ];

  const demoApps = [
    {
      name: "Notion",
      icon: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg"
    },
    {
      name: "Telegram",
      icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"
    },
    {
      name: "Spotify",
      icon: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
    }
  ];

  function closeMenu() {
    sideMenu.classList.remove("open");
    overlay.classList.remove("active");
    overlay.classList.add("hidden");
  }

  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("open");
    overlay.classList.add("active");
    overlay.classList.remove("hidden");
  });

  menuClose.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);

  // Показ списка
  function renderList(title, items) {
    mainListTitle.textContent = title;
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

      container.appendChild(textWrapper);
      gamesList.appendChild(container);
    });

    catalogSection.scrollIntoView({ behavior: "smooth" });
  }

  menuItems.forEach(button => {
    button.addEventListener("click", () => {
      const catalogType = button.getAttribute("data-catalog");
      closeMenu();

      if (catalogType === "games") {
        renderList("🎮 Все игры", demoGames);
      } else if (catalogType === "apps") {
        renderList("📱 Все приложения", demoApps);
      }
    });
  });

});
