// Управление адаптивной высотой для мобильных
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh * 100}px`);
}

window.addEventListener('resize', setVh);
window.addEventListener('load', setVh);

setVh();

// Блокируем прокрутку при загрузке
document.body.classList.add('locked');

window.addEventListener("load", () => {
  document.getElementById("loader").style.display = "none";
  document.body.classList.remove('locked');
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
  const menuToggle = document.getElementById("menuToggle"); // Not used in provided HTML, keeping for consistency
  const menuClose = document.getElementById("menuClose");   // Not used in provided HTML, keeping for consistency
  const sideMenu = document.getElementById("sideMenu");     // Not used in provided HTML, keeping for consistency
  const overlay = document.getElementById("overlay");       // Not used in provided HTML, keeping for consistency
  const mainListTitle = document.getElementById("mainListTitle");
  const gamesList = document.getElementById("gamesList");
  const gameModal = document.getElementById("gameModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDownload = document.getElementById("modalDownload");
  const modalIcon = document.getElementById("modalIcon");
  const loader = document.getElementById("loader");
  const searchInput = document.getElementById("searchInput");
  const certificateInfo = document.getElementById("certificateInfo");
  const catalogSection = document.getElementById("catalogSection");

  // New modal elements
  const modalSize = document.getElementById("modalSize");
  const modalMinIos = document.getElementById("modalMinIos");
  const modalAddedDate = document.getElementById("modalAddedDate");
  const modalVersion = document.getElementById("modalVersion");


  let gamesData = [];
  let appsData = [];
  let filteredData = [];
  let currentCatalog = "games";
  let currentPage = 1;
  const itemsPerPage = 5;

  // По умолчанию показываем сертификаты, скрываем каталог
  if (catalogSection) catalogSection.style.display = "none";
  if (certificateInfo) certificateInfo.style.display = "block";

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

  // Function to calculate time ago
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
      card.className = "bg-[rgba(255,255,255,0.05)] rounded-lg p-4 flex gap-4 items-center";
      card.innerHTML = `
        <img src="${item.icon}" alt="${item.name}" class="w-16 h-16 rounded shadow" />
        <div class="flex-1">
          <h3 class="font-bold text-lg">${item.name}</h3>
          <p class="text-sm text-gray-300">${item.version || ""}</p>
          <p class="text-sm text-gray-400 downloads-count" data-title="${item.name}">⬇️ Downloads: ...</p>
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
        >Open</button>
      `;
      gamesList.appendChild(card);
    });

    gamesList.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        modalTitle.textContent = btn.dataset.name;
        modalDesc.textContent = btn.dataset.desc;
        modalIcon.src = btn.dataset.icon;
        modalDownload.href = btn.dataset.download;

        // Populate new fields
        modalVersion.textContent = `Version: ${btn.dataset.version}`;
        modalSize.textContent = `Size: ${btn.dataset.size}`;
        modalMinIos.textContent = `Min iOS: ${btn.dataset.minIos}`;
        if (btn.dataset.lastModified) {
          modalAddedDate.textContent = `Added: ${timeAgo(btn.dataset.lastModified)}`;
        } else {
          modalAddedDate.textContent = 'Added: N/A';
        }

        gameModal.classList.add("show");
        incrementDownloadCount(btn.dataset.name);
      });
    });

    renderPagination(data.length);
    updateDownloadCounts();
  }

  async function updateDownloadCounts() {
    const snapshotRef = ref(db, "downloads");
    onValue(snapshotRef, (snapshot) => {
      const downloadsData = snapshot.val() || {};
      document.querySelectorAll(".downloads-count").forEach(el => {
        const title = el.dataset.title;
        el.textContent = `⬇️ Downloads: ${downloadsData[title] || 0}`;
      });
    });
  }

  function incrementDownloadCount(title) {
    const countRef = ref(db, `downloads/${title}`);
    runTransaction(countRef, (current) => (current || 0) + 1);
  }

  async function loadCatalog(type) {
    currentCatalog = type;
    mainListTitle.textContent = type === "games" ? "All Games" : "All Apps";
    searchInput.classList.remove("hidden");
    loader.style.display = "flex";

    if (certificateInfo) certificateInfo.style.display = "none";
    if (catalogSection) catalogSection.style.display = "block";

    try {
      const data = await loadJSON(`${type}.json`);
      // Add dummy data for new fields if not present in JSON
      const processedData = data.map(item => ({
        ...item,
        fileSize: item.fileSize || `${(Math.random() * 500 + 50).toFixed(0)} MB`, // Example random size
        minIosVersion: item.minIosVersion || `iOS ${Math.floor(Math.random() * 5) + 10}.0`, // Example random iOS version
        lastModified: item.lastModified || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() // Example random last modified date
      }));
      if (type === "games") gamesData = processedData;
      else appsData = processedData;
      currentPage = 1;
      renderList(processedData);
    } catch(error) {
      console.error("Error loading catalog:", error);
      gamesList.innerHTML = "<p class='text-red-500'>Error loading data</p>";
    }

    loader.style.display = "none";
  }

  document.getElementById("navGames").addEventListener("click", () => loadCatalog("games"));
  document.getElementById("navApps").addEventListener("click", () => loadCatalog("apps"));
  document.getElementById("navMore").addEventListener("click", () => {
    document.getElementById("moreModal").classList.remove("hidden");
  });

  document.getElementById("siteTitle").addEventListener("click", () => location.reload());

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    const sourceData = currentCatalog === "games" ? gamesData : appsData;
    const filtered = sourceData.filter(item => item.name.toLowerCase().includes(value));
    currentPage = 1;
    renderList(filtered);
  });

  window.closeModal = function () {
    gameModal.classList.remove("show");
  };

  // Initial load for games when the page loads
  loadCatalog("games");
});
