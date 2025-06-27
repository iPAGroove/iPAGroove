import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// ✅ Настройка Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBizq_3JJXWgUa-aaW8MKj6AV0Jt_-XYcI",
  authDomain: "ipa-chat.firebaseapp.com",
  databaseURL: "https://ipa-chat-default-rtdb.firebaseio.com",
  projectId: "ipa-chat",
  storageBucket: "ipa-chat.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Добавление приложения
document.getElementById("submitApp").addEventListener("click", async () => {
  const getVal = id => document.getElementById(id).value.trim();
  const appData = {
    name: getVal("appTitle"),
    description: getVal("appDesc").replace(/\\n/g, "\n"),
    icon: getVal("appIcon"),
    download: getVal("appDownload"),
    genre: getVal("appGenre"),
    version: getVal("appVersion"),
    fileSize: getVal("appSize"),
    minIosVersion: getVal("appIos"),
    lastModified: new Date().toISOString(),
    access_type: "Free"
  };

  if (!appData.name || !appData.download || !appData.genre) {
    alert("⚠️ Заполни минимум: название, ipa и жанр.");
    return;
  }

  const path = `${appData.genre}/${Date.now()}`;
  await set(ref(db, path), appData);

  const status = document.getElementById("addStatus");
  status.classList.remove("hidden");
  setTimeout(() => status.classList.add("hidden"), 2000);
});
