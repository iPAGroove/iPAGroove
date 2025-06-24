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
  appId: "1:534978415110:web:443213a43690d5658e4b77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let currentCatalog = "games"; // 'games' or 'apps'
let gamesData = [];
let appsData = [];
let currentFilter = "top"; // 'top' or 'vip'

const gamesList = document.getElementById("catalogList");
const certificateInfo = document.getElementById("certificateInfo");
const catalogSection = document.getElementById("catalogSection");
const searchInput = document.getElementById("searchInput");
const pagination = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfoSpan = document.getElementById("pageInfo");
const gameModal = document.getElementById("gameModal");
const downloadButton = document.getElementById("downloadButton");
const vipPurchaseButton = document.getElementById("vipPurchaseButton");
const loader = document.getElementById("loader");

const topButton = document.getElementById("topButton");
const vipButton = document.getElementById("vipButton");
const catalogTabs = document.getElementById("catalogTabs");

// Function to fetch certificate expiry date
function fetchCertificateExpiry() {
  const certRef = ref(db, 'certificateExpiry');
  onValue(certRef, (snapshot) => {
    const expiryDate = snapshot.val();
    const certDateEl = document.getElementById("certificateDate");
    const certStatusEl = document.getElementById("certificateStatus");

    if (expiryDate) {
      certDateEl.textContent = new Date(expiryDate).toLocaleDateString();
      const now = new Date();
      const expiry = new Date(expiryDate);
      if (now > expiry) {
        certStatusEl.textContent = "Сертификат просрочен!";
        certStatusEl.classList.remove("text-green-400");
        certStatusEl.classList.add("text-red-400");
      } else {
        certStatusEl.textContent = "Сертификат действителен";
        certStatusEl.classList.remove("text-red-400");
        certStatusEl.classList.add("text-green-400");
      }
    } else {
      certDateEl.textContent = "Информация о сертификате недоступна.";
      certStatusEl.textContent = "";
    }
  });
}

fetchCertificateExpiry();

function renderList(data) {
  gamesList.innerHTML = "";
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const itemsToDisplay = data.slice(startIndex, endIndex);

  if (itemsToDisplay.length === 0) {
    gamesList.innerHTML = "<p class='text-center text-gray-400 col-span-full'>No items found.</p>";
    pagination.classList.add("hidden");
    return;
  }

  itemsToDisplay.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "bg-dark p-4 rounded-lg text-center cursor-pointer transform transition-transform duration-200 hover:scale-105 border border-purple-500/30";
    itemDiv.innerHTML = `
            <img src="${item.icon}" alt="${item.name}" class="w-24 h-24 mx-auto mb-2 rounded-lg shadow-md">
            <h3 class="text-md font-semibold text-white truncate">${item.name}</h3>
            <p class="text-gray-400 text-sm truncate">${item.description}</p>
        `;
    itemDiv.addEventListener("click", () => openModal(item));
    gamesList.appendChild(itemDiv);
  });

  updatePagination(data.length);
}

function updatePagination(totalItems) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;

  if (totalPages > 1) {
    pagination.classList.remove("hidden");
  } else {
    pagination.classList.add("hidden");
  }
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    applyFiltersAndRender();
  }
});

nextPageBtn.addEventListener("click", () => {
  const sourceData = currentCatalog === "games" ? gamesData : appsData;
  const totalPages = Math.ceil(sourceData.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    applyFiltersAndRender();
  }
});

function openModal(item) {
  document.getElementById("modalIcon").src = item.icon;
  document.getElementById("modalName").textContent = item.name;
  document.getElementById("modalDescription").textContent = item.description;
  document.getElementById("modalVersion").textContent = `Version: ${item.version}`;
  document.getElementById("modalFileSize").textContent = `Size: ${item.fileSize}`;
  document.getElementById("modalMinIosVersion").textContent = `Requires iOS: ${item.minIosVersion}`;

  downloadButton.onclick = () => {
    if (item.download) {
      window.location.href = item.download;
      // Increment download count for TOP apps
      if (currentFilter === "top") {
        incrementDownloadCount(item.name, currentCatalog);
      }
    } else {
      alert("Download link not available.");
    }
  };

  if (item.access_type === "VIP") {
    downloadButton.classList.add("hidden");
    vipPurchaseButton.classList.remove("hidden");
  } else {
    downloadButton.classList.remove("hidden");
    vipPurchaseButton.classList.add("hidden");
  }

  gameModal.classList.add("show");
  gameModal.classList.remove("hidden");
}

window.closeModal = function () {
  gameModal.classList.remove("show");
  gameModal.classList.add("hidden");
};

async function loadCatalog(type) {
  loader.style.display = "flex";
  currentCatalog = type;
  currentPage = 1; // Reset to first page when changing catalog

  searchInput.value = ""; // Clear search input when switching tabs
  searchInput.classList.remove("hidden"); // Show search input

  catalogTabs.classList.remove("hidden"); // Show TOP/VIP tabs

  // Reset filter to 'top' when switching catalogs
  currentFilter = "top";
  topButton.classList.add("active");
  vipButton.classList.remove("active");

  try {
    const response = await fetch(`${type} (1).json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (type === "games") {
      gamesData = data;
    } else {
      appsData = data;
    }
    applyFiltersAndRender();
  } catch (error) {
    console.error("Error loading catalog:", error);
    gamesList.innerHTML = "<p class='text-red-500'>Error loading data</p>";
  }

  loader.style.display = "none";
}

function applyFiltersAndRender() {
  let sourceData = currentCatalog === "games" ? gamesData : appsData;
  let filteredData = [];

  const searchValue = searchInput.value.toLowerCase();

  if (currentFilter === "top") {
    // Filter by search input first
    let searchFiltered = sourceData.filter(item => item.name.toLowerCase().includes(searchValue));
    // Sort by downloads (descending) for TOP
    filteredData = searchFiltered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  } else if (currentFilter === "vip") {
    // Filter by VIP status and then by search input
    let vipFiltered = sourceData.filter(item => item.access_type === "VIP");
    filteredData = vipFiltered.filter(item => item.name.toLowerCase().includes(searchValue));
  }

  renderList(filteredData);
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
  catalogTabs.classList.add("hidden"); // Hide TOP/VIP tabs
  searchInput.value = ""; // Clear search input
});

searchInput.addEventListener("input", () => {
  currentPage = 1; // Reset to first page on search
  applyFiltersAndRender();
});

// Event listeners for TOP/VIP buttons
topButton.addEventListener("click", () => {
  currentFilter = "top";
  topButton.classList.add("active");
  vipButton.classList.remove("active");
  currentPage = 1; // Reset to first page on filter change
  applyFiltersAndRender();
});

vipButton.addEventListener("click", () => {
  currentFilter = "vip";
  vipButton.classList.add("active");
  topButton.classList.remove("active");
  currentPage = 1; // Reset to first page on filter change
  applyFiltersAndRender();
});

function handleVipPurchaseClick() {
  alert("This is a VIP-only item. Please contact us for VIP access!");
  // You can add more complex logic here, e.g., redirect to a VIP purchase page.
}

// Function to increment download count in Firebase
function incrementDownloadCount(itemName, catalogType) {
  const itemRef = ref(db, `${catalogType}/${itemName}`); // Assuming item name is unique identifier
  runTransaction(itemRef, (currentItem) => {
    if (currentItem) {
      if (!currentItem.downloads) {
        currentItem.downloads = 0;
      }
      currentItem.downloads++;
    }
    return currentItem;
  });
}
