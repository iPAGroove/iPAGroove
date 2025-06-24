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
  const modalDownload = document.getElementById("modalDownload"); // The actual download link container (<a>)
  const downloadButton = modalDownload.querySelector('button'); // The download button inside the link
  const modalIcon = document.getElementById("modalIcon");
  const loader = document.getElementById("loader");
  const searchInput = document.getElementById("searchInput");
  const certificateInfo = document.getElementById("certificateInfo");
  const catalogSection = document.getElementById("catalogSection");

  // New modal elements for displaying detailed info
  const modalSize = document.getElementById("modalSize");
  const modalMinIos = document.getElementById("modalMinIos");
  const modalAddedDate = document.getElementById("modalAddedDate");
  const modalVersion = document.getElementById("modalVersion");
  const modalDownloadCountModal = document.getElementById("modalDownloadCount"); // Download count in modal

  // VIP access elements
  const vipAccessButton = document.getElementById("vipAccessButton");
  const vipMessageModal = document.getElementById("vipMessageModal");

  let gamesData = [];
  let appsData = [];
  let filteredData = [];
  let currentCatalog = "games"; // Default catalog if user navigates

  let currentPage = 1;
  const itemsPerPage = 5;

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
          <h3 class="font-bold text-lg">${item.name}
            ${item.access_type === 'VIP' ? '<span class="vip-badge">VIP</span>' : ''}
          </h3>
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
          data-genre="${item.genre || ''}"
          data-access-type="${item.access_type || 'Free'}"
        >Open</button>
      `;
      gamesList.appendChild(card);
    });

    gamesList.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const itemAccessType = btn.dataset.accessType;

        modalTitle.textContent = btn.dataset.name;
        modalDesc.innerHTML = btn.dataset.desc.replace(/\n/g, '<br>'); // Replace \n with <br> for multiline description
        modalIcon.src = btn.dataset.icon;

        // Populate info grid fields
        modalVersion.textContent = btn.dataset.version;
        modalSize.textContent = btn.dataset.size;
        modalMinIos.textContent = btn.dataset.minIos;
        if (btn.dataset.lastModified) {
          modalAddedDate.textContent = timeAgo(btn.dataset.lastModified);
        } else {
          modalAddedDate.textContent = 'N/A';
        }

        // Update modal download count
        const currentDownloads = document.querySelector(`.downloads-count[data-title="${btn.dataset.name}"]`).textContent.split(': ')[1];
        modalDownloadCountModal.textContent = `⬇️ Downloads: ${currentDownloads}`;

        if (itemAccessType === 'VIP') {
          modalDownload.style.display = 'none'; // Hide the download link container
          vipAccessButton.style.display = 'block'; // Show the VIP access button
          // If VIP, attach an event listener to show the VIP message modal
          vipAccessButton.onclick = () => showVipMessageModal();
        } else {
          modalDownload.style.display = 'block'; // Show the download link container
          modalDownload.href = btn.dataset.download; // Set the download link for free items
          vipAccessButton.style.display = 'none'; // Hide the VIP access button
          // For free items, the download button works as usual
          downloadButton.onclick = () => incrementDownloadCount(btn.dataset.name);
        }

        gameModal.classList.add("show");
        // Only increment download count if it's a free item, or if it's VIP and somehow downloaded
        if (itemAccessType === 'Free') {
             // For free downloads, increment directly
             incrementDownloadCount(btn.dataset.name);
        } else {
            // For VIP, we only open the modal, so don't increment until actual download (not implemented here)
        }
      });
    });

    renderPagination(data.length);
    updateDownloadCounts();
  }

  // Function to show the VIP message modal
  function showVipMessageModal() {
      vipMessageModal.classList.remove('hidden');
      gameModal.classList.remove('show'); // Hide the game modal behind the VIP message
  }

  // Function to close the VIP message modal
  window.closeVipMessageModal = function() {
      vipMessageModal.classList.add('hidden');
  }

  async function updateDownloadCounts() {
    const snapshotRef = ref(db, "downloads");
    onValue(snapshotRef, (snapshot) => {
      const downloadsData = snapshot.val() || {};
      document.querySelectorAll(".downloads-count").forEach(el => {
        const title = el.dataset.title;
        el.textContent = `⬇️ Downloads: ${downloadsData[title] || 0}`;
      });
      // Update download count in the modal if it's open
      if (gameModal.classList.contains("show")) {
        const currentTitle = modalTitle.textContent;
        modalDownloadCountModal.textContent = `⬇️ Downloads: ${downloadsData[currentTitle] || 0}`;
      }
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

    certificateInfo.style.display = "none";
    catalogSection.style.display = "block";

    try {
      const data = await loadJSON(`${type}.json`);
      // Add dummy data for new fields if not present in JSON
      const processedData = data.map(item => ({
        ...item,
        fileSize: item.fileSize || `${(Math.random() * 500 + 50).toFixed(0)} MB`, // Example random size
        minIosVersion: item.minIosVersion || `iOS ${Math.floor(Math.random() * 5) + 10}.0`, // Example random iOS version
        lastModified: item.lastModified || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Example random last modified date
        access_type: item.access_type || 'Free' // Default to Free if not specified
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

  // Event listeners for navigation buttons
  document.getElementById("navGames").addEventListener("click", () => {
    loadCatalog("games");
    certificateInfo.style.display = "none";
    catalogSection.style.display = "block";
  });

  document.getElementById("navApps").addEventListener("click", () => {
    loadCatalog("apps");
    certificateInfo.style.display = "none";
    catalogSection.style.display = "block";
  });

  document.getElementById("navMore").addEventListener("click", () => {
    document.getElementById("moreModal").classList.remove("hidden");
  });

  // Restore initial view when site title is clicked
  document.getElementById("siteTitle").addEventListener("click", () => {
    certificateInfo.style.display = "block";
    catalogSection.style.display = "none";
    searchInput.classList.add("hidden"); // Hide search when viewing certificates
    searchInput.value = ""; // Clear search input
  });

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

  // Removed loadCatalog("games"); from here to prevent immediate display of catalog
  // This line was the cause of the VIP modal showing on load if the first item was VIP.
});

