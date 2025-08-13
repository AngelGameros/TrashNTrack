import { getPlantas, getUbicaciones } from "../DataConnection/Gets.js"
import { postPlantas, postUbicacion } from "../DataConnection/Post.js"

const inputNombre = document.getElementById("inputNombrePlanta")
const selectUbicacion = document.getElementById("selectUbicacionPlanta")
const plantasContainer = document.getElementById("plantasContainer")
const createButton = document.getElementById("createPlantaBtn")

let listaPlantas = []
let listaUbicaciones = []

// Modal para ver detalles
const modal = document.createElement("div")
modal.id = "plantaModal"
modal.className = "planta-modal"
modal.innerHTML = `
  <div class="modal-content">
    <span class="close-button">&times;</span>
    <div id="modalBody"></div>
  </div>
`
document.body.appendChild(modal)

// Modal para crear nueva planta
const createModal = document.createElement("div")
createModal.id = "createPlantaModal"
createModal.className = "planta-modal"
createModal.innerHTML = `
  <div class="modal-content">
    <div class="modal-header">
      <h2>Crear Nueva Planta</h2>
      <span class="close-button-create">&times;</span>
    </div>
    <div class="modal-body">
      <!-- Pestañas para alternar entre formularios -->
      <div class="tabs">
        <button type="button" class="tab-button active" data-tab="planta">
          <i class="fas fa-industry"></i> Nueva Planta
        </button>
        <button type="button" class="tab-button" data-tab="ubicacion">
          <i class="fas fa-map-marker-alt"></i> Nueva Ubicación
        </button>
      </div>

      <!-- Formulario para crear planta -->
      <div id="plantaTab" class="tab-content active">
        <form id="createPlantaForm">
          <div class="form-group">
            <label for="nombrePlanta">Nombre de la Planta:</label>
            <input type="text" id="nombrePlanta" name="nombre" required placeholder="Ingresa el nombre de la planta">
            <span class="error-message" id="nombrePlantaError"></span>
          </div>
          
          <div class="form-group">
            <label for="ubicacionPlanta">Ubicación:</label>
            <select id="ubicacionPlanta" name="idUbicacion" required>
              <option value="">Selecciona una ubicación</option>
            </select>
            <span class="error-message" id="ubicacionPlantaError"></span>
            <small class="form-help">¿No encuentras la ubicación? <a href="#" id="switchToUbicacion">Crear nueva ubicación</a></small>
          </div>
          
          <div class="form-buttons">
            <button type="button" id="cancelarPlantaBtn">Cancelar</button>
            <button type="submit" id="crearPlantaBtn">Crear Planta</button>
          </div>
        </form>
      </div>

      <!-- Formulario para crear ubicación -->
      <div id="ubicacionTab" class="tab-content">
        <form id="createUbicacionForm">
          <div class="form-group">
            <label for="direccionUbicacion">Dirección:</label>
            <input type="text" id="direccionUbicacion" name="direccion" required placeholder="Ingresa la dirección completa">
            <span class="error-message" id="direccionUbicacionError"></span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="latitudUbicacion">Latitud:</label>
              <input type="number" id="latitudUbicacion" name="latitud" step="any" required placeholder="Ej: 32.50112300">
              <span class="error-message" id="latitudUbicacionError"></span>
            </div>
            
            <div class="form-group">
              <label for="longitudUbicacion">Longitud:</label>
              <input type="number" id="longitudUbicacion" name="longitud" step="any" required placeholder="Ej: -117.00345600">
              <span class="error-message" id="longitudUbicacionError"></span>
            </div>
          </div>
          
          <div class="form-buttons">
            <button type="button" id="cancelarUbicacionBtn">Cancelar</button>
            <button type="submit" id="crearUbicacionBtn">Crear Ubicación</button>
          </div>
        </form>
      </div>
      
      <!-- Mensajes de estado -->
      <div id="loadingMessage" class="message-container" style="display: none;">
        <p><i class="fas fa-spinner fa-spin"></i> <span id="loadingText">Procesando...</span></p>
      </div>
      
      <div id="successMessage" class="message-container" style="display: none;">
        <p><i class="fas fa-check-circle"></i> <span id="successText">¡Operación exitosa!</span></p>
      </div>
      
      <div id="errorMessage" class="message-container" style="display: none;">
        <p><i class="fas fa-exclamation-triangle"></i> <span id="errorText"></span></p>
      </div>
    </div>
  </div>
`
document.body.appendChild(createModal)

const modalBody = document.getElementById("modalBody")
const closeModal = modal.querySelector(".close-button")
const closeCreateModal = createModal.querySelector(".close-button-create")
const plantaForm = document.getElementById("createPlantaForm")
const ubicacionForm = document.getElementById("createUbicacionForm")

// Event listeners para modales
closeModal.addEventListener("click", () => {
  modal.style.display = "none"
})

closeCreateModal.addEventListener("click", () => {
  closeCreateModalHandler()
})

document.getElementById("cancelarPlantaBtn").addEventListener("click", () => {
  closeCreateModalHandler()
})

document.getElementById("cancelarUbicacionBtn").addEventListener("click", () => {
  closeCreateModalHandler()
})

createButton.addEventListener("click", () => {
  openCreateModal()
})

// Manejo de pestañas
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    const tabName = e.target.getAttribute("data-tab")
    switchTab(tabName)
  })
})

// Link para cambiar a pestaña de ubicación
document.getElementById("switchToUbicacion").addEventListener("click", (e) => {
  e.preventDefault()
  switchTab("ubicacion")
})

// Cerrar modal al hacer clic fuera
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none"
  }
  if (event.target === createModal) {
    closeCreateModalHandler()
  }
})

// ========== Funciones de Pestañas ==========
function switchTab(tabName) {
  // Actualizar botones de pestañas
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  // Actualizar contenido de pestañas
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(`${tabName}Tab`).classList.add("active")

  // Limpiar mensajes
  clearMessages()
}

// ========== Funciones del Modal de Creación ==========
function openCreateModal() {
  // Llenar el select de ubicaciones
  const ubicacionSelect = document.getElementById("ubicacionPlanta")
  ubicacionSelect.innerHTML = '<option value="">Selecciona una ubicación</option>'

  listaUbicaciones.forEach((ubicacion) => {
    const option = document.createElement("option")
    option.value = ubicacion.idUbicacion
    option.textContent = ubicacion.direccion
    ubicacionSelect.appendChild(option)
  })

  // Limpiar formularios y mensajes
  plantaForm.reset()
  ubicacionForm.reset()
  clearMessages()
  switchTab("planta") // Empezar en la pestaña de planta

  createModal.style.display = "block"
  document.body.style.overflow = "hidden"
}

function closeCreateModalHandler() {
  createModal.style.display = "none"
  document.body.style.overflow = "auto"
  plantaForm.reset()
  ubicacionForm.reset()
  clearMessages()
}

function clearMessages() {
  document.getElementById("loadingMessage").style.display = "none"
  document.getElementById("successMessage").style.display = "none"
  document.getElementById("errorMessage").style.display = "none"

  // Limpiar errores de validación - Planta
  document.getElementById("nombrePlantaError").textContent = ""
  document.getElementById("ubicacionPlantaError").textContent = ""

  // Limpiar errores de validación - Ubicación
  document.getElementById("direccionUbicacionError").textContent = ""
  document.getElementById("latitudUbicacionError").textContent = ""
  document.getElementById("longitudUbicacionError").textContent = ""
}

// ========== Validaciones ==========
function validatePlantaForm(formData) {
  let isValid = true

  // Validar nombre
  if (!formData.nombre.trim()) {
    document.getElementById("nombrePlantaError").textContent = "El nombre es requerido"
    isValid = false
  } else if (formData.nombre.trim().length < 2) {
    document.getElementById("nombrePlantaError").textContent = "El nombre debe tener al menos 2 caracteres"
    isValid = false
  } else {
    document.getElementById("nombrePlantaError").textContent = ""
  }

  // Validar ubicación
  if (!formData.idUbicacion) {
    document.getElementById("ubicacionPlantaError").textContent = "Debe seleccionar una ubicación"
    isValid = false
  } else {
    document.getElementById("ubicacionPlantaError").textContent = ""
  }

  return isValid
}

function validateUbicacionForm(formData) {
  let isValid = true

  // Validar dirección
  if (!formData.direccion.trim()) {
    document.getElementById("direccionUbicacionError").textContent = "La dirección es requerida"
    isValid = false
  } else if (formData.direccion.trim().length < 5) {
    document.getElementById("direccionUbicacionError").textContent = "La dirección debe tener al menos 5 caracteres"
    isValid = false
  } else {
    document.getElementById("direccionUbicacionError").textContent = ""
  }

  // Validar latitud
  if (!formData.latitud) {
    document.getElementById("latitudUbicacionError").textContent = "La latitud es requerida"
    isValid = false
  } else if (isNaN(formData.latitud) || formData.latitud < -90 || formData.latitud > 90) {
    document.getElementById("latitudUbicacionError").textContent = "La latitud debe estar entre -90 y 90"
    isValid = false
  } else {
    document.getElementById("latitudUbicacionError").textContent = ""
  }

  // Validar longitud
  if (!formData.longitud) {
    document.getElementById("longitudUbicacionError").textContent = "La longitud es requerida"
    isValid = false
  } else if (isNaN(formData.longitud) || formData.longitud < -180 || formData.longitud > 180) {
    document.getElementById("longitudUbicacionError").textContent = "La longitud debe estar entre -180 y 180"
    isValid = false
  } else {
    document.getElementById("longitudUbicacionError").textContent = ""
  }

  return isValid
}

// ========== Manejo del Envío de Formularios ==========
plantaForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = new FormData(plantaForm)
  const plantaData = {
    nombre: formData.get("nombre").trim(),
    idUbicacion: Number.parseInt(formData.get("idUbicacion")),
  }

  if (!validatePlantaForm(plantaData)) {
    return
  }

  clearMessages()
  document.getElementById("loadingMessage").style.display = "block"
  document.getElementById("loadingText").textContent = "Creando planta..."

  try {
    const result = await postPlantas(plantaData)

    document.getElementById("loadingMessage").style.display = "none"

    if (result && result.status === 0) {
      document.getElementById("successMessage").style.display = "block"
      document.getElementById("successText").textContent = "¡Planta creada exitosamente!"

      await recargarPlantas()

      setTimeout(() => {
        closeCreateModalHandler()
      }, 2000)
    } else {
      document.getElementById("errorMessage").style.display = "block"
      document.getElementById("errorText").textContent = result.message || "Error desconocido al crear la planta"
    }
  } catch (error) {
    document.getElementById("loadingMessage").style.display = "none"
    document.getElementById("errorMessage").style.display = "block"
    document.getElementById("errorText").textContent = error.message || "Error al conectar con el servidor"
    console.error("Error al crear planta:", error)
  }
})

ubicacionForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = new FormData(ubicacionForm)
  const ubicacionData = {
    direccion: formData.get("direccion").trim(),
    latitud: Number.parseFloat(formData.get("latitud")),
    longitud: Number.parseFloat(formData.get("longitud")),
  }

  if (!validateUbicacionForm(ubicacionData)) {
    return
  }

  clearMessages()
  document.getElementById("loadingMessage").style.display = "block"
  document.getElementById("loadingText").textContent = "Creando ubicación..."

  try {
    const result = await postUbicacion(ubicacionData)

    document.getElementById("loadingMessage").style.display = "none"

    if (result && result.status === 0) {
      document.getElementById("successMessage").style.display = "block"
      document.getElementById("successText").textContent =
        "¡Ubicación creada exitosamente! Ahora puedes usarla para crear plantas."

      // Recargar ubicaciones y actualizar el select
      await recargarUbicaciones()

      // Cambiar a la pestaña de planta después de 2 segundos
      setTimeout(() => {
        switchTab("planta")
      }, 2000)
    } else {
      document.getElementById("errorMessage").style.display = "block"
      document.getElementById("errorText").textContent = result.message || "Error desconocido al crear la ubicación"
    }
  } catch (error) {
    document.getElementById("loadingMessage").style.display = "none"
    document.getElementById("errorMessage").style.display = "block"
    document.getElementById("errorText").textContent = error.message || "Error al conectar con el servidor"
    console.error("Error al crear ubicación:", error)
  }
})

// ========== Recargar Datos ==========
async function recargarPlantas() {
  try {
    const plantasResponse = await getPlantas()
    if (plantasResponse.status === 0 && Array.isArray(plantasResponse.data)) {
      listaPlantas = plantasResponse.data
      filtrarPlantas()
    }
  } catch (error) {
    console.error("Error al recargar plantas:", error)
  }
}

async function recargarUbicaciones() {
  try {
    const ubicacionesResponse = await getUbicaciones()
    if (Array.isArray(ubicacionesResponse.ubicaciones)) {
      listaUbicaciones = ubicacionesResponse.ubicaciones
      llenarSelectUbicaciones()

      // Actualizar también el select del modal
      const ubicacionSelect = document.getElementById("ubicacionPlanta")
      ubicacionSelect.innerHTML = '<option value="">Selecciona una ubicación</option>'
      listaUbicaciones.forEach((ubicacion) => {
        const option = document.createElement("option")
        option.value = ubicacion.idUbicacion
        option.textContent = ubicacion.direccion
        ubicacionSelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error al recargar ubicaciones:", error)
  }
}

// ========== Cargar Datos Iniciales ==========
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const ubicacionesResponse = await getUbicaciones()
    if (Array.isArray(ubicacionesResponse.ubicaciones)) {
      listaUbicaciones = ubicacionesResponse.ubicaciones
    }

    const plantasResponse = await getPlantas()
    if (plantasResponse.status === 0 && Array.isArray(plantasResponse.data)) {
      listaPlantas = plantasResponse.data
      llenarSelectUbicaciones()
      filtrarPlantas()
    } else {
      plantasContainer.textContent = "No se pudieron cargar las plantas."
    }
  } catch (err) {
    plantasContainer.textContent = "Error al cargar datos."
    console.error(err)
  }
})

// ========== Eventos de filtro instantáneo ==========
inputNombre.addEventListener("input", filtrarPlantas)
selectUbicacion.addEventListener("change", filtrarPlantas)

// ========== Llenar select con ubicaciones que tengan plantas ==========
function llenarSelectUbicaciones() {
  const idsUbicacionesConPlantas = new Set(listaPlantas.map((p) => p.idUbicacion))
  selectUbicacion.innerHTML = `<option value="">Todas las ubicaciones</option>`
  listaUbicaciones.forEach((ubicacion) => {
    if (idsUbicacionesConPlantas.has(ubicacion.idUbicacion)) {
      const option = document.createElement("option")
      option.value = ubicacion.idUbicacion
      option.textContent = ubicacion.direccion
      selectUbicacion.appendChild(option)
    }
  })
}

// ========== Filtrar plantas según filtros ==========
function filtrarPlantas() {
  const nombreFiltro = inputNombre.value.trim().toLowerCase()
  const ubicacionFiltro = selectUbicacion.value

  const plantasFiltradas = listaPlantas.filter((planta) => {
    const coincideNombre = planta.nombre.toLowerCase().includes(nombreFiltro)
    const coincideUbicacion = ubicacionFiltro === "" || planta.idUbicacion === Number.parseInt(ubicacionFiltro)
    return coincideNombre && coincideUbicacion
  })

  mostrarPlantas(plantasFiltradas)
}

// ========== Mostrar plantas ==========
function mostrarPlantas(plantas) {
  if (plantas.length === 0) {
    plantasContainer.innerHTML = "<p>No hay plantas registradas que coincidan con los filtros.</p>"
    return
  }

  plantasContainer.innerHTML = ""
  plantas.forEach((planta) => {
    const div = document.createElement("div")
    div.classList.add("planta-card")
    const direccion = obtenerDireccion(planta.idUbicacion)

    div.innerHTML = `
      <h3><i class="fas fa-industry"></i> ${planta.nombre}</h3>
      <p><strong><i class="fas fa-map-marker-alt"></i> Ubicación:</strong> ${direccion}</p>
      <button class="btn-detalles" data-id="${planta.id}">
        <i class="fas fa-eye"></i> Ver detalles
      </button>
    `

    plantasContainer.appendChild(div)
  })

  // Agregar evento a botones "Ver detalles"
  document.querySelectorAll(".btn-detalles").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idPlanta = e.target.getAttribute("data-id")
      const planta = listaPlantas.find((p) => p.id == idPlanta)
      mostrarDetallesPlanta(planta)
    })
  })
}

// ========== Mostrar detalles en modal ==========
function mostrarDetallesPlanta(planta) {
  const direccion = obtenerDireccion(planta.idUbicacion)
  modalBody.innerHTML = `
    <div class="modal-header">
      <h2><i class="fas fa-industry"></i> Detalles de la Planta</h2>
    </div>
    <div class="modal-body">
      <div class="detail-item">
        <strong><i class="fas fa-hashtag"></i> ID:</strong> ${planta.id}
      </div>
      <div class="detail-item">
        <strong><i class="fas fa-industry"></i> Nombre:</strong> ${planta.nombre}
      </div>
      <div class="detail-item">
        <strong><i class="fas fa-map-marker-alt"></i> Ubicación:</strong> ${direccion}
      </div>
    </div>
  `
  modal.style.display = "block"
}

// ========== Obtener dirección desde ID ==========
function obtenerDireccion(idUbicacion) {
  const ubicacion = listaUbicaciones.find((u) => u.idUbicacion === idUbicacion)
  return ubicacion ? ubicacion.direccion : `Ubicación ID ${idUbicacion}`
}
