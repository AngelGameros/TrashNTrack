import { getEmpresas, getUbicaciones } from "../DataConnection/Gets.js"
import { postEmpresas, postUbicacion } from "../DataConnection/Post.js"

const inputNombre = document.getElementById("inputNombre")
const selectUbicacion = document.getElementById("selectUbicacion")
const empresasContainer = document.getElementById("empresasContainer")
const createButton = document.getElementById("createEmpresaBtn")

let listaEmpresas = []
let listaUbicaciones = []

// Modal para crear nueva empresa
const createModal = document.createElement("div")
createModal.id = "createEmpresaModal"
createModal.className = "empresa-modal"
createModal.innerHTML = `
  <div class="modal-content">
    <div class="modal-header">
      <h2>Crear Nueva Empresa</h2>
      <span class="close-button-create">&times;</span>
    </div>
    <div class="modal-body">
      <!-- Pestañas para alternar entre formularios -->
      <div class="tabs">
        <button type="button" class="tab-button active" data-tab="empresa">
          <i class="fas fa-building"></i> Nueva Empresa
        </button>
        <button type="button" class="tab-button" data-tab="ubicacion">
          <i class="fas fa-map-marker-alt"></i> Nueva Ubicación
        </button>
      </div>

      <!-- Formulario para crear empresa -->
      <div id="empresaTab" class="tab-content active">
        <form id="createEmpresaForm">
          <div class="form-group">
            <label for="nombreEmpresa">Nombre de la Empresa:</label>
            <input type="text" id="nombreEmpresa" name="nombre" required placeholder="Ingresa el nombre de la empresa">
            <span class="error-message" id="nombreEmpresaError"></span>
          </div>
          
          <div class="form-group">
            <label for="rfcEmpresa">RFC:</label>
            <input type="text" id="rfcEmpresa" name="rfc" required maxlength="13" placeholder="Ej: ABC123456789">
            <span class="error-message" id="rfcEmpresaError"></span>
          </div>
          
          <div class="form-group">
            <label for="ubicacionEmpresa">Ubicación:</label>
            <select id="ubicacionEmpresa" name="idUbicacion" required>
              <option value="">Selecciona una ubicación</option>
            </select>
            <span class="error-message" id="ubicacionEmpresaError"></span>
            <small class="form-help">¿No encuentras la ubicación? <a href="#" id="switchToUbicacion">Crear nueva ubicación</a></small>
          </div>
          
          <div class="form-buttons">
            <button type="button" id="cancelarEmpresaBtn">Cancelar</button>
            <button type="submit" id="crearEmpresaBtn">Crear Empresa</button>
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

const closeCreateModal = createModal.querySelector(".close-button-create")
const empresaForm = document.getElementById("createEmpresaForm")
const ubicacionForm = document.getElementById("createUbicacionForm")

// Event listeners para modales
closeCreateModal.addEventListener("click", () => {
  closeCreateModalHandler()
})

document.getElementById("cancelarEmpresaBtn").addEventListener("click", () => {
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
  const ubicacionSelect = document.getElementById("ubicacionEmpresa")
  ubicacionSelect.innerHTML = '<option value="">Selecciona una ubicación</option>'

  listaUbicaciones.forEach((ubicacion) => {
    const option = document.createElement("option")
    option.value = ubicacion.idUbicacion
    option.textContent = ubicacion.direccion
    ubicacionSelect.appendChild(option)
  })

  // Limpiar formularios y mensajes
  empresaForm.reset()
  ubicacionForm.reset()
  clearMessages()
  switchTab("empresa") // Empezar en la pestaña de empresa

  createModal.style.display = "block"
  document.body.style.overflow = "hidden"
}

function closeCreateModalHandler() {
  createModal.style.display = "none"
  document.body.style.overflow = "auto"
  empresaForm.reset()
  ubicacionForm.reset()
  clearMessages()
}

function clearMessages() {
  document.getElementById("loadingMessage").style.display = "none"
  document.getElementById("successMessage").style.display = "none"
  document.getElementById("errorMessage").style.display = "none"

  // Limpiar errores de validación - Empresa
  document.getElementById("nombreEmpresaError").textContent = ""
  document.getElementById("rfcEmpresaError").textContent = ""
  document.getElementById("ubicacionEmpresaError").textContent = ""

  // Limpiar errores de validación - Ubicación
  document.getElementById("direccionUbicacionError").textContent = ""
  document.getElementById("latitudUbicacionError").textContent = ""
  document.getElementById("longitudUbicacionError").textContent = ""
}

// ========== Validaciones ==========
function validateEmpresaForm(formData) {
  let isValid = true

  // Validar nombre
  if (!formData.nombre.trim()) {
    document.getElementById("nombreEmpresaError").textContent = "El nombre es requerido"
    isValid = false
  } else if (formData.nombre.trim().length < 2) {
    document.getElementById("nombreEmpresaError").textContent = "El nombre debe tener al menos 2 caracteres"
    isValid = false
  } else {
    document.getElementById("nombreEmpresaError").textContent = ""
  }

  // Validar RFC
  const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/
  if (!formData.rfc.trim()) {
    document.getElementById("rfcEmpresaError").textContent = "El RFC es requerido"
    isValid = false
  } else if (!rfcPattern.test(formData.rfc.toUpperCase())) {
    document.getElementById("rfcEmpresaError").textContent = "El RFC no tiene un formato válido"
    isValid = false
  } else {
    // Verificar que el RFC no esté duplicado
    const rfcExists = listaEmpresas.some((empresa) => empresa.rfc.toLowerCase() === formData.rfc.toLowerCase())
    if (rfcExists) {
      document.getElementById("rfcEmpresaError").textContent = "Este RFC ya está registrado"
      isValid = false
    } else {
      document.getElementById("rfcEmpresaError").textContent = ""
    }
  }

  // Validar ubicación
  if (!formData.idUbicacion) {
    document.getElementById("ubicacionEmpresaError").textContent = "Debe seleccionar una ubicación"
    isValid = false
  } else {
    document.getElementById("ubicacionEmpresaError").textContent = ""
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
empresaForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = new FormData(empresaForm)
  const empresaData = {
    nombre: formData.get("nombre").trim(),
    rfc: formData.get("rfc").trim().toUpperCase(),
    idUbicacion: Number.parseInt(formData.get("idUbicacion")),
  }

  console.log("Datos de empresa a enviar:", empresaData)

  if (!validateEmpresaForm(empresaData)) {
    return
  }

  clearMessages()
  document.getElementById("loadingMessage").style.display = "block"
  document.getElementById("loadingText").textContent = "Creando empresa..."

  try {
    const result = await postEmpresas(empresaData)

    document.getElementById("loadingMessage").style.display = "none"

    if (result && result.status === 0) {
      document.getElementById("successMessage").style.display = "block"
      document.getElementById("successText").textContent = "¡Empresa creada exitosamente!"

      await recargarEmpresas()

      setTimeout(() => {
        closeCreateModalHandler()
      }, 2000)
    } else {
      document.getElementById("errorMessage").style.display = "block"
      document.getElementById("errorText").textContent = result.message || "Error desconocido al crear la empresa"
    }
  } catch (error) {
    document.getElementById("loadingMessage").style.display = "none"
    document.getElementById("errorMessage").style.display = "block"
    document.getElementById("errorText").textContent = error.message || "Error al conectar con el servidor"
    console.error("Error al crear empresa:", error)
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
        "¡Ubicación creada exitosamente! Ahora puedes usarla para crear empresas."

      // Recargar ubicaciones y actualizar el select
      await recargarUbicaciones()

      // Cambiar a la pestaña de empresa después de 2 segundos
      setTimeout(() => {
        switchTab("empresa")
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
async function recargarEmpresas() {
  try {
    const empresasResponse = await getEmpresas()
    if (empresasResponse.status === 0 && Array.isArray(empresasResponse.data)) {
      listaEmpresas = empresasResponse.data
      filtrarEmpresas()
    }
  } catch (error) {
    console.error("Error al recargar empresas:", error)
  }
}

async function recargarUbicaciones() {
  try {
    const ubicacionesResponse = await getUbicaciones()
    if (Array.isArray(ubicacionesResponse.ubicaciones)) {
      listaUbicaciones = ubicacionesResponse.ubicaciones
      llenarSelectUbicaciones()

      // Actualizar también el select del modal
      const ubicacionSelect = document.getElementById("ubicacionEmpresa")
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
    const empresasResponse = await getEmpresas()

    if (
      Array.isArray(ubicacionesResponse.ubicaciones) &&
      empresasResponse.status === 0 &&
      Array.isArray(empresasResponse.data)
    ) {
      listaEmpresas = empresasResponse.data
      // IDs únicos de ubicaciones usadas por las empresas
      const ubicacionesEmpresasIds = [...new Set(listaEmpresas.map((e) => e.idUbicacion))]
      // Filtrar las ubicaciones para solo las que usan las empresas
      listaUbicaciones = ubicacionesResponse.ubicaciones.filter((u) => ubicacionesEmpresasIds.includes(u.idUbicacion))

      llenarSelectUbicaciones()
      filtrarEmpresas() // Mostrar todo inicialmente
    } else {
      empresasContainer.textContent = "No se pudieron cargar las empresas o ubicaciones."
    }
  } catch (err) {
    empresasContainer.textContent = "Error al cargar datos."
    console.error(err)
  }
})

// ========== Filtros automáticos ==========
if (inputNombre) {
  inputNombre.addEventListener("input", filtrarEmpresas)
}
if (selectUbicacion) {
  selectUbicacion.addEventListener("change", filtrarEmpresas)
}

// ========== Llenar Select ==========
function llenarSelectUbicaciones() {
  selectUbicacion.innerHTML = `<option value="">Todas las ubicaciones</option>`
  listaUbicaciones.forEach((ubicacion) => {
    const option = document.createElement("option")
    option.value = ubicacion.idUbicacion
    option.textContent = ubicacion.direccion
    selectUbicacion.appendChild(option)
  })
}

// ========== Filtrar Empresas ==========
function filtrarEmpresas() {
  const nombreFiltro = inputNombre.value.trim().toLowerCase()
  const ubicacionFiltro = selectUbicacion.value

  const empresasFiltradas = listaEmpresas.filter((empresa) => {
    const coincideNombre = empresa.nombre.toLowerCase().includes(nombreFiltro)
    const coincideUbicacion = ubicacionFiltro === "" || empresa.idUbicacion === Number.parseInt(ubicacionFiltro)
    return coincideNombre && coincideUbicacion
  })

  mostrarEmpresas(empresasFiltradas)
}

// ========== Mostrar Empresas ==========
function mostrarEmpresas(empresas) {
  if (empresas.length === 0) {
    empresasContainer.innerHTML = "<p>No hay empresas que coincidan con los filtros.</p>"
    return
  }

  empresasContainer.innerHTML = ""
  empresas.forEach((empresa) => {
    const div = document.createElement("div")
    div.classList.add("empresa-card")
    const direccion = obtenerDireccion(empresa.idUbicacion)

    div.innerHTML = `
      <h3><i class="fas fa-building"></i> ${empresa.nombre}</h3>
      <p><strong><i class="fas fa-id-card"></i> RFC:</strong> ${empresa.rfc}</p>
      <p><strong><i class="fas fa-calendar"></i> Fecha Registro:</strong> ${empresa.fechaRegistro}</p>
      <p><strong><i class="fas fa-map-marker-alt"></i> Ubicación:</strong> ${direccion}</p>
    `

    empresasContainer.appendChild(div)
  })
}

// ========== Obtener Dirección desde ID ==========
function obtenerDireccion(idUbicacion) {
  const ubicacion = listaUbicaciones.find((u) => u.idUbicacion === idUbicacion)
  return ubicacion ? ubicacion.direccion : `Ubicación ID ${idUbicacion}`
}
