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
  appId: "1:534978415110:web:d2f4a4f8e0b0e0c0d0a0b" // ОБЯЗАТЕЛЬНО УКАЖИТЕ ВАШ РЕАЛЬНЫЙ App ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global data arrays
let gamesData = [];
let appsData = [];
let downloadsFromFirebase = {}; // Для хранения счетчиков загрузок

// Function to load data from Firebase
async function loadDataFromFirebase() {
  const gamesRef = ref(db, 'games');
  const appsRef = ref(db, 'apps');
  const downloadsRef = ref(db, 'downloads'); // Ссылка на счетчики загрузок

  // Listen for changes in 'games' collection
  onValue(gamesRef, (snapshot) => {
    gamesData = [];
    snapshot.forEach((childSnapshot) => {
      gamesData.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    console.log("Games loaded from Firebase:", gamesData.length, "items.");
    // Update display if Games tab is active
    if (document.getElementById("navGames").classList.contains("active")) {
      renderList(gamesData);
    }
  }, (error) => {
    console.error("Error loading games from Firebase:", error);
  });

  // Listen for changes in 'apps' collection
  onValue(appsRef, (snapshot) => {
    appsData = [];
    snapshot.forEach((childSnapshot) => {
      appsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    console.log("Apps loaded from Firebase:", appsData.length, "items.");
    // Update display if Apps tab is active
    if (document.getElementById("navApps").classList.contains("active")) {
      renderList(appsData);
    }
  }, (error) => {
    console.error("Error loading apps from Firebase:", error);
  });

  // Listen for changes in 'downloads'
  onValue(downloadsRef, (snapshot) => {
    downloadsFromFirebase = snapshot.val() || {};
    console.log("Downloads loaded from Firebase:", downloadsFromFirebase);
    // Update download counts on open modal if it's visible
    const gameModal = document.getElementById("gameModal");
    if (gameModal && gameModal.classList.contains("show")) {
      const modalTitle = document.getElementById("modalTitle");
      if (modalTitle.textContent) {
        const currentDownloads = downloadsFromFirebase[modalTitle.textContent] || 0;
        document.getElementById("modalDownloadCountModal").textContent = `⬇️ Downloads: ${currentDownloads}`;
      }
    }
  }, (error) => {
    console.error("Error loading downloads from Firebase:", error);
  });
}

// Function to increment download count
function incrementDownloadCount(itemName) {
    if (!itemName) return;
    const downloadRef = ref(db, `downloads/${itemName}`);
    runTransaction(downloadRef, (currentValue) => {
        return (currentValue || 0) + 1;
    }).then(() => {
        console.log(`Download count for ${itemName} incremented.`);
    }).catch((error) => {
        console.error(`Transaction failed for ${itemName}:`, error);
    });
}

// Render list function (assuming this is already in your script.js)
const catalogSection = document.getElementById("catalogSection");
const gamesList = document.getElementById("gamesList");
const gameModal = document.getElementById("gameModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalIcon = document.getElementById("modalIcon");
const modalDownload = document.getElementById("modalDownload");
const modalSize = document.getElementById("modalSize");
const modalMinIos = document.getElementById("modalMinIos");
const modalAddedDate = document.getElementById("modalAddedDate");
const modalVersion = document.getElementById("modalVersion");
const modalDownloadCountModal = document.getElementById("modalDownloadCountModal");
const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const certificateInfo = document.getElementById("certificateInfo");
const downloadButton = document.getElementById("downloadButton");
const vipAccessButton = document.getElementById("vipAccessButton"); // If it exists

function timeAgo(isoDateString) {
  const date = new Date(isoDateString);
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
  gamesList.innerHTML = ''; // Clear previous list
  if (!data || data.length === 0) {
    gamesList.innerHTML = '<p class="text-white text-center text-lg mt-8">No items found.</p>';
    return;
  }

  data.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'flex items-center p-3 mb-3 bg-purple-900/50 rounded-lg shadow-md hover:bg-purple-800/50 transition-colors cursor-pointer';
    itemElement.innerHTML = `
      <img src="${item.icon}" alt="${item.name} icon" class="w-16 h-16 rounded-lg mr-4 object-cover">
      <div class="flex-grow">
        <h3 class="text-white font-bold text-lg">${item.name}</h3>
        <p class="text-gray-300 text-sm">${item.description.substring(0, 70)}...</p>
        <span class="text-gray-400 text-xs mt-1 block">${item.genre} | ${item.version}</span>
      </div>
      <button class="bg-purple-600 text-white px-4 py-2 rounded-full text-sm ml-4 shadow-lg hover:bg-purple-700 transition-colors">GET</button>
    `;

    // Add data attributes for modal
    const getButton = itemElement.querySelector('button');
    getButton.dataset.name = item.name;
    getButton.dataset.desc = item.description;
    getButton.dataset.icon = item.icon;
    getButton.dataset.download = item.download;
    getButton.dataset.version = item.version;
    getButton.dataset.size = item.fileSize;
    getButton.dataset.minIos = item.minIosVersion;
    getButton.dataset.lastModified = item.lastModified;
    getButton.dataset.genre = item.genre;
    getButton.dataset.accessType = item.access_type || 'Free'; // Default to Free

    gamesList.appendChild(itemElement);
  });
}

// Event listeners for UI elements
closeModalBtn.addEventListener('click', () => {
  gameModal.classList.remove("show");
});

window.addEventListener('click', (event) => {
  if (event.target === gameModal) {
    gameModal.classList.remove("show");
  }
});

// Search functionality
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const activeNavButton = document.querySelector('.nav-button.active'); // Find active button
  let currentData = [];

  if (activeNavButton && activeNavButton.id === 'navGames') {
    currentData = gamesData;
  } else if (activeNavButton && activeNavButton.id === 'navApps') {
    currentData = appsData;
  } else {
    currentData = [...gamesData, ...appsData]; // Search all if no specific tab active
  }

  const filteredData = currentData.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.genre.toLowerCase().includes(query)
  );
  renderList(filteredData);
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  const activeNavButton = document.querySelector('.nav-button.active');
  if (activeNavButton && activeNavButton.id === 'navGames') {
    renderList(gamesData);
  } else if (activeNavButton && activeNavButton.id === 'navApps') {
    renderList(appsData);
  }
});

// Activate button function
function activateButton(button) {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.remove('text-purple-400', 'border-b-2', 'border-purple-400');
    btn.classList.add('text-white');
  });
  if (button) {
    button.classList.add('active');
    button.classList.add('text-purple-400', 'border-b-2', 'border-purple-400');
    button.classList.remove('text-white');
  }
}

// DOM Content Loaded - Main Logic
document.addEventListener("DOMContentLoaded", () => {
  // Load data from Firebase
  loadDataFromFirebase();

  // Get UI elements (ensure these IDs exist in index.html)
  const navGames = document.getElementById("navGames");
  const navApps = document.getElementById("navApps");
  const navChat = document.getElementById("navChat"); // Assuming chat is handled in chat.js, but the button might be here
  const navMore = document.getElementById("navMore"); // Assuming More button exists

  // Initial state / default active tab
  // If you want Games to be active by default and display data:
  if (navGames) {
    activateButton(navGames); // Mark Games as active
  }

  // Event Listeners for Navigation Buttons
  if (navGames) {
    navGames.addEventListener("click", () => {
      activateButton(navGames);
      catalogSection.style.display = "block";
      certificateInfo.style.display = "none";
      searchInput.classList.remove("hidden");
      renderList(gamesData); // Render games loaded from Firebase
    });
  }

  if (navApps) {
    navApps.addEventListener("click", () => {
      activateButton(navApps);
      catalogSection.style.display = "block";
      certificateInfo.style.display = "none";
      searchInput.classList.remove("hidden");
      renderList(appsData); // Render apps loaded from Firebase
    });
  }

  // Handle "More" button click - currently just hides sections
  if (navMore) {
    navMore.addEventListener("click", () => {
      activateButton(navMore); // Mark More as active
      catalogSection.style.display = "none";
      certificateInfo.style.display = "block"; // Show certificate info
      searchInput.classList.add("hidden");
    });
  }

  // Delegated event listener for "GET" buttons on the list items
  gamesList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button && button.textContent === 'GET') {
        const name = button.dataset.name;
        const desc = button.dataset.desc;
        const icon = button.dataset.icon;
        const download = button.dataset.download;
        const version = button.dataset.version;
        const size = button.dataset.size;
        const minIos = button.dataset.minIos;
        const lastModified = button.dataset.lastModified;
        const genre = button.dataset.genre;
        const accessType = button.dataset.accessType; // Add this

        modalTitle.textContent = name;
        modalDesc.textContent = desc;
        modalIcon.src = icon;
        modalDownload.href = download; // Link to S3 file
        modalSize.textContent = size;
        modalMinIos.textContent = minIos;
        modalAddedDate.textContent = timeAgo(lastModified);
        modalVersion.textContent = version;
        document.getElementById("modalGenre").textContent = genre;

        // Handle VIP access if applicable
        if (accessType === 'VIP') {
            modalDownload.style.display = 'none';
            downloadButton.textContent = '🔒 VIP Access';
            if (vipAccessButton) {
                vipAccessButton.style.display = 'block'; // Show VIP button
            }
        } else {
            modalDownload.style.display = 'block';
            downloadButton.textContent = '⬇️ Download';
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
