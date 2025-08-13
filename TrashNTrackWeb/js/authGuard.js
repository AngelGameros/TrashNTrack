// AuthGuard mejorado que espera a que Firebase esté disponible
;(() => {
  // Import Firebase
  const firebase = window.firebase

  // Función para verificar si Firebase está disponible
  function waitForFirebase(callback) {
    if (typeof firebase !== "undefined") {
      callback()
    } else {
      // Esperar 100ms y volver a intentar
      setTimeout(() => waitForFirebase(callback), 100)
    }
  }

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyAFke4dQQfIPsBFkshWvCB9jVuYuilDWuA",
    authDomain: "trashandtrack-928dc.firebaseapp.com",
    projectId: "trashandtrack-928dc",
    storageBucket: "trashandtrack-928dc.firebasestorage.app",
    messagingSenderId: "412401788328",
    appId: "1:412401788328:web:3e8574a349f16fe181299d",
  }

  // Inicializar cuando Firebase esté disponible
  waitForFirebase(() => {
    // Verificar si Firebase ya está inicializado
    let app, auth, db

    try {
      app = firebase.app() // Obtener la app existente
      auth = firebase.auth()
      db = firebase.firestore()
    } catch (error) {
      // Si no existe, inicializar
      app = firebase.initializeApp(firebaseConfig)
      auth = firebase.auth()
      db = firebase.firestore()
    }

    // Páginas que requieren autenticación de admin
    const protectedPages = ["dashboard.html", "chat.html", "perfil.html", "camiones.html"]
    const currentPage = window.location.pathname.split("/").pop()

    if (protectedPages.includes(currentPage)) {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDoc = await db.collection("usersApproval").doc(user.uid).get()
            if (!userDoc.exists || userDoc.data().accountType !== "admin") {
              window.location.href = "login.html"
            }
          } catch (error) {
            console.error("Error al verificar usuario:", error)
            window.location.href = "login.html"
          }
        } else {
          window.location.href = "login.html"
        }
      })
    }


    // En la página de login, redirigir si ya está autenticado
    if (currentPage === "login.html") {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDoc = await db.collection("usersApproval").doc(user.uid).get()
            if (userDoc.exists && userDoc.data().accountType === "admin") {
              window.location.href = "dashboard.html"
            }
          } catch (error) {
            console.error("Error al verificar usuario:", error)
          }
        }
      })
    }
  })
})()
