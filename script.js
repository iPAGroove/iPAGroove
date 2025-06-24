// Manages adaptive height for mobile
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh * 100}px`);
}

window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);

setVh();

// Locks scrolling on load
document.body.classList.add('locked');

window.addEventListener("load", () => {
  document.getElementById("loader").style.display = "none";
  document.body.classList.remove('locked');
  // Ensure certificate info is visible on initial load
  document.getElementById("certificateInfo").style.display = "block";
  document.getElementById("catalogSection").style.display = "none";
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, onValue, runTransaction
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBizq_3JJXWgUa-aaW8MKj6AV0Jt_-XYcI",
  authDomain: "ipa-chat.firebaseapp.com",
  databaseURL: "https://ipa-chat-default-rtdb.firebaseio.com",
  projectId: "ipa-chat",
  storageBucket: "ipa-chat.firebasestorage.app",
  messagingSenderId: "534978415110",
  appId: "1:534978415110:web:a40838ef597b6d0ff09187",
  measurementId: "G-H2T6L8VZPG"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const mainListTitle = document.getElementById("mainListTitle");
  const gamesList = document.getElementById("gamesList");
  const gameModal = document.getElementById("gameModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDownload = document.getElementById("modalDownload");
  const downloadButton = modalDownload.querySelector('button');
  const modalIcon = document.getElementById("modalIcon");
  const loader = document.getElementById("loader");
  const searchInput = document.getElementById("searchInput");
  const certificateInfo = document.getElementById("certificateInfo");
  const catalogSection = document.getElementById("catalogSection");

  const modalSize = document.getElementById("modalSize");
  const modalMinIos = document.getElementById("modalMinIos");
  const modalAddedDate = document.getElementById("modalAddedDate");
  const modalVersion = document.getElementById("modalVersion");
  const modalDownloadCountModal = document.getElementById("modalDownloadCount");

  const vipAccessButton = document.getElementById("vipAccessButton");
  const vipMessageModal = document.getElementById("vipMessageModal");

  const totalUsersCountElement = document.getElementById("totalUsersCount");

  // --- ССЫЛКИ НА КНОПКИ (ТОЛЬКО VIP) ---
  const vipButton = document.getElementById("vipButton");
  // --- КОНЕЦ ССЫЛОК ---

  if (vipMessageModal) {
    vipMessageModal.classList.add('hidden');
  }

  let gamesData = [];
  let appsData = [];
  let filteredData = [];
  let currentCatalog = "games";
  let currentFilter = "all"; // 'all', 'vip'

  let currentPage = 1;
  const itemsPerPage = 5;

  let downloadsFromFirebase = {};

  async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Load error: " + url);
    return await response.json();
  }

  function paginate(data, page) {
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById("showMoreContainer");
    container.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "mx-1 px-3 py-1 rounded bg-purple-700 hover:bg-purple-900 text-white";
      if (i === currentPage) btn.classList.add("bg-purple-900");
      btn.addEventListener("click", () => {
        currentPage = i;
        renderList(filteredData);
      });
      container.appendChild(btn);
    }
  }

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }

  function renderList(data) {
    filteredData = data;
    const pageItems = paginate(data, currentPage);
    gamesList.innerHTML = "";
    pageItems.forEach(item => {
      const card = document.createElement("div");
      card.className = "bg-[rgba(255,255,255,0.05)] rounded-lg p-4 flex gap-4 items-center game-card";
      card.innerHTML = `
        <div class="icon-wrapper">
          <img src="${item.icon}" alt="${item.name}" class="w-16 h-16 rounded shadow" />
          ${item.access_type === 'VIP' ? '<span class="vip-badge">VIP</span>' : ''}
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-lg">${item.name}</h3>
          <p class="text-sm text-gray-300">${item.version || ""}</p>
          <p class="text-sm text-gray-400 downloads-count" data-title="${item.name}">⬇️ Downloads: ${downloadsFromFirebase[item.name] || 0}</p>
        </div>
        <button class="bg-purple-600 hover:bg-purple-800 px-3 py-1 rounded"
          data-name="${item.name}"
          data-download="${item.download}"
          data-desc="${item.description}"
          data-icon="${item.icon}"
          data-version="${item.version || 'N/A'}"
          data-size="${item.fileSize || 'N/A'}"
          data-min-ios="${item.minIosVersion || 'N/A'}"
          data-last-modified="${item.lastModified || ''}"
          data-genre="${item.genre || ''}"
          data-access-type="${item.access_type || 'Free'}"
        >Open</button>
      `;
      gamesList.appendChild(card);
    });

    renderPagination(data.length);
  }

  function showVipMessageModal() {
      console.log('Showing VIP Message Modal');
      vipMessageModal.classList.remove('hidden');
      gameModal.classList.remove('show');
  }

  window.closeVipMessageModal = function() {
      console.log('Closing VIP Message Modal');
      vipMessageModal.classList.add('hidden');
  }

  function updateDownloadCounts() {
    const snapshotRef = ref(db, "downloads");
    onValue(snapshotRef, (snapshot) => {
      downloadsFromFirebase = snapshot.val() || {};
      applyFilter(); // Теперь applyFilter будет обновлять список с актуальными данными
    });
  }

  function incrementDownloadCount(title) {
    const countRef = ref(db, `downloads/${title}`);
    runTransaction(countRef, (current) => (current || 0) + 1);
  }

  const totalUsersRef = ref(db, "users/totalCount");
  onValue(totalUsersRef, (snapshot) => {
      const totalUsers = snapshot.val();
      if (totalUsersCountElement) {
          totalUsersCountElement.textContent = totalUsers !== null ? totalUsers.toLocaleString() : "0";
      }
  });

  const lastVisitTimestamp = localStorage.getItem('lastVisitTimestamp');
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (!lastVisitTimestamp || (now - parseInt(lastVisitTimestamp) > twentyFourHours)) {
      runTransaction(totalUsersRef, (currentCount) => {
          return (currentCount || 0) + 1;
      }).then(() => {
          console.log("Total users count incremented for a new/returning unique visitor.");
          localStorage.setItem('lastVisitTimestamp', now.toString());
      }).catch((error) => {
          console.error("Failed to increment total users count:", error);
      });
  } else {
      console.log("User already counted recently.");
  }

  // --- ИЗМЕНЕННАЯ ФУНКЦИЯ applyFilter (без TOP) ---
  function applyFilter() {
    let dataToFilter = currentCatalog === "games" ? gamesData : appsData;
    let resultData = [];

    searchInput.value = ""; // Очищаем строку поиска при смене фильтра

    if (currentFilter === "vip") {
      resultData = dataToFilter.filter(item => item.access_type === 'VIP');
      mainListTitle.textContent = `VIP ${currentCatalog.charAt(0).toUpperCase() + currentCatalog.slice(1)}`;
    } else { // 'all'
      resultData = dataToFilter;
      mainListTitle.textContent = `All ${currentCatalog.charAt(0).toUpperCase() + currentCatalog.slice(1)}`;
    }

    currentPage = 1;
    renderList(resultData);
  }
  // --- КОНЕЦ ИЗМЕНЕННОЙ ФУНКЦИИ ---


  async function loadCatalog(type) {
    currentCatalog = type;
    currentFilter = "all"; // Сбрасываем фильтр на "все" при смене каталога
    searchInput.classList.remove("hidden");
    loader.style.display = "flex";

    certificateInfo.style.display = "none";
    catalogSection.style.display = "block";

    activateButton(currentCatalog === "games" ? document.getElementById("navGames") : document.getElementById("navApps"));
    activateFilterButton(null); // Деактивируем VIP кнопку фильтра

    try {
      const data = await loadJSON(`${type}.json`);
      const processedData = data.map(item => ({
        ...item,
        fileSize: item.fileSize || `${(Math.random() * 500 + 50).toFixed(0)} MB`,
        minIosVersion: item.minIosVersion || `iOS ${Math.floor(Math.random() * 5) + 10}.0`,
        lastModified: item.lastModified || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        access_type: item.access_type || 'Free'
      }));
      if (type === "games") gamesData = processedData;
      else appsData = processedData;

      applyFilter(); // Вызываем applyFilter

    } catch(error) {
      console.error("Error loading catalog:", error);
      gamesList.innerHTML = "<p class='text-red-500'>Error loading data</p>";
    }

    loader.style.display = "none";
  }

  function activateButton(button) {
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(btn => {
      btn.classList.remove('text-purple-300', 'font-bold');
      btn.classList.add('text-white');
    });
    if (button) {
      button.classList.add('text-purple-300', 'font-bold');
      button.classList.remove('text-white');
    }
  }

  function activateFilterButton(button) {
    const filterButtons = [vipButton]; // Только vipButton
    filterButtons.forEach(btn => {
      btn.classList.remove('bg-purple-900', 'ring-2', 'ring-purple-400'); // Убираем активные стили
      // Сброс VIP-кнопки к базовым градиентам
      if (btn.id === 'vipButton') {
        btn.classList.remove('from-amber-600', 'to-yellow-600');
        btn.classList.add('from-yellow-500', 'to-amber-500');
      }
    });

    if (button) { // Если кнопка передана, делаем её активной
      button.classList.add('bg-purple-900', 'ring-2', 'ring-purple-400');
      // Применяем активные градиенты для VIP-кнопки
      if (button.id === 'vipButton') {
        button.classList.remove('from-yellow-500', 'to-amber-500');
        button.classList.add('from-amber-600', 'to-yellow-600');
      }
    }
  }

  document.getElementById("navGames").addEventListener("click", () => {
    loadCatalog("games");
    certificateInfo.style.display = "none";
    catalogSection.style.display = "block";
    activateButton(document.getElementById("navGames"));
  });

  document.getElementById("navApps").addEventListener("click", () => {
    loadCatalog("apps");
    certificateInfo.style.display = "none";
    catalogSection.style.display = "block";
    activateButton(document.getElementById("navApps"));
  });

  document.getElementById("navMore").addEventListener("click", () => {
    document.getElementById("moreModal").classList.remove("hidden");
    activateButton(document.getElementById("navMore"));
  });

  // --- СЛУШАТЕЛЬ ТОЛЬКО ДЛЯ КНОПКИ VIP ---
  vipButton.addEventListener("click", () => {
    currentFilter = "vip";
    applyFilter();
    activateFilterButton(vipButton);
  });
  // --- КОНЕЦ СЛУШАТЕЛЯ ---

  document.getElementById("siteTitle").addEventListener("click", () => {
    certificateInfo.style.display = "block";
    catalogSection.style.display = "none";
    searchInput.classList.add("hidden");
    searchInput.value = "";
    currentFilter = "all";
    activateButton(null);
    activateFilterButton(null);
  });


  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    const sourceData = currentCatalog === "games" ? gamesData : appsData;

    const filtered = sourceData.filter(item => item.name.toLowerCase().includes(value));
    currentPage = 1;
    renderList(filtered);
    activateFilterButton(null);
    mainListTitle.textContent = `Search Results for "${value}"`;
  });


  window.closeModal = function () {
    gameModal.classList.remove("show");
  };

  updateDownloadCounts();

  document.getElementById("navGames").click();
  certificateInfo.style.display = "block";
  catalogSection.style.display = "none";
  searchInput.classList.add("hidden");
  activateButton(null);
  activateFilterButton(null);

});
