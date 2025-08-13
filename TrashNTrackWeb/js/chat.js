// Eliminar todas las declaraciones import y usar la sintaxis de Firebase compat
const firebase = window.firebase

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFke4dQQfIPsBFkshWvCB9jVuYuilDWuA",
  authDomain: "trashandtrack-928dc.firebaseapp.com",
  projectId: "trashandtrack-928dc",
  storageBucket: "trashandtrack-928dc.firebasestorage.app",
  messagingSenderId: "412401788328",
  appId: "1:412401788328:web:3e8574a349f16fe181299d",
}

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const db = firebase.firestore()

// Referencias DOM
const userListDiv = document.getElementById("userList")
const chatHeaderTitle = document.getElementById("chatHeaderTitle")
const closeChatButton = document.getElementById("closeChatButton")
const chatMessagesDiv = document.getElementById("chatMessages")
const messageInput = document.getElementById("messageInput")
const sendMessageButton = document.getElementById("sendMessageButton")
const chatInputContainer = document.getElementById("chatInput")
const initialChatPrompt = document.getElementById("initialChatPrompt")
const loadingOverlay = document.getElementById("loadingOverlay")

// Variables globales
let selectedUser = null
let unsubscribeMessages = null
let currentAdminUID = null
const adminNamesMap = {}

// Constantes de estado
const STATUS_PENDING = 0
const STATUS_APPROVED = 1
const STATUS_REJECTED = 2

const STATUS_MAP = {
  [STATUS_PENDING]: "PENDIENTE",
  [STATUS_APPROVED]: "APROBADO",
  [STATUS_REJECTED]: "RECHAZADO",
}

const STATUS_CLASS_MAP = {
  [STATUS_PENDING]: "status-0",
  [STATUS_APPROVED]: "status-1",
  [STATUS_REJECTED]: "status-2",
}

// Funciones de utilidad
function showLoading(message = "Cargando...") {
  loadingOverlay.querySelector("p").textContent = message
  loadingOverlay.style.display = "flex"
}

function hideLoading() {
  loadingOverlay.style.display = "none"
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ""
  const date = timestamp.toDate()
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getChatRoomId(uid1, uid2) {
  return [uid1, uid2].sort().join("_")
}

// Verificar autenticación al cargar la página
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const userDoc = await db.collection("usersApproval").doc(user.uid).get()
      if (userDoc.exists && userDoc.data().accountType === "admin") {
        currentAdminUID = user.uid
        localStorage.setItem("currentAdminUID", user.uid)
        listenToUsers()
        resetChatPanel()
      } else {
        // No es admin, redirigir al login
        alert("Acceso denegado. Redirigiendo al login...")
        window.location.href = "login.html"
      }
    } catch (error) {
      console.error("Error al verificar usuario:", error)
      window.location.href = "login.html"
    }
  } else {
    // No hay usuario autenticado, redirigir al login
    window.location.href = "login.html"
  }
})

// Función para resetear el panel de chat
function resetChatPanel() {
  selectedUser = null
  if (unsubscribeMessages) {
    unsubscribeMessages()
    unsubscribeMessages = null
  }
  chatHeaderTitle.textContent = "Selecciona un usuario para chatear"
  chatMessagesDiv.innerHTML = ""
  initialChatPrompt.style.display = "flex"
  chatMessagesDiv.style.display = "none"
  chatInputContainer.style.display = "none"
  closeChatButton.style.display = "none"
  document.querySelectorAll(".user-item").forEach((item) => {
    item.classList.remove("active")
  })
}

// Función para cargar usuarios
function listenToUsers() {
  showLoading("Cargando usuarios...")

  db.collection("usersApproval")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        userListDiv.innerHTML = ""

        snapshot.docs.forEach((doc) => {
          const userData = doc.data()
          const userUid = doc.id

          // No mostrar al admin actual
          if (userUid === currentAdminUID) {
            return
          }

          const fullName = [userData.nombre, userData.apellidoPaterno, userData.apellidoMaterno]
            .filter(Boolean)
            .join(" ")
          const email = userData.email
          const status = userData.status
          const accountType = userData.accountType || "user"

          const userItem = document.createElement("div")
          userItem.className = `user-item ${selectedUser && selectedUser.uid === userUid ? "active" : ""}`
          userItem.dataset.uid = userUid
          userItem.dataset.email = email
          userItem.dataset.name = fullName
          userItem.dataset.status = status

          if (status !== STATUS_APPROVED) {
            userItem.classList.add("chat-disabled")
          }

          userItem.innerHTML = `
                    <span class="user-item-name">${fullName || email}</span>
                    <span class="user-item-email">${email}</span>
                    <div class="user-item-status-type">
                        <span class="status-badge ${STATUS_CLASS_MAP[status]}">
                            ${STATUS_MAP[status]}
                        </span>
                        <span class="type-badge type-${accountType}">
                            ${accountType}
                        </span>
                    </div>
                    <div class="user-actions">
                        <button class="action-button action-approve" data-uid="${userUid}" data-action="approve">Aprobar</button>
                        <button class="action-button action-reject" data-uid="${userUid}" data-action="reject">Rechazar</button>
                    </div>
                `

          userItem.addEventListener("click", (event) => {
            if (event.target.classList.contains("action-button")) {
              const action = event.target.dataset.action
              const targetUid = event.target.dataset.uid

              if (action === "approve") {
                updateUserStatus(targetUid, STATUS_APPROVED)
              } else if (action === "reject") {
                updateUserStatus(targetUid, STATUS_REJECTED)
              }

              event.stopPropagation()
            } else {
              const clickedItemStatus = Number.parseInt(userItem.dataset.status)
              if (clickedItemStatus === STATUS_APPROVED) {
                selectUser(userItem)
              } else {
                alert(
                  "Este usuario no está aprobado para chatear. Puedes usar los botones flotantes para aprobarlo o rechazarlo.",
                )
              }
            }
          })

          userListDiv.appendChild(userItem)
        })

        hideLoading()
      },
      (error) => {
        console.error("Error al cargar usuarios:", error)
        hideLoading()
      },
    )
}

// Función para actualizar estado de usuario
async function updateUserStatus(uid, newStatus) {
  if (!auth.currentUser || !currentAdminUID) {
    alert("Debes iniciar sesión como administrador para realizar esta acción.")
    return
  }

  showLoading("Actualizando estado del usuario...")

  try {
    await db.collection("usersApproval").doc(uid).update({
      status: newStatus,
    })
    alert("Estado del usuario actualizado exitosamente.")
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    alert("Error al actualizar estado: " + error.message)
  } finally {
    hideLoading()
  }
}

// Función para seleccionar usuario
function selectUser(userItemElement) {
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }

  document.querySelectorAll(".user-item").forEach((item) => {
    item.classList.remove("active")
  })

  userItemElement.classList.add("active")

  selectedUser = {
    uid: userItemElement.dataset.uid,
    email: userItemElement.dataset.email,
    name: userItemElement.dataset.name,
  }

  chatHeaderTitle.textContent = `Chat con ${selectedUser.name || selectedUser.email}`
  initialChatPrompt.style.display = "none"
  chatMessagesDiv.style.display = "flex"
  chatInputContainer.style.display = "flex"
  closeChatButton.style.display = "inline-block"
  chatMessagesDiv.innerHTML = ""

  showLoading("Cargando mensajes del chat...")

  const chatRoomId = getChatRoomId(selectedUser.uid, currentAdminUID)
  const chatMessagesRef = db.collection("privateChats").doc(chatRoomId).collection("messages")

  unsubscribeMessages = chatMessagesRef.orderBy("timestamp", "asc").onSnapshot(
    (snapshot) => {
      chatMessagesDiv.innerHTML = ""

      if (snapshot.empty) {
        chatMessagesDiv.innerHTML = '<div class="no-chat-selected">No hay mensajes aún en esta conversación.</div>'
      } else {
        snapshot.docs.forEach((doc) => {
          const message = doc.data()
          const isSentByMe = message.senderId === currentAdminUID
          const senderName =
            message.senderType === "admin"
              ? isSentByMe
                ? "Tú (Admin)"
                : `Admin (${adminNamesMap[message.senderId] || "Desconocido"})`
              : selectedUser.name || selectedUser.email

          const messageBubble = document.createElement("div")
          messageBubble.className = `message-bubble ${isSentByMe ? "sent" : "received"}`
          messageBubble.innerHTML = `
                        <div class="message-sender">${senderName}</div>
                        <div class="message-text">${message.text}</div>
                        <div class="message-timestamp">${formatTimestamp(message.timestamp)}</div>
                    `

          chatMessagesDiv.appendChild(messageBubble)
        })
      }

      chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight
      hideLoading()
    },
    (error) => {
      console.error("Error al obtener mensajes:", error)
      hideLoading()
    },
  )
}

// Función para enviar mensaje
async function sendMessage() {
  if (!selectedUser || messageInput.value.trim() === "") {
    return
  }

  if (!auth.currentUser || !currentAdminUID) {
    alert("No hay una sesión de administrador activa. Por favor, inicia sesión.")
    return
  }

  try {
    const userDoc = await db.collection("usersApproval").doc(selectedUser.uid).get()
    if (!userDoc.exists || userDoc.data().status !== STATUS_APPROVED) {
      alert("No se puede enviar mensajes a este usuario. Su cuenta no está aprobada.")
      return
    }

    const chatRoomId = getChatRoomId(selectedUser.uid, currentAdminUID)

    await db.collection("privateChats").doc(chatRoomId).collection("messages").add({
      text: messageInput.value.trim(),
      senderId: currentAdminUID,
      senderType: "admin",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      recipientId: selectedUser.uid,
    })

    messageInput.value = ""
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    alert("Error al enviar mensaje: " + error.message)
  }
}

// Event listeners
closeChatButton.addEventListener("click", () => {
  resetChatPanel()
})

sendMessageButton.addEventListener("click", sendMessage)

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault()
    sendMessage()
  }
})
