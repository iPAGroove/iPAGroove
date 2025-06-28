// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const authSection = document.getElementById('authSection');
const adminContent = document.getElementById('adminContent');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authStatus = document.getElementById('authStatus');

const itemIdField = document.getElementById('itemId'); // Hidden field for current item ID
const itemType = document.getElementById('itemType');
const itemName = document.getElementById('itemName');
const itemDescription = document.getElementById('itemDescription');
const itemIcon = document.getElementById('itemIcon');
const itemVersion = document.getElementById('itemVersion');
const itemDownload = document.getElementById('itemDownload');
const itemGenre = document.getElementById('itemGenre');
const itemFileSize = document.getElementById('itemFileSize');
const itemMinIosVersion = document.getElementById('itemMinIosVersion');
const itemAccessType = document.getElementById('itemAccessType');
const saveItemBtn = document.getElementById('saveItemBtn');
const clearFormBtn = document.getElementById('clearFormBtn');
const itemsTableBody = document.getElementById('itemsTableBody');
const adminSearchInput = document.getElementById('adminSearchInput');

let allItems = []; // Combined array of games and apps for search/display

// --- Authentication Logic ---

// Check authentication state on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        authSection.classList.add('hidden');
        adminContent.classList.remove('hidden');
        authStatus.textContent = `Logged in as: ${user.email}`;
        loadAllItems(); // Load data when logged in
    } else {
        // User is signed out
        authSection.classList.remove('hidden');
        adminContent.classList.add('hidden');
        authStatus.textContent = 'Please login or register.';
    }
});

// Login User
loginBtn.addEventListener('click', async () => {
    const email = authEmail.value;
    const password = authPassword.value;
    authStatus.textContent = ''; // Clear previous status
    try {
        await signInWithEmailAndPassword(auth, email, password);
        authStatus.textContent = 'Login successful!';
        authStatus.style.color = 'green';
    } catch (error) {
        console.error("Login error:", error.code, error.message);
        authStatus.textContent = `Login failed: ${error.message}`;
        authStatus.style.color = 'red';
    }
});

// Register User (Only enable this for initial admin setup, then disable/remove for security)
registerBtn.addEventListener('click', async () => {
    const email = authEmail.value;
    const password = authPassword.value;
    authStatus.textContent = ''; // Clear previous status
    try {
        // IMPORTANT: For production, you should disable public registration
        // and only create admin accounts manually in Firebase console or via a secure backend.
        await createUserWithEmailAndPassword(auth, email, password);
        authStatus.textContent = 'Registration successful! You are now logged in.';
        authStatus.style.color = 'green';
    } catch (error) {
        console.error("Registration error:", error.code, error.message);
        authStatus.textContent = `Registration failed: ${error.message}`;
        authStatus.style.color = 'red';
    }
});

// Logout User
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        authStatus.textContent = 'Logged out successfully.';
        authStatus.style.color = 'green';
        clearForm(); // Clear form after logout
        itemsTableBody.innerHTML = ''; // Clear items list
    } catch (error) {
        console.error("Logout error:", error.code, error.message);
        authStatus.textContent = `Logout failed: ${error.message}`;
        authStatus.style.color = 'red';
    }
});

// --- CRUD Operations Logic ---

// Load all items (games and apps) from Firebase
function loadAllItems() {
    const gamesRef = ref(db, 'games');
    const appsRef = ref(db, 'apps');

    onValue(gamesRef, (snapshot) => {
        const games = [];
        snapshot.forEach(childSnapshot => {
            games.push({ id: childSnapshot.key, type: 'Games', ...childSnapshot.val() });
        });
        updateItemsTable(games, 'Games');
    });

    onValue(appsRef, (snapshot) => {
        const apps = [];
        snapshot.forEach(childSnapshot => {
            apps.push({ id: childSnapshot.key, type: 'Apps', ...childSnapshot.val() });
        });
        updateItemsTable(apps, 'Apps');
    });
}

function updateItemsTable(data, type) {
    // This function needs to merge data from both 'games' and 'apps'
    // and then re-render the entire table based on the combined 'allItems' array.
    // Let's refine the logic for 'onValue' to manage 'allItems' correctly.

    // A more robust way to manage allItems:
    // Store data by type temporarily, then combine and render.
    if (!updateItemsTable.dataStore) {
        updateItemsTable.dataStore = { Games: [], Apps: [] };
    }
    updateItemsTable.dataStore[type] = data;

    allItems = [...updateItemsTable.dataStore.Games, ...updateItemsTable.dataStore.Apps];
    renderItemsTable(allItems);
}


// Render items in the table
function renderItemsTable(itemsToRender) {
    itemsTableBody.innerHTML = '';
    itemsToRender.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (itemsToRender.length === 0) {
        itemsTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-400">No items found.</td></tr>';
        return;
    }

    itemsToRender.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-700 hover:bg-gray-800 transition-colors';
        row.innerHTML = `
            <td class="py-2 px-3"><img src="${item.icon}" alt="Icon" class="w-10 h-10 rounded"></td>
            <td class="py-2 px-3">${item.name}</td>
            <td class="py-2 px-3">${item.type}</td>
            <td class="py-2 px-3">${item.version}</td>
            <td class="py-2 px-3">${item.access_type || 'Free'}</td>
            <td class="py-2 px-3">
                <button class="btn btn-secondary text-sm px-3 py-1 mr-2 edit-btn" data-id="${item.id}" data-type="${item.type}">Edit</button>
                <button class="btn btn-danger text-sm px-3 py-1 delete-btn" data-id="${item.id}" data-type="${item.type}">Delete</button>
            </td>
        `;
        itemsTableBody.appendChild(row);
    });

    // Add event listeners for edit/delete buttons after rendering
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', editItem);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteItem);
    });
}

// Clear form fields
function clearForm() {
    itemIdField.value = '';
    itemType.value = 'Games';
    itemName.value = '';
    itemDescription.value = '';
    itemIcon.value = '';
    itemVersion.value = '';
    itemDownload.value = '';
    itemGenre.value = '';
    itemFileSize.value = '';
    itemMinIosVersion.value = '';
    itemAccessType.value = 'Free';
    saveItemBtn.textContent = 'Add New Item';
    saveItemBtn.classList.remove('btn-secondary');
    saveItemBtn.classList.add('btn-primary');
}

clearFormBtn.addEventListener('click', clearForm);

// Save/Update Item
saveItemBtn.addEventListener('click', async () => {
    const id = itemIdField.value;
    const type = itemType.value.toLowerCase(); // 'games' or 'apps'
    const itemData = {
        name: itemName.value,
        description: itemDescription.value,
        icon: itemIcon.value,
        version: itemVersion.value,
        download: itemDownload.value,
        genre: itemGenre.value,
        fileSize: itemFileSize.value,
        minIosVersion: itemMinIosVersion.value,
        access_type: itemAccessType.value,
        lastModified: new Date().toISOString() // Set current date
    };

    if (!itemData.name || !itemData.download || !itemData.icon) {
        alert("Name, Icon URL, and Download URL are required!");
        return;
    }

    try {
        if (id) {
            // Update existing item
            const itemRef = ref(db, `${type}/${id}`);
            await update(itemRef, itemData);
            alert('Item updated successfully!');
        } else {
            // Add new item
            const newRef = push(ref(db, type));
            await set(newRef, itemData);
            alert('Item added successfully!');
        }
        clearForm(); // Clear form after successful operation
    } catch (error) {
        console.error("Error saving item:", error);
        alert(`Failed to save item: ${error.message}`);
    }
});

// Edit Item - populate form
function editItem(event) {
    const id = event.target.dataset.id;
    const type = event.target.dataset.type; // 'Games' or 'Apps'
    const currentItem = allItems.find(item => item.id === id && item.type === type);

    if (currentItem) {
        itemIdField.value = currentItem.id;
        itemType.value = currentItem.type;
        itemName.value = currentItem.name;
        itemDescription.value = currentItem.description;
        itemIcon.value = currentItem.icon;
        itemVersion.value = currentItem.version;
        itemDownload.value = currentItem.download;
        itemGenre.value = currentItem.genre;
        itemFileSize.value = currentItem.fileSize;
        itemMinIosVersion.value = currentItem.minIosVersion;
        itemAccessType.value = currentItem.access_type || 'Free'; // Default if not set

        saveItemBtn.textContent = 'Save Changes';
        saveItemBtn.classList.remove('btn-primary');
        saveItemBtn.classList.add('btn-secondary');
    }
}

// Delete Item
async function deleteItem(event) {
    const id = event.target.dataset.id;
    const type = event.target.dataset.type; // 'Games' or 'Apps'

    if (confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
        try {
            const itemRef = ref(db, `${type.toLowerCase()}/${id}`);
            await remove(itemRef);
            alert('Item deleted successfully!');
            clearForm(); // Clear form in case deleted item was being edited
        } catch (error) {
            console.error("Error deleting item:", error);
            alert(`Failed to delete item: ${error.message}`);
        }
    }
}

// Search/Filter functionality for admin table
adminSearchInput.addEventListener('input', () => {
    const query = adminSearchInput.value.toLowerCase();
    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.genre.toLowerCase().includes(query) ||
        item.version.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
    renderItemsTable(filteredItems);
});

// Initial load (after authentication check completes)
// The onAuthStateChanged listener will call loadAllItems()
// once the user is authenticated.
