
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFke4dQQfIPsBFkshWvCB9jVuYuilDWuA",
  authDomain: "trashandtrack-928dc.firebaseapp.com",
  projectId: "trashandtrack-928dc",
  storageBucket: "trashandtrack-928dc.firebasestorage.app",
  messagingSenderId: "412401788328",
  appId: "1:412401788328:web:3e8574a349f16fe181299d",
}

// Verificar si Firebase ya está inicializado
let app, auth, db
try {
  app = firebase.app() // Intentar obtener la app existente
  auth = firebase.auth()
  db = firebase.firestore()
} catch (error) {
  // Si no existe, inicializar
  app = firebase.initializeApp(firebaseConfig)
  auth = firebase.auth()
  db = firebase.firestore()
}

// Referencias DOM
const adminEmailInput = document.getElementById("adminEmail")
const adminPasswordInput = document.getElementById("adminPassword")
const loginButton = document.getElementById("loginButton")
const loginError = document.getElementById("loginError")
const loadingOverlay = document.getElementById("loadingOverlay")

// Funciones de utilidad
function showLoading(message = "Cargando...") {
  loadingOverlay.querySelector("p").textContent = message
  loadingOverlay.style.display = "flex"
}

function hideLoading() {
  loadingOverlay.style.display = "none"
}

// ELIMINAR CUALQUIER VERIFICACIÓN AUTOMÁTICA DE AUTENTICACIÓN
// NO queremos redirecciones automáticas en el login

// Evento de login - SOLO cuando el usuario hace clic
loginButton.addEventListener("click", async () => {
  const email = adminEmailInput.value.trim()
  const password = adminPasswordInput.value.trim()

  if (!email || !password) {
    loginError.textContent = "Por favor, completa todos los campos."
    return
  }

  showLoading("Iniciando sesión...")
  loginError.textContent = ""

  try {
    // Autenticar con Firebase
    const userCredential = await auth.signInWithEmailAndPassword(email, password)
    const user = userCredential.user

    // Verificar si es administrador
    const userDoc = await db.collection("usersApproval").doc(user.uid).get()

    if (!userDoc.exists || userDoc.data().accountType !== "admin") {
      await auth.signOut()
      loginError.textContent = "Acceso denegado: Su cuenta no está marcada como administrador."
      hideLoading()
      return
    }

    // Guardar información del admin en localStorage
    localStorage.setItem("currentAdminUID", user.uid)
    localStorage.setItem("adminEmail", user.email)

    // Mostrar mensaje de éxito
    loginError.style.color = "green"
    loginError.textContent = "¡Login exitoso! Redirigiendo..."

    // Esperar un momento antes de redirigir para que el usuario vea el mensaje
    setTimeout(() => {
      // Redirigir a TU dashboard (cambia esta URL por la tuya)
      window.location.href = "Dashboard.html" // <-- CAMBIA ESTO POR TU DASHBOARD
    }, 1500)
  } catch (error) {
    console.error("Error de inicio de sesión:", error)
    let errorMessage = "Error de inicio de sesión."

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "Usuario no encontrado."
        break
      case "auth/wrong-password":
        errorMessage = "Contraseña incorrecta."
        break
      case "auth/invalid-email":
        errorMessage = "Correo electrónico inválido."
        break
      case "auth/too-many-requests":
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde."
        break
      default:
        errorMessage = error.message
    }

    loginError.style.color = "red"
    loginError.textContent = errorMessage
  } finally {
    hideLoading()
  }
})

// Permitir login con Enter
adminPasswordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    loginButton.click()
  }
})

adminEmailInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    adminPasswordInput.focus()
  }
})
