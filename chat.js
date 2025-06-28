import { getDatabase, ref, push, onChildAdded, onValue, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Добавьте эту строку для импорта db из script.js
import { db } from './script.js'; // Убедитесь, что путь './script.js' корректен для вашего текущего расположения файлов

document.addEventListener("DOMContentLoaded", () => {
  const chatMessagesRef = ref(db, "messages");
  const nicknamePrompt = document.getElementById("nicknamePrompt");
  const chatMain = document.getElementById("chatMain");
  const chatModal = document.getElementById("chatModal");
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const nicknameInput = document.getElementById("nicknameInput");
  const saveNicknameBtn = document.getElementById("saveNickname");
  const currentNickname = document.getElementById("currentNickname");
  const changeNicknameBtn = document.getElementById("changeNickname");
  const onlineCounter = document.getElementById("onlineCounter");
  const navChat = document.getElementById("navChat");
  const chatSendButton = chatForm.querySelector("button");

  let nickname = localStorage.getItem("nickname") || "";
  let lastSeenTimestamp = parseInt(localStorage.getItem("lastSeen") || "0");
  let unreadCount = 0;

  // <--- УБЕДИТЕСЬ, ЧТО ЭТА СТРОКА ЗДЕСЬ И НЕ ПРОПУЩЕНА!
  let notifySound = null; // Инициализируем notifySound здесь

  document.addEventListener("click", () => {
    if (!notifySound) {
      notifySound = new Audio("https://raw.githubusercontent.com/iPAGroove/iPAGroove/main/ding-126626.mp3");
      notifySound.volume = 0.9;
    }
  });

  function getColorForName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#FF6347", "#FFD700", "#ADFF2F", "#6A5ACD", "#00CED1",
      "#FF4500", "#DA70D6", "#32CD32", "#4169E1", "#8A2BE2"
    ];
    return colors[Math.abs(hash % colors.length)];
  }

  // Initial setup
  if (nickname) {
    nicknamePrompt.classList.add("hidden");
    chatMain.classList.remove("hidden");
    currentNickname.textContent = nickname;
  } else {
    nicknamePrompt.classList.remove("hidden");
    chatMain.classList.add("hidden");
  }

  saveNicknameBtn.addEventListener("click", () => {
    const newNickname = nicknameInput.value.trim();
    if (newNickname) {
      nickname = newNickname;
      localStorage.setItem("nickname", nickname);
      currentNickname.textContent = nickname;
      nicknamePrompt.classList.add("hidden");
      chatMain.classList.remove("hidden");
      updatePresence();
    }
  });

  changeNicknameBtn.addEventListener("click", () => {
    nicknameInput.value = nickname; // Pre-fill with current nickname
    nicknamePrompt.classList.remove("hidden");
    chatMain.classList.add("hidden");
    // Clear old nickname's presence
    if (nickname) {
        const presenceRef = ref(db, `presence/${nickname}`);
        set(presenceRef, null); // Remove old nickname's presence
    }
    localStorage.removeItem("nickname");
    nickname = "";
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = chatInput.value.trim();
    if (messageText && nickname) {
      push(chatMessagesRef, {
        name: nickname,
        message: messageText,
        timestamp: Date.now(),
      });
      chatInput.value = "";
    }
  });

  onChildAdded(chatMessagesRef, (data) => {
    const message = data.val();
    const messageElement = document.createElement("div");
    messageElement.className = "mb-2 text-left";

    const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageElement.innerHTML = `
            <span class="font-bold" style="color: ${getColorForName(message.name)};">${message.name}:</span>
            <span class="text-white">${message.message}</span>
            <span class="text-gray-500 text-xs ml-2">${messageTime}</span>
        `;
    chatMessages.appendChild(messageElement);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Increment unread count if chat is not open and it's not our own message
    if (chatModal.classList.contains("hidden") && message.name !== nickname) {
        unreadCount++;
        showUnreadBadge(unreadCount);
        if (notifySound) { // Play sound only if notifySound is initialized
          notifySound.play().catch(e => console.error("Error playing sound:", e));
        }
    }
  });

  function showUnreadBadge(count) {
    const badge = navChat.querySelector(".badge");
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
  }

  navChat.addEventListener("click", () => {
  const isOpening = chatModal.classList.contains("hidden");
  chatModal.classList.toggle("hidden");

  if (!chatModal.classList.contains("hidden")) {
    lastSeenTimestamp = Date.now();
    localStorage.setItem("lastSeen", lastSeenTimestamp.toString());
    unreadCount = 0;
    showUnreadBadge(0);

    // ✅ Ждём отрисовку и прокручиваем вниз
    setTimeout(() => {
      requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    }, 100);
  }

  if (nickname) {
    updatePresence();
  }
});

  function updatePresence() {
    if (!nickname) return;
    const presenceRef = ref(db, `presence/${nickname}`);
    set(presenceRef, { online: true, ts: Date.now() });
  }

  setInterval(updatePresence, 15000);

  onValue(ref(db, "presence"), (snapshot) => {
    const users = snapshot.val() || {};
    const now = Date.now();
    let onlineCount = 0;
    for (const key in users) {
      if (users[key].ts && now - users[key].ts < 30000) {
        onlineCount++;
      }
    }
    const onlineCountEl = document.getElementById("onlineCount");
    if (onlineCountEl) {
      onlineCountEl.textContent = `Online: ${onlineCount}`;
    }
  });
});
