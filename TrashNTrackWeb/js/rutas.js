// rutas.js
import { getRutas, getPlantas, getEmpresas, getUsuarios, getRutasDetalladas } from "../DataConnection/Gets.js" // Agregamos getRutasDetalladas
import { postRutas, postRutasEmpresas, postRutasPlantas } from "../DataConnection/Post.js"


// Global Variables
let map
let selectedRoute = null
let currentFilter = "all"
let markers = []
let routeLine = null
let allRoutes = []
let filteredRoutes = []
let loadingOverlay = null
let plantasList = []
let empresasList = []
let usuariosList = []
let selectedCompanies = []
let routeDetails = null // Nueva variable para almacenar los detalles de la ruta

// Initialize Map
function initializeMap() {
  console.log("Intentando inicializar el mapa...")
  const mapElement = document.getElementById("routeMap")
  if (mapElement) {
    console.log("Elemento #routeMap encontrado.")
    if (map) {
      map.remove()
      console.log("Mapa existente removido.")
    }
    map = L.map("routeMap").setView([29.5, -114.5], 6)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    console.log("Mapa inicializado correctamente.")
    map.invalidateSize()
    console.log("map.invalidateSize() llamado.")
  } else {
    console.error("Error: Elemento 'routeMap' no encontrado para inicializar el mapa.")
  }
}

// Helper to format date
function formatDate(isoString) {
  if (!isoString) return "N/A"
  const date = new Date(isoString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Render Route Cards
function renderRouteCards() {
  const routeListContent = document.getElementById("routeListContent")
  if (!routeListContent) {
    console.error("Element with ID 'routeListContent' not found.")
    return
  }
  routeListContent.innerHTML = ""

  if (filteredRoutes.length === 0) {
    routeListContent.innerHTML =
      "<p class='text-center text-gray-500'>No hay rutas disponibles con los filtros actuales.</p>"
    return
  }

  filteredRoutes.forEach((route) => {
    const routeCard = document.createElement("div")
    routeCard.className = "route-card"
    routeCard.dataset.routeId = route.id

    // Cambiar esta parte en renderRouteCards():
    const usuario =
      usuariosList && usuariosList.find
        ? usuariosList.find((u) => {
            // Probar diferentes campos de ID
            const userId = u.idUsuario || u.id || u.userId
            console.log("Comparando usuario:", userId, "con ruta:", route.idUsuarioAsignado)
            return userId === route.idUsuarioAsignado
          })
        : null

    console.log("Usuario encontrado:", usuario)
    console.log("Lista completa de usuarios:", usuariosList)

    const nombreUsuario = usuario
      ? `${usuario.nombre} ${usuario.primerApellido}${usuario.segundoApellido ? " " + usuario.segundoApellido : ""}`
      : `Usuario no encontrado`

    const statusClass = (route.estado || "desconocido").toLowerCase().replace(" ", "-")

    routeCard.innerHTML = `
      <div class="route-header">
        <h3>${route.nombre || "Ruta sin Nombre"}</h3>
        <span class="route-status status-${statusClass}">${route.estado || "Desconocido"}</span>
      </div>
      <div class="route-details">
        <p><i class="fas fa-info-circle"></i> ${route.descripcion || "Sin descripción"}</p>
        <p><i class="fas fa-calendar-alt"></i> Creada: ${formatDate(route.fechaCreacion)}</p>
        <p><i class="fas fa-user"></i> Asignado a: ${nombreUsuario}</p>
        <p><i class="fas fa-chart-line"></i> Progreso: ${route.progresoRuta || 0}%</p>
      </div>
      <div class="form-actions">
        <button class="btn btn-small btn-view" onclick="showRouteDetails(${route.id})">Ver en el mapa</button>
        
      </div>
    `
    routeListContent.appendChild(routeCard)
  })
}

// Nueva función para agregar marcadores usando los datos detallados de la ruta
function addMarkersToMapFromDetails() {
  console.log("=== INICIO addMarkersToMapFromDetails ===")

  // Limpiar marcadores y líneas existentes
  markers.forEach((marker) => map.removeLayer(marker))
  markers = []
  if (routeLine) {
    map.removeLayer(routeLine)
    routeLine = null
  }

  if (!routeDetails) {
    console.log("No hay detalles de ruta disponibles")
    map.setView([29.5, -114.5], 6)
    return
  }

  console.log("Procesando detalles de ruta:", routeDetails)
  const routeId = routeDetails.id_ruta || routeDetails.id || routeDetails.idRuta
  console.log("ID de la ruta que se está procesando:", routeId)
  console.log("coordenadas_inicio_json (raw):", routeDetails.coordenadas_inicio_json)
  console.log("coordenadas_ruta_json (raw):", routeDetails.coordenadas_ruta_json)

  const routePoints = []

  try {
    // 1. Agregar punto de inicio (planta)
    if (
      routeDetails.coordenadas_inicio_json &&
      routeDetails.coordenadas_inicio_json !== null &&
      routeDetails.coordenadas_inicio_json !== "null" &&
      routeDetails.coordenadas_inicio_json !== ""
    ) {
      console.log("Parseando coordenadas de inicio...")
      const coordenadasInicio = JSON.parse(routeDetails.coordenadas_inicio_json)
      console.log("Coordenadas de inicio parseadas:", coordenadasInicio)

      if (coordenadasInicio && Array.isArray(coordenadasInicio) && coordenadasInicio.length > 0) {
        const puntoInicio = coordenadasInicio[0].punto
        const plantLat = Number.parseFloat(puntoInicio.latitud)
        const plantLng = Number.parseFloat(puntoInicio.longitud)

        console.log("Coordenadas de planta:", { lat: plantLat, lng: plantLng })

        if (!isNaN(plantLat) && !isNaN(plantLng)) {
          const plantMarker = L.marker([plantLat, plantLng], {
            icon: L.icon({
              iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          }).addTo(map)

          plantMarker.bindPopup(`<b>${puntoInicio.nombre}</b><br>Planta de origen<br>Ruta ID: ${routeId}`).openPopup()
          markers.push(plantMarker)
          routePoints.push([plantLat, plantLng])
          console.log("✓ Marcador de planta agregado:", puntoInicio.nombre)
        }
      }
    } else {
      console.warn("coordenadas_inicio_json está vacío, null o undefined")
    }

    // 2. Agregar puntos de empresas
    if (
      routeDetails.coordenadas_ruta_json &&
      routeDetails.coordenadas_ruta_json !== null &&
      routeDetails.coordenadas_ruta_json !== "null" &&
      routeDetails.coordenadas_ruta_json !== ""
    ) {
      console.log("Parseando coordenadas de ruta...")
      const coordenadasRuta = JSON.parse(routeDetails.coordenadas_ruta_json)
      console.log("Coordenadas de ruta parseadas:", coordenadasRuta)

      if (coordenadasRuta && Array.isArray(coordenadasRuta) && coordenadasRuta.length > 0) {
        // Ordenar por orden si existe
        coordenadasRuta.sort((a, b) => (a.punto.orden || 0) - (b.punto.orden || 0))

        coordenadasRuta.forEach((coordenada, index) => {
          const punto = coordenada.punto
          const companyLat = Number.parseFloat(punto.latitud)
          const companyLng = Number.parseFloat(punto.longitud)

          console.log(`Empresa ${index + 1}:`, {
            nombre: punto.nombre,
            lat: companyLat,
            lng: companyLng,
            orden: punto.orden,
          })

          if (!isNaN(companyLat) && !isNaN(companyLng)) {
            const companyMarker = L.marker([companyLat, companyLng], {
              icon: L.icon({
                iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              }),
            }).addTo(map)

            companyMarker.bindPopup(
              `<b>${punto.nombre}</b><br>Empresa destino<br>Orden: ${punto.orden || index + 1}<br>Ruta ID: ${routeId}`,
            )
            markers.push(companyMarker)
            routePoints.push([companyLat, companyLng])
            console.log("✓ Marcador de empresa agregado:", punto.nombre)
          }
        })
      }
    } else {
      console.warn("coordenadas_ruta_json está vacío, null o undefined")
    }

    // 3. Dibujar línea de ruta
    console.log("Puntos totales para la ruta:", routePoints.length)
    if (routePoints.length > 1) {
      routeLine = L.polyline(routePoints, {
        color: "blue",
        weight: 3,
        opacity: 0.7,
      }).addTo(map)
      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] })
      console.log("✓ Línea de ruta dibujada con", routePoints.length, "puntos")
    } else if (routePoints.length === 1) {
      map.setView(routePoints[0], 12)
      console.log("✓ Mapa centrado en único punto disponible")
    } else {
      console.warn("⚠ No se encontraron puntos válidos para mostrar en el mapa")
      map.setView([29.5, -114.5], 6)
    }
  } catch (error) {
    console.error("Error al parsear coordenadas de la ruta:", error)
    console.error("Datos que causaron el error:", {
      coordenadas_inicio_json: routeDetails.coordenadas_inicio_json,
      coordenadas_ruta_json: routeDetails.coordenadas_ruta_json,
    })
    map.setView([29.5, -114.5], 6)
  }

  console.log("=== FIN addMarkersToMapFromDetails ===")
}

// Función modificada para mostrar detalles de ruta
async function showRouteDetails(routeId) {
  try {
    showLoadingOverlay()
    console.log("=== INICIO showRouteDetails ===")
    console.log("Solicitando detalles para ruta ID:", routeId)
    console.log("Tipo de routeId:", typeof routeId)

    // Asegurar que routeId sea un número
    const numericRouteId = Number(routeId)
    console.log("ID numérico:", numericRouteId)

    // Obtener detalles de la ruta específica
    console.log("Llamando a getRutasDetalladas con ID:", numericRouteId)
    const response = await getRutasDetalladas(numericRouteId)
    console.log("Respuesta completa de getRutasDetalladas:", response)

    if (response && response.status === 0) {
      const routeData = response.data
      console.log("Datos recibidos (antes de procesar):", routeData)

      // Verificar si es un array y tomar el elemento correcto
      if (Array.isArray(routeData)) {
        console.log("Los datos son un array con", routeData.length, "elementos")

        // Si es un array, buscar el elemento que coincida con el ID
        const matchingRoute = routeData.find(
          (route) => route.id_ruta === numericRouteId || route.id === numericRouteId || route.idRuta === numericRouteId,
        )

        if (matchingRoute) {
          routeDetails = matchingRoute
          console.log("Ruta encontrada en el array:", routeDetails)
        } else {
          console.error("No se encontró la ruta con ID", numericRouteId, "en el array")
          console.log(
            "IDs disponibles en el array:",
            routeData.map((r) => r.id_ruta || r.id || r.idRuta),
          )
          alert("No se encontraron detalles para esta ruta específica")
          return
        }
      } else if (routeData) {
        // Si no es un array, usar directamente
        routeDetails = routeData
        console.log("Usando datos directamente (no es array):", routeDetails)

        // Verificar que los datos correspondan al ID solicitado
        const dataRouteId = routeDetails.id_ruta || routeDetails.id || routeDetails.idRuta
        if (dataRouteId && dataRouteId !== numericRouteId) {
          console.warn("ADVERTENCIA: El ID de los datos recibidos no coincide con el solicitado")
          console.warn("ID solicitado:", numericRouteId, "ID recibido:", dataRouteId)
        }
      } else {
        console.error("No hay datos en la respuesta")
        alert("No se recibieron datos de la ruta")
        return
      }

      console.log("=== DATOS FINALES PARA EL MAPA ===")
      console.log("routeDetails final:", routeDetails)
      console.log("coordenadas_inicio_json:", routeDetails.coordenadas_inicio_json)
      console.log("coordenadas_ruta_json:", routeDetails.coordenadas_ruta_json)

      // Actualizar mapa con los nuevos datos
      addMarkersToMapFromDetails()

      // Resaltar la tarjeta seleccionada
      document.querySelectorAll(".route-card").forEach((card) => {
        card.classList.remove("selected")
      })
      const selectedCard = document.querySelector(`.route-card[data-route-id="${routeId}"]`)
      if (selectedCard) {
        selectedCard.classList.add("selected")
      }

      // Actualizar selectedRoute para mantener compatibilidad
      selectedRoute = allRoutes.find((route) => route.id === numericRouteId)
      console.log("selectedRoute actualizado:", selectedRoute)
    } else {
      console.error("Error al obtener detalles de la ruta:", response)
      alert("Error al cargar los detalles de la ruta")
    }
  } catch (error) {
    console.error("Error al obtener detalles de la ruta:", error)
    alert("Error de conexión al cargar los detalles de la ruta")
  } finally {
    hideLoadingOverlay()
    console.log("=== FIN showRouteDetails ===")
  }
}

// Edit route (placeholder function)
function editRoute(routeId) {
  const routeToEdit = allRoutes.find((r) => r.id === routeId)
  if (routeToEdit) {
    alert(`Editar ruta: ${routeToEdit.nombre} (ID: ${routeId})`)
    console.log("Ruta a editar:", routeToEdit)
  }
}
window.editRoute = editRoute

// Clear selected route and map display
function clearSelection() {
  selectedRoute = null
  routeDetails = null
  addMarkersToMapFromDetails() // Esto limpiará el mapa ya que routeDetails será null
  document.querySelectorAll(".route-card").forEach((card) => {
    card.classList.remove("selected")
  })
}

// Filter routes based on search term and current filter
function filterRoutes(searchTerm = "") {
  const lowerCaseSearchTerm = searchTerm.toLowerCase()

  filteredRoutes = allRoutes.filter((route) => {
    const matchesSearch =
      (route.nombre || "").toLowerCase().includes(lowerCaseSearchTerm) ||
      (route.descripcion || "").toLowerCase().includes(lowerCaseSearchTerm)

    const matchesFilter = currentFilter === "all" || (route.estado || "").toLowerCase() === currentFilter

    return matchesSearch && matchesFilter
  })
  renderRouteCards()
}
window.filterRoutes = filterRoutes

// Handle filter button clicks
function setupFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.dataset.filter
      clearSelection()
      const searchInput = document.querySelector(".search-input")
      filterRoutes(searchInput ? searchInput.value : "")
    })
  })
}


// API Integration Functions
async function loadData() {
  showLoadingOverlay()
  try {
    console.log("Starting to load routes data...")

    await loadUsersOnly() // Solo cargar usuarios, ya no necesitamos ubicaciones

    const apiResponse = await getRutas()
    console.log("API Response:", apiResponse)

    if (apiResponse && apiResponse.status === 0 && Array.isArray(apiResponse.data)) {
      allRoutes = apiResponse.data
      console.log("Routes loaded:", allRoutes.length)

      filterRoutes()
      console.log("Data loaded successfully")
    } else {
      console.error("Invalid API response:", apiResponse)
      allRoutes = []
      filteredRoutes = []
      document.getElementById("routeListContent").innerHTML =
        "<p class='text-center text-red-500'>No se pudieron cargar las rutas. Intente de nuevo más tarde.</p>"
    }
  } catch (error) {
    console.error("Error loading routes:", error)
    allRoutes = []
    filteredRoutes = []
    document.getElementById("routeListContent").innerHTML =
      "<p class='text-center text-red-500'>Error de red al cargar rutas. Verifique su conexión o intente de nuevo.</p>"
  } finally {
    hideLoadingOverlay()
  }
}

async function loadUsersOnly() {
  try {
    const usuariosResponse = await getUsuarios()
    if (usuariosResponse && usuariosResponse.status === 0) {
      // Cambiar esta línea para usar la estructura correcta
      usuariosList = usuariosResponse.usuarios || usuariosResponse.data
      console.log("Usuarios cargados:", usuariosResponse)
      console.log("Lista de usuarios final:", usuariosList)
    }
  } catch (error) {
    console.error("Error loading users:", error)
  }
}

async function refreshData() {
  await loadData()
  if (selectedRoute && routeDetails) {
    const updatedRoute = allRoutes.find((r) => r.id === selectedRoute.id)
    if (updatedRoute) {
      showRouteDetails(updatedRoute.id)
    } else {
      clearSelection()
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
  } else {
    console.error(`Modal con ID '${modalId}' no encontrado.`)
  }
}
window.closeModal = closeModal

// Loading Overlay Functions
function showLoadingOverlay() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden")
    loadingOverlay.style.opacity = "1"
    loadingOverlay.style.pointerEvents = "auto"
  }
}

function hideLoadingOverlay() {
  if (loadingOverlay) {
    loadingOverlay.classList.add("hidden")
    setTimeout(() => {
      if (loadingOverlay.classList.contains("hidden")) {
        loadingOverlay.style.pointerEvents = "none"
      }
    }, 300)
  }
}

// ========== MODAL SYSTEM FOR NEW ROUTE ==========
// Create modal for new route
const createRouteModal = document.createElement("div")
createRouteModal.id = "createRouteModal"
createRouteModal.className = "route-modal"
createRouteModal.innerHTML = `
  <div class="modal-content">
    <div class="modal-header">
      <h2><i class="fas fa-route"></i> Crear Nueva Ruta</h2>
      <span class="close-button-create">&times;</span>
    </div>
    <div class="modal-body">
      <form id="createRouteForm">
        <div class="form-group">
          <label for="routeName">Nombre de la Ruta *</label>
          <input type="text" id="routeName" name="routeName" required placeholder="Ej: Ruta Norte A-B">
          <span class="error-message" id="routeNameError"></span>
        </div>

        <div class="form-group">
          <label for="routeDescription">Descripción</label>
          <textarea id="routeDescription" name="routeDescription" rows="3" placeholder="Descripción de la ruta"></textarea>
          <span class="error-message" id="routeDescriptionError"></span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="plantSelect">Planta (Punto de Inicio) *</label>
            <select id="plantSelect" name="plantSelect" required>
              <option value="">Seleccione una planta...</option>
            </select>
            <span class="error-message" id="plantSelectError"></span>
          </div>

          <div class="form-group">
            <label for="userSelect">Usuario Asignado *</label>
            <select id="userSelect" name="userSelect" required>
              <option value="">Seleccione un usuario...</option>
            </select>
            <span class="error-message" id="userSelectError"></span>
          </div>
        </div>

        <div class="form-group">
        <label for="companiesSelect">Empresas en la Ruta *</label>
<div class="multi-select-container">
    <div class="companies-selector">
        <select id="companiesSelect" name="companiesSelect" size="6">
            <option value="">Cargando empresas...</option>
        </select>
        <button type="button" id="addCompanyBtn" class="add-company-btn">
            <i class="fas fa-plus"></i> Agregar Empresa
        </button>
    </div>
    <div class="selected-companies">
        <h4>Empresas Seleccionadas:</h4>
        <div id="selectedCompaniesList">
            <p class="no-companies">No hay empresas seleccionadas</p>
        </div>
    </div>
</div>
<span class="error-message" id="companiesSelectError"></span>
</div>

        <div class="form-group">
          <label for="routeStatus">Estado de la Ruta</label>
          <select id="routeStatus" name="routeStatus">
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

        <div class="form-buttons">
          <button type="button" id="cancelarRutaBtn">Cancelar</button>
          <button type="submit" id="crearRutaBtn">Crear Ruta</button>
        </div>
      </form>
      
      <div id="routeLoadingMessage" class="message-container" style="display: none;">
        <p><i class="fas fa-spinner fa-spin"></i> <span id="routeLoadingText">Procesando...</span></p>
      </div>
      
      <div id="routeSuccessMessage" class="message-container" style="display: none;">
        <p><i class="fas fa-check-circle"></i> <span id="routeSuccessText">¡Operación exitosa!</span></p>
      </div>
      
      <div id="routeErrorMessage" class="message-container" style="display: none;">
        <p><i class="fas fa-exclamation-triangle"></i> <span id="routeErrorText"></span></p>
      </div>
    </div>
  </div>
`
document.body.appendChild(createRouteModal)

// Modal functions
function openNewRouteModal() {
  loadPlantsAndCompanies()
  clearRouteMessages()
  resetRouteForm()
  createRouteModal.style.display = "block"
  document.body.style.overflow = "hidden"
}

function closeNewRouteModal() {
  createRouteModal.style.display = "none"
  document.body.style.overflow = "auto"
  resetRouteForm()
  clearRouteMessages()
}

function resetRouteForm() {
  document.getElementById("createRouteForm").reset()
  selectedCompanies = []
  updateSelectedCompaniesList()
}

function clearRouteMessages() {
  document.getElementById("routeLoadingMessage").style.display = "none"
  document.getElementById("routeSuccessMessage").style.display = "none"
  document.getElementById("routeErrorMessage").style.display = "none"

  document.getElementById("routeNameError").textContent = ""
  document.getElementById("routeDescriptionError").textContent = ""
  document.getElementById("plantSelectError").textContent = ""
  document.getElementById("companiesSelectError").textContent = ""
  document.getElementById("userSelectError").textContent = ""
}

// Load plants and companies data
async function loadPlantsAndCompanies() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const plantSelect = document.getElementById("plantSelect")
    const companiesSelect = document.getElementById("companiesSelect")
    const userSelect = document.getElementById("userSelect")

    if (!plantSelect || !companiesSelect || !userSelect) {
      console.error("Modal elements not found")
      return
    }

    plantSelect.innerHTML = '<option value="">Cargando plantas...</option>'
    companiesSelect.innerHTML = '<option value="">Cargando empresas...</option>'
    userSelect.innerHTML = '<option value="">Cargando usuarios...</option>'

    try {
      const [plantasResponse, empresasResponse, usuariosResponse] = await Promise.all([
        getPlantas(),
        getEmpresas(),
        getUsuarios(),
      ])

      console.log("Plantas response:", plantasResponse)
      console.log("Empresas response:", empresasResponse)
      console.log("Usuarios response:", usuariosResponse)

      if (plantasResponse && plantasResponse.status === 0 && Array.isArray(plantasResponse.data)) {
        plantasList = plantasResponse.data
        populatePlantsSelect()
      } else {
        plantSelect.innerHTML = '<option value="">Error cargando plantas</option>'
        console.error("Error en respuesta de plantas:", plantasResponse)
      }

      if (empresasResponse && empresasResponse.status === 0 && Array.isArray(empresasResponse.data)) {
        empresasList = empresasResponse.data
        populateCompaniesSelect()
      } else {
        companiesSelect.innerHTML = '<option value="">Error cargando empresas</option>'
        console.error("Error en respuesta de empresas:", empresasResponse)
      }

      if (usuariosResponse && usuariosResponse.status === 0 && Array.isArray(usuariosResponse.usuarios)) {
        usuariosList = usuariosResponse.usuarios
        populateUsersSelect()
      } else {
        userSelect.innerHTML = '<option value="">Error cargando usuarios</option>'
        console.error("Error en respuesta de usuarios:", usuariosResponse)
      }
    } catch (apiError) {
      console.error("Error in API calls:", apiError)
      plantSelect.innerHTML = '<option value="">Error de conexión</option>'
      companiesSelect.innerHTML = '<option value="">Error de conexión</option>'
      userSelect.innerHTML = '<option value="">Error de conexión</option>'
    }
  } catch (error) {
    console.error("Error loading data:", error)
  }
}

function populatePlantsSelect() {
  const plantSelect = document.getElementById("plantSelect")
  plantSelect.innerHTML = '<option value="">Seleccione una planta...</option>'

  plantasList.forEach((planta) => {
    const option = document.createElement("option")
    option.value = planta.id
    option.textContent = planta.nombre
    plantSelect.appendChild(option)
  })
}

function populateCompaniesSelect() {
  const companiesSelect = document.getElementById("companiesSelect")
  companiesSelect.innerHTML = '<option value="">Seleccione una empresa...</option>'

  if (empresasList.length === 0) {
    companiesSelect.innerHTML = '<option value="">No hay empresas disponibles</option>'
    return
  }

  empresasList.forEach((empresa) => {
    const option = document.createElement("option")
    option.value = empresa.id
    option.textContent = empresa.nombre
    companiesSelect.appendChild(option)
  })
}

function populateUsersSelect() {
  const userSelect = document.getElementById("userSelect")
  userSelect.innerHTML = '<option value="">Selecciona un recolector</option>'
  usuariosList
    .filter((usuario) => usuario.tipoUsuario.toLowerCase() === "recolector")
    .forEach((usuario) => {
      const option = document.createElement("option")
      option.value = usuario.idUsuario
      option.textContent = `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido}`
      userSelect.appendChild(option)
    })
}

function addSelectedCompany() {
  const companiesSelect = document.getElementById("companiesSelect")
  const selectedOption = companiesSelect.options[companiesSelect.selectedIndex]

  if (!selectedOption || !selectedOption.value) {
    return
  }

  const companyId = Number.parseInt(selectedOption.value)
  const companyName = selectedOption.textContent

  if (selectedCompanies.find((c) => c.id === companyId)) {
    return
  }

  selectedCompanies.push({ id: companyId, nombre: companyName })
  updateSelectedCompaniesList()
  companiesSelect.selectedIndex = -1
}

function removeSelectedCompany(companyId) {
  selectedCompanies = selectedCompanies.filter((c) => c.id !== companyId)
  updateSelectedCompaniesList()
}

function updateSelectedCompaniesList() {
  const container = document.getElementById("selectedCompaniesList")

  if (selectedCompanies.length === 0) {
    container.innerHTML = '<p class="no-companies">No hay empresas seleccionadas</p>'
    return
  }

  container.innerHTML = selectedCompanies
    .map(
      (company) => `
    <div class="selected-company-item">
      <span><i class="fas fa-industry"></i> ${company.nombre}</span>
      <button type="button" class="remove-company" onclick="removeSelectedCompany(${company.id})">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `,
    )
    .join("")
}

// Form validation
function validateRouteForm(formData) {
  let isValid = true

  if (!formData.routeName.trim()) {
    document.getElementById("routeNameError").textContent = "El nombre de la ruta es requerido"
    isValid = false
  } else {
    document.getElementById("routeNameError").textContent = ""
  }

  if (!formData.plantSelect) {
    document.getElementById("plantSelectError").textContent = "Debe seleccionar una planta"
    isValid = false
  } else {
    document.getElementById("plantSelectError").textContent = ""
  }

  if (selectedCompanies.length === 0) {
    document.getElementById("companiesSelectError").textContent = "Debe seleccionar al menos una empresa"
    isValid = false
  } else {
    document.getElementById("companiesSelectError").textContent = ""
  }

  if (!formData.userSelect) {
    document.getElementById("userSelectError").textContent = "Debe seleccionar un usuario"
    isValid = false
  } else {
    document.getElementById("userSelectError").textContent = ""
  }

  return isValid
}

// Form submission
async function handleRouteFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const routeData = {
    routeName: formData.get("routeName").trim(),
    routeDescription: formData.get("routeDescription").trim(),
    plantSelect: formData.get("plantSelect"),
    userSelect: formData.get("userSelect"),
    routeStatus: formData.get("routeStatus"),
  }

  if (!validateRouteForm(routeData)) {
    return
  }

  clearRouteMessages()
  document.getElementById("routeLoadingMessage").style.display = "block"
  document.getElementById("routeLoadingText").textContent = "Creando ruta..."

  try {
    const nuevaRuta = {
      nombreRuta: routeData.routeName,
      fechaCreacion: new Date().toISOString(),
      descripcion: routeData.routeDescription || "",
      estado: routeData.routeStatus,
      idUsuarioAsignado: Number(routeData.userSelect),
      progresoRuta: 0,
    }

    const result = await postRutas(nuevaRuta)

    if (!result || result.status !== 0) {
      throw new Error(result.message || "No se pudo obtener el ID de la ruta creada")
    }

    const idRuta = result.data?.id

    if (!idRuta) {
      throw new Error("No se pudo obtener el ID de la ruta creada")
    }

    const plantaData = {
      idRuta: Number(idRuta),
      idPlanta: Number(routeData.plantSelect),
    }

    console.log("Planta a asociar:", plantaData)
    await postRutasPlantas(plantaData)

    console.log("Empresas seleccionadas global:", selectedCompanies)

    if (selectedCompanies.length === 0) {
      throw new Error("No se seleccionó ninguna empresa para la ruta")
    }

    for (let i = 0; i < selectedCompanies.length; i++) {
      const empresaData = {
        idRuta: Number(idRuta),
        idEmpresa: Number(selectedCompanies[i].id),
        orden: i + 1,
      }
      console.log("Enviando empresa:", empresaData)
      await postRutasEmpresas(empresaData)
    }

    document.getElementById("routeLoadingMessage").style.display = "none"
    document.getElementById("routeSuccessMessage").style.display = "block"
    document.getElementById("routeSuccessText").textContent = "¡Ruta creada exitosamente!"

    await loadData()

    setTimeout(() => {
      closeNewRouteModal()
    }, 2000)
  } catch (error) {
    document.getElementById("routeLoadingMessage").style.display = "none"
    document.getElementById("routeErrorMessage").style.display = "block"
    document.getElementById("routeErrorText").textContent = error.message || "Error al conectar con el servidor"
    console.error("Error al crear ruta:", error)
  }
}

// Event listeners for modal
createRouteModal.querySelector(".close-button-create").addEventListener("click", closeNewRouteModal)
document.getElementById("cancelarRutaBtn").addEventListener("click", closeNewRouteModal)
document.getElementById("createRouteForm").addEventListener("submit", handleRouteFormSubmit)
document.getElementById("addCompanyBtn").addEventListener("click", addSelectedCompany)

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === createRouteModal) {
    closeNewRouteModal()
  }
})

// Make functions global for onclick handlers
window.showRouteDetails = showRouteDetails
window.editRoute = editRoute
window.filterRoutes = filterRoutes
window.clearSelection = clearSelection
window.refreshData = refreshData
window.removeSelectedCompany = removeSelectedCompany

// Declare handleNewRouteSubmit function
function handleNewRouteSubmit(e) {
  console.error("handleNewRouteSubmit function is not implemented.")
  e.preventDefault()
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loadingOverlay = document.getElementById("loadingOverlay")
  initializeMap()
  loadData()
  setupFilterButtons()

  const newRouteBtn = document.getElementById("newContainerBtn")
  if (newRouteBtn) {
    newRouteBtn.addEventListener("click", openNewRouteModal)
  } else {
    console.warn('Elemento "newContainerBtn" (Nueva Ruta) no encontrado.')
  }

  const newRouteForm = document.getElementById("newRouteForm")
  if (newRouteForm) {
    newRouteForm.addEventListener("submit", handleNewRouteSubmit)
  }
})
