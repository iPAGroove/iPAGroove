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
  const certificateInfo = document.getElementById("certificateInfo");
  const catalogSection = document.getElementById("catalogSection");

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
        <button class="bg-purple-600 hover:bg-purple-800 px-3 py-1 rounded" data-name="${item.name}" data-download="${item.download}" data-desc="${item.description}" data-icon="${item.icon}">Open</button>
      `;
      gamesList.appendChild(card);
    });

    gamesList.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        modalTitle.textContent = btn.dataset.name;
        modalDesc.textContent = btn.dataset.desc;
        modalIcon.src = btn.dataset.icon;
        modalDownload.href = btn.dataset.download;
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
      if (type === "games") gamesData = data;
      else appsData = data;
      currentPage = 1;
      renderList(data);
    } catch {
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
});
