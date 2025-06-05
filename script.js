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

  // Пример: отобразить каталог по умолчанию
  const catalogSection = document.getElementById("catalogSection");
  catalogSection.classList.remove("hidden");

  // Если ранее была реализована логика загрузки данных и пагинации, оставляем её, 
  // но удаляем обработчики фильтров и событий ввода поиска.
  
  // Далее должна быть ваша логика отображения данных, например:
  const mainListTitle = document.getElementById("mainListTitle");
  const gamesList = document.getElementById("gamesList");
  const showMoreBtn = document.getElementById("showMoreBtn");

  // Пример функции рендера (данные должны быть загружены отдельно)
  function renderList(items, displayed, batchSize) {
    mainListTitle.textContent = `Каталог — всего: ${items.length}`;
    gamesList.innerHTML = "";

    const toShow = items.slice(0, displayed);
    toShow.forEach(item => {
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
      p.className = "text-sm text-purple-200";
      p.textContent = `${item.genre} | ${item.size || '–'}`;
      textWrapper.appendChild(p);
      
      container.appendChild(textWrapper);
      
      container.addEventListener("click", () => openModal(item));
      gamesList.appendChild(container);
    });

    // Отображаем кнопку "Показать ещё" если есть ещё элементы
    if (displayed < items.length) {
      showMoreBtn.style.display = "inline-block";
    } else {
      showMoreBtn.style.display = "none";
    }
  }

  // Остальная логика загрузки и работы с данными,
  // такая как fetch, пагинация и открытие модального окна, остается без изменений.
});

function closeModal() {
  document.getElementById("gameModal").classList.remove("show");
}

function openModal(item) {
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalIcon = document.getElementById("modalIcon");
  const modalScreenshots = document.getElementById("modalScreenshots");
  const modalDownload = document.getElementById("modalDownload");
  const gameModal = document.getElementById("gameModal");

  modalTitle.textContent = item.name;
  modalDesc.textContent = item.description || "Нет описания";
  modalIcon.src = item.icon;
  modalIcon.alt = item.name;

  modalScreenshots.innerHTML = "";
  if (Array.isArray(item.screenshots) && item.screenshots.length > 0) {
    item.screenshots.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${item.name} screenshot`;
      img.className = "w-full rounded mb-2";
      modalScreenshots.appendChild(img);
    });
  }

  modalDownload.href = item.download || "#";
  modalDownload.textContent = "Скачать";

  gameModal.classList.add("show");
}
