
// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, set, onValue
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase config
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

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.addEventListener("DOMContentLoaded", () => {
  const chatBtn = document.getElementById("chatButton");
  const chatModal = document.getElementById("chatModal");
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const nickInput = document.getElementById("nicknameInput");
  const saveNickBtn = document.getElementById("saveNickname");
  const currentNickLabel = document.getElementById("currentNickname");
  const changeNickBtn = document.getElementById("changeNickname");
  const onlineCounter = document.getElementById("onlineCounter");

  let nickname = localStorage.getItem("nickname");

  function updateNicknameUI() {
    if (nickname) {
      currentNickLabel.textContent = `You: ${nickname}`;
    }
  }

  function updatePresence() {
    if (!nickname) return;
    const presenceRef = ref(db, `presence/${nickname}`);
    set(presenceRef, { online: true, ts: Date.now() });

    setInterval(() => {
      set(presenceRef, { online: true, ts: Date.now() });
    }, 15000);
  }

  if (nickname) {
    document.getElementById("nicknamePrompt").classList.add("hidden");
    document.getElementById("chatMain").classList.remove("hidden");
    updateNicknameUI();
    updatePresence();
  }

  chatBtn.addEventListener("click", () => {
    chatModal.classList.toggle("hidden");

    if (!nickname) {
      document.getElementById("nicknamePrompt").classList.remove("hidden");
      document.getElementById("chatMain").classList.add("hidden");
    } else {
      document.getElementById("nicknamePrompt").classList.add("hidden");
      document.getElementById("chatMain").classList.remove("hidden");
      updateNicknameUI();
      updatePresence();
    }
  });

  saveNickBtn.addEventListener("click", () => {
    const nick = nickInput.value.trim();
    if (nick) {
      nickname = nick;
      localStorage.setItem("nickname", nickname);
      document.getElementById("nicknamePrompt").classList.add("hidden");
      document.getElementById("chatMain").classList.remove("hidden");
      updateNicknameUI();
      updatePresence();
    }
  });

  changeNickBtn.addEventListener("click", () => {
    localStorage.removeItem("nickname");
    nickname = null;
    document.getElementById("nicknamePrompt").classList.remove("hidden");
    document.getElementById("chatMain").classList.add("hidden");
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message && nickname) {
      push(ref(db, "messages"), {
        name: nickname,
        text: message,
        time: Date.now()
      });
      chatInput.value = "";
    }
  });

  onChildAdded(ref(db, "messages"), (data) => {
    const msg = data.val();
    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  onValue(ref(db, "presence"), (snapshot) => {
    const users = snapshot.val();
    const now = Date.now();
    let onlineCount = 0;
    for (const key in users) {
      if (users[key].ts && now - users[key].ts < 30000) {
        onlineCount++;
      }
    }
    onlineCounter.textContent = `🟢 Online: ${onlineCount}`;
  });
});
