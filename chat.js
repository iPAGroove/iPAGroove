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

// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, onValue, runTransaction
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Your Firebase Configuration (Убедитесь, что это ваша актуальная конфигурация)
const firebaseConfig = {
  apiKey: "AIzaSyBizq_3JJXWgUa-aaW8MKj6AV0Jt_-XYcI",
  authDomain: "ipa-chat.firebaseapp.com",
  databaseURL: "https://ipa-chat-default-rtdb.firebaseio.com",
  projectId: "ipa-chat",
  storageBucket: "ipa-chat.firebasestorage.app",
  messagingSenderId: "534978415110",
  appId: "1:534978415110:web:86624e0b04c81f8f300f2e" // Убедитесь, что это ваш реальный appId
};

// Инициализируем Firebase App
const app = initializeApp(firebaseConfig);
// Получаем объект базы данных и экспортируем его
export const db = getDatabase(app); // <--- ИЗМЕНЕНИЕ ЗДЕСЬ: добавлен 'export'

// --- Весь остальной код из вашего script (1).js идет ниже ---

// Variables and elements
const navGames = document.getElementById("navGames");
const navApps = document.getElementById("navApps");
const navChat = document.getElementById("navChat"); // Assuming navChat exists and is handled by chat.js
const navMore = document.getElementById("navMore");
const catalogSection = document.getElementById("catalogSection");
const gamesList = document.getElementById("gamesList");
const appsList = document.getElementById("appsList");
const searchInput = document.getElementById("searchInput");
const certificateInfo = document.getElementById("certificateInfo");
const gameModal = document.getElementById("gameModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalIcon = document.getElementById("modalIcon");
const modalDownload = document.getElementById("modalDownload");
const modalDownloadCountModal = document.getElementById("modalDownloadCount");
const downloadButton = document.getElementById("downloadButton"); // Main download button in modal
const modalSize = document.getElementById("modalSize");
const modalMinIos = document.getElementById("modalMinIos");
const modalAddedDate = document.getElementById("modalAddedDate");
const modalVersion = document.getElementById("modalVersion");
const vipAccessButton = document.getElementById("vipAccessButton");


let gamesData = [];
let appsData = [];
let downloadsFromFirebase = {}; // Store download counts from Firebase

// Function to format time ago
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

// Function to render items (games or apps)
function renderItems(items, container, type) {
  container.innerHTML = "";
  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-white text-center w-full">No ${type} found.</p>`;
    return;
  }
  items.forEach((item) => {
    const itemCard = document.createElement("div");
    itemCard.className =
      "bg-purple-900/30 backdrop-blur-sm rounded-lg p-3 flex flex-col items-center text-center shadow-lg transition-transform transform hover:scale-105 cursor-pointer border border-purple-700/50";
    itemCard.innerHTML = `
            <img src="${item.icon}" alt="${
      item.name
    } icon" class="w-20 h-20 md:w-24 md:h-24 rounded-lg mb-2 shadow-md">
            <h3 class="font-semibold text-white text-base md:text-lg mb-1">${
              item.name
            }</h3>
            <p class="text-gray-300 text-xs md:text-sm mb-2">${item.version}</p>
            <p class="text-gray-400 text-xs">${item.fileSize}</p>
            <div class="text-xs text-gray-500 mt-1">${timeAgo(
              item.lastModified
            )}</div>
        `;
    itemCard.dataset.name = item.name;
    itemCard.dataset.desc = item.description;
    itemCard.dataset.icon = item.icon;
    itemCard.dataset.version = item.version;
    itemCard.dataset.download = item.download;
    itemCard.dataset.size = item.fileSize;
    itemCard.dataset.minIos = item.minIosVersion;
    itemCard.dataset.lastModified = item.lastModified;
    itemCard.dataset.genre = item.genre;
    itemCard.dataset.accessType = item.access_type || 'Free'; // Default to Free if not specified


    container.appendChild(itemCard);
  });
}

// Function to filter items based on search input
function filterItems(query, items, container, type) {
  const lowerCaseQuery = query.toLowerCase();
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerCaseQuery) ||
      item.description.toLowerCase().includes(lowerCaseQuery) ||
      item.genre.toLowerCase().includes(lowerCaseQuery)
  );
  renderItems(filtered, container, type);
}

// Function to update download counts
function updateDownloadCounts() {
  const downloadsRef = ref(db, "downloads");
  onValue(downloadsRef, (snapshot) => {
    downloadsFromFirebase = snapshot.val() || {};
  });
}

// Function to increment download count
function incrementDownloadCount(itemName) {
  const downloadRef = ref(db, `downloads/${itemName}`);
  runTransaction(downloadRef, (currentValue) => {
    return (currentValue || 0) + 1;
  });
}

// Function to activate navigation button
function activateButton(activeButton) {
  [navGames, navApps, navChat, navMore].forEach((button) => {
    button.classList.remove("text-primary", "border-b-2", "border-primary");
  });
  if (activeButton) {
    activeButton.classList.add("text-primary", "border-b-2", "border-primary");
  }
}

// Navigation event listeners
navGames.addEventListener("click", () => {
  activateButton(navGames);
  certificateInfo.style.display = "none";
  catalogSection.style.display = "block";
  gamesList.style.display = "grid";
  appsList.style.display = "none";
  searchInput.classList.remove("hidden");
  renderItems(gamesData, gamesList, "games");
  searchInput.value = "";
  searchInput.focus();
});

navApps.addEventListener("click", () => {
  activateButton(navApps);
  certificateInfo.style.display = "none";
  catalogSection.style.display = "block";
  appsList.style.display = "grid";
  gamesList.style.display = "none";
  searchInput.classList.remove("hidden");
  renderItems(appsData, appsList, "apps");
  searchInput.value = "";
  searchInput.focus();
});

navMore.addEventListener("click", () => {
  activateButton(navMore);
  certificateInfo.style.display = "block";
  catalogSection.style.display = "none";
  searchInput.classList.add("hidden");
});


// Search input event listener
searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  if (gamesList.style.display === "grid") {
    filterItems(query, gamesData, gamesList, "games");
  } else {
    filterItems(query, appsData, appsList, "apps");
  }
});

// Fetch data from Firebase
document.addEventListener("DOMContentLoaded", () => {
  const gamesRef = ref(db, "games");
  onValue(gamesRef, (snapshot) => {
    gamesData = Object.values(snapshot.val() || {});
    if (gamesList.style.display === "grid") {
      renderItems(gamesData, gamesList, "games");
    }
  });

  const appsRef = ref(db, "apps");
  onValue(appsRef, (snapshot) => {
    appsData = Object.values(snapshot.val() || {});
    if (appsList.style.display === "grid") {
      renderItems(appsData, appsList, "apps");
    }
  });

  // Modal functionality
  closeModal.addEventListener("click", () => {
    gameModal.classList.remove("show");
  });

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === gameModal) {
      gameModal.classList.remove("show");
    }
  });

  catalogSection.addEventListener("click", (e) => {
    const button = e.target.closest(
      ".bg-purple-900\\/30.backdrop-blur-sm.rounded-lg"
    );
    if (button) {
      const name = button.dataset.name;
      const desc = button.dataset.desc;
      const icon = button.dataset.icon;
      const download = button.dataset.download;
      const version = button.dataset.version;
      const size = button.dataset.size;
      const minIos = button.dataset.minIos;
      const lastModified = button.dataset.lastModified;
      const genre = button.dataset.genre;
      const accessType = button.dataset.accessType;

      modalTitle.textContent = name;
      modalDesc.textContent = desc;
      modalIcon.src = icon;
      modalDownload.href = download;

      modalSize.textContent = size;
      modalMinIos.textContent = minIos;
      modalAddedDate.textContent = timeAgo(lastModified); // Теперь здесь будет использоваться дата из JSON
      modalVersion.textContent = version;
      document.getElementById("modalGenre").textContent = genre;

      // Conditional display for VIP access
      if (accessType === 'VIP') {
        modalDownload.style.display = 'none'; // Hide direct download link
        downloadButton.textContent = '🔒 VIP Access'; // Change button text
        if (vipAccessButton) {
            vipAccessButton.style.display = 'block'; // Show VIP button
        }
      } else {
        modalDownload.style.display = 'block'; // Show direct download link
        downloadButton.textContent = '⬇️ Download'; // Reset button text
        if (vipAccessButton) {
            vipAccessButton.style.display = 'none'; // Hide VIP button
        }
      }

      const currentDownloads = downloadsFromFirebase[name] || 0;
      modalDownloadCountModal.textContent = `⬇️ Downloads: ${currentDownloads}`;

      gameModal.classList.add("show");
    }
  });

  // Event listener for the main Download button inside the modal
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
        const title = modalTitle.textContent;
        // Only increment if it's a direct download (not VIP access info)
        if (downloadButton.textContent === '⬇️ Download') {
            incrementDownloadCount(title);
            // Optionally, open the download link directly here,
            // or let modalDownload.href handle it if clicked
            // window.open(modalDownload.href, '_blank');
        }
    });
  }


  // Initial display logic
  document.getElementById("navGames").click(); // Trigger click on Games to initially display games
  certificateInfo.style.display = "block"; // Keep certificate info visible initially, or adjust as needed
  catalogSection.style.display = "none"; // Hide catalog initially
  searchInput.classList.add("hidden"); // Hide search initially
  activateButton(null); // Clear active button visual initially
});

// Assuming your chat.js handles the navChat button.
// You might need to adjust initial state of sections if "More" or "Certificate Info"
// are not your desired default view.
