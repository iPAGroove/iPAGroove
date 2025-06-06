
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

  let gamesData = [];
  let appsData = [];
  let currentCatalog = "games";
  let downloadsData = {};

  async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Load error: " + url);
    return await response.json();
  }

  function renderList(data) {
    gamesList.innerHTML = "";
    data.forEach(item => {
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

    updateDownloadCounts();

    gamesList.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        modalTitle.textContent = btn.dataset.name;
        modalDesc.textContent = btn.dataset.desc;
        modalIcon.src = btn.dataset.icon;
        modalDownload.href = btn.dataset.download;
        gameModal.classList.add("show");

        const itemName = btn.dataset.name;
        incrementDownloadCount(itemName);
      });
    });
  }

  async function updateDownloadCounts() {
    const snapshotRef = ref(db, "downloads");
    onValue(snapshotRef, (snapshot) => {
      downloadsData = snapshot.val() || {};
      document.querySelectorAll(".downloads-count").forEach(el => {
        const title = el.dataset.title;
        const count = downloadsData[title] || 0;
        el.textContent = `⬇️ Downloads: ${count}`;
      });

      if (modalTitle.textContent && downloadsData[modalTitle.textContent]) {
        const count = downloadsData[modalTitle.textContent];
        modalDesc.innerHTML += `<br/><span class='text-purple-300 text-sm'>⬇️ Downloads: ${count}</span>`;
      }
    });
  }

  function incrementDownloadCount(title) {
    const countRef = ref(db, `downloads/${title}`);
    runTransaction(countRef, (current) => (current || 0) + 1);
  }

  document.getElementById("siteTitle").addEventListener("click", () => location.reload());

  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("open");
    overlay.classList.remove("hidden");
  });

  menuClose.addEventListener("click", () => {
    sideMenu.classList.remove("open");
    overlay.classList.add("hidden");
  });

  overlay.addEventListener("click", () => {
    sideMenu.classList.remove("open");
    overlay.classList.add("hidden");
  });

  document.querySelectorAll(".menuItem").forEach(btn => {
    btn.addEventListener("click", async () => {
      currentCatalog = btn.dataset.catalog;
      mainListTitle.textContent = currentCatalog === "games" ? "All Games" : "All Apps";
      searchInput.classList.remove("hidden");
      loader.style.display = "flex";

      try {
        const data = await loadJSON(currentCatalog + ".json");
        if (currentCatalog === "games") {
          gamesData = data;
        } else {
          appsData = data;
        }
        renderList(data);
      } catch (err) {
        gamesList.innerHTML = "<p class='text-red-500'>Error loading data</p>";
      }

      loader.style.display = "none";
      sideMenu.classList.remove("open");
      overlay.classList.add("hidden");
    });
  });

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    const filtered = (currentCatalog === "games" ? gamesData : appsData).filter(item =>
      item.name.toLowerCase().includes(value)
    );
    renderList(filtered);
  });

  document.getElementById("showMoreBtn").addEventListener("click", () => {
    renderList(currentCatalog === "games" ? gamesData : appsData);
  });

  window.closeModal = function () {
    gameModal.classList.remove("show");
  };
});



document.addEventListener("DOMContentLoaded", () => {
  function updateDownloadCount(appName) {
    const countRef = ref(db, 'downloads/' + appName);
    runTransaction(countRef, (currentValue) => {
      return (currentValue || 0) + 1;
    });
  }

  function loadDownloadCount(appName, element) {
    const countRef = ref(db, 'downloads/' + appName);
    onValue(countRef, (snapshot) => {
      const count = snapshot.val() || 0;
      element.textContent = `⬇️ Downloads: ${count}`;
    });
  }

  // Пример: вызов при клике на кнопку (внутри модалки)
  const modalDownload = document.getElementById("modalDownload");
  const modalDownloads = document.getElementById("modalDownloads");

  if (modalDownload && modalDownloads) {
    modalDownload.addEventListener("click", () => {
      const name = document.getElementById("modalTitle").textContent.trim();
      updateDownloadCount(name);
    });
  }

  // Пример: вызов отображения счётчика при открытии модалки (зависит от твоей логики)
  window.showDownloadsForModal = function(name) {
    if (modalDownloads) {
      loadDownloadCount(name, modalDownloads);
    }
  }
});
