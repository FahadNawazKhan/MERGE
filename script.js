// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTSHG1q2m_WQ3YHEIPriiw7PDgF_fIJoA",
  authDomain: "merge-a25cd.firebaseapp.com",
  databaseURL: "https://merge-a25cd-default-rtdb.firebaseio.com",
  projectId: "merge-a25cd",
  storageBucket: "merge-a25cd.firebasestorage.app",
  messagingSenderId: "98878573435",
  appId: "1:98878573435:web:c051e4d86001134b618bde",
  measurementId: "G-L1RL5WLXR8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Attach signup function to the global window object
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signed up successfully!");
  } catch (err) {
    alert(err.message);
  }
};

// Attach login function to the global window object
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // Hide the authentication form and show the chat section
    document.getElementById("authForm").style.display = "none";
    document.getElementById("chatSection").style.display = "flex";

    // Start listening for messages
    listenForMessages();
  } catch (err) {
    alert(err.message);
  }
};

// Attach logout function to the global window object
window.logout = async function () {
  try {
    await signOut(auth);
    document.getElementById("authForm").style.display = "block";
    document.getElementById("chatSection").style.display = "none";
  } catch (err) {
    alert(err.message);
  }
};

// Attach sendMessage function to the global window object
window.sendMessage = async function () {
  const msg = document.getElementById("messageInput").value; // <-- FIXED ID
  if (msg.trim() === "") return;

  try {
    await addDoc(collection(db, "messages"), {
      text: msg,
      sender: auth.currentUser.email,
      timestamp: serverTimestamp(),
    });
    document.getElementById("messageInput").value = ""; // <-- FIXED ID
  } catch (err) {
    alert(err.message);
  }
};

// Populate the chat list dynamically
function populateChatList() {
  const chatList = document.querySelector(".chat-list");

  // Example chat list (replace with real data from Firestore or APIs)
  const chats = [
    { name: "John Doe", lastMessage: "Hey, how are you doing?", time: "2 min", avatar: "JD" },
    { name: "Sarah Smith", lastMessage: "Check out this link!", time: "15 min", avatar: "SS" },
    { name: "Mike Johnson", lastMessage: "Meeting at 3pm tomorrow", time: "1 hr", avatar: "MJ" },
  ];

  // Clear the existing chat list
  chatList.innerHTML = "";

  // Populate the chat list
  chats.forEach((chat) => {
    const chatItem = document.createElement("li");
    chatItem.classList.add("chat-item");
    chatItem.innerHTML = `
      <div class="chat-avatar">${chat.avatar}</div>
      <div class="chat-info">
        <h4>${chat.name}</h4>
        <p>${chat.lastMessage}</p>
      </div>
      <span class="chat-time">${chat.time}</span>
    `;
    chatList.appendChild(chatItem);
  });
}

// Listen for messages in real time
function listenForMessages() {
  const messagesDiv = document.getElementById("chatMessages");

  const messagesQuery = query(
    collection(db, "messages"),
    orderBy("timestamp", "asc")
  );

  onSnapshot(messagesQuery, (snapshot) => {
    messagesDiv.innerHTML = ""; // Clear previous messages
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", msg.sender === auth.currentUser.email ? "sent" : "received");
      messageDiv.innerHTML = `
        <p>${msg.text}</p>
        <span class="time">${new Date(msg.timestamp?.toDate()).toLocaleTimeString()}</span>
      `;
      messagesDiv.appendChild(messageDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to the latest message
  });
}

console.log("script.js loaded");
