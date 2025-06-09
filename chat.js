
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded, set, onValue
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
  const chatBtn = document.getElementById("navChat");
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
  let unreadCount = 0;
  const unreadBadge = document.createElement("span");
  unreadBadge.id = "chatUnread";
  unreadBadge.className = "ml-1 text-xs text-red-400 font-bold hidden";
  unreadBadge.textContent = "";

  if (chatBtn && chatBtn.querySelector("span")) {
    chatBtn.querySelector("span").appendChild(unreadBadge);
  }

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

    // сброс непрочитанных
    unreadCount = 0;
    unreadBadge.textContent = "";
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

  const messagesRef = ref(db, "messages");
  onChildAdded(messagesRef, (data) => {
    const msg = data.val();
    if (!msg || !chatMessages) {
      console.warn("Сообщение пустое или chatMessages не найдено", msg);
      return;
    }

    const div = document.createElement("div");
    div.className = "mb-2";
    div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Увеличиваем счётчик, если чат закрыт
    if (chatModal.classList.contains("hidden")) {
      unreadCount++;
      if (unreadCount > 0) {
  unreadBadge.textContent = `${unreadCount}`;
  unreadBadge.classList.remove("hidden");
} else {
  unreadBadge.textContent = "";
  unreadBadge.classList.add("hidden");
}
    }
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
