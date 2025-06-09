
import { getDatabase, ref, push, onChildAdded, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const db = getDatabase();
const chatMessagesRef = ref(db, "messages");
const onlineUsersRef = ref(db, "onlineUsers");

let nickname = localStorage.getItem("nickname") || "";
let lastSeenTimestamp = parseInt(localStorage.getItem("lastSeen") || "0");
let unreadCount = 0;

let notifySound;
document.addEventListener("click", () => {
  if (!notifySound) {
    notifySound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3");
    notifySound.volume = 0.4;
  }
});

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

function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 60%)`;
}

function showUnreadBadge(count) {
  let badge = navChat.querySelector(".badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "badge absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1";
    navChat.appendChild(badge);
  }
  badge.textContent = count;
  badge.style.display = count > 0 ? "block" : "none";
}

function renderMessage(data) {
  const p = document.createElement("p");
  p.className = "mb-1";
  const color = getColorForName(data.name);
  p.innerHTML = `<strong style="color:${color}">${data.name}:</strong> ${data.text}`;
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

onChildAdded(chatMessagesRef, (snapshot) => {
  const msg = snapshot.val();
  renderMessage(msg);

  if (msg.timestamp > lastSeenTimestamp && chatModal.classList.contains("hidden")) {
    unreadCount++;
    showUnreadBadge(unreadCount);
    if (notifySound) notifySound.play().catch(() => {});
  }
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !nickname) return;
  push(chatMessagesRef, {
    name: nickname,
    text,
    timestamp: Date.now()
  });
  chatInput.value = "";
});

saveNicknameBtn.addEventListener("click", () => {
  const name = nicknameInput.value.trim();
  if (!name) return;
  nickname = name;
  localStorage.setItem("nickname", nickname);
  nicknamePrompt.classList.add("hidden");
  chatMain.classList.remove("hidden");
  currentNickname.textContent = `👤 ${nickname}`;
});

changeNicknameBtn.addEventListener("click", () => {
  nicknamePrompt.classList.remove("hidden");
  chatMain.classList.add("hidden");
});

navChat.addEventListener("click", () => {
  chatModal.classList.toggle("hidden");

  if (!chatModal.classList.contains("hidden")) {
    lastSeenTimestamp = Date.now();
    localStorage.setItem("lastSeen", lastSeenTimestamp.toString());
    showUnreadBadge(0);
  }
});

function init() {
  if (nickname) {
    nicknamePrompt.classList.add("hidden");
    chatMain.classList.remove("hidden");
    currentNickname.textContent = `👤 ${nickname}`;
  }

  const userRef = push(onlineUsersRef);
  userRef.set(true);
  userRef.onDisconnect().remove();

  onValue(onlineUsersRef, (snapshot) => {
    const users = snapshot.val() || {};
    onlineCounter.textContent = `🟢 Online: ${Object.keys(users).length}`;
  });
}

init();
