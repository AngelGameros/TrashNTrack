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

// Funciones de utilidad
function showLoading(message = "Cargando...") {
  loadingOverlay.querySelector("p").textContent = message
  loadingOverlay.style.display = "flex"
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