import { getIncidentes, getUserById } from "../DataConnection/Gets.js"

let todosLosIncidentes = []
let incidenteSeleccionado = null
let vistaActual = "abiertos" // "abiertos" o "cerrados"

document.addEventListener("DOMContentLoaded", async () => {
  // PRIMERO crear las pestañas
  inicializarPestanas()

  // DESPUÉS cargar los incidentes (que llama a actualizarContadores)
  await cargarIncidentes()

  agregarEventosDeFiltros()
  aplicarFiltros()
  inicializarEventosModal()
})

async function cargarIncidentes() {
  try {
    const respuesta = await getIncidentes()
    const incidentesOriginales = respuesta.data || []

    console.log("=== INCIDENTES CARGADOS ===")
    console.log("Total incidentes:", incidentesOriginales.length)
    console.log("===========================")

    // Obtener información de usuarios para cada incidente
    todosLosIncidentes = await Promise.all(
      incidentesOriginales.map(async (incidente) => {
        try {
          const usuarioResponse = await getUserById(incidente.idUsuario)
          const usuario = usuarioResponse.usuario
          const nombreCompleto = usuario
            ? `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido}`
            : "Usuario Desconocido"

          return {
            ...incidente,
            nombreCompleto,
            usuario,
          }
        } catch (error) {
          return {
            ...incidente,
            nombreCompleto: "Usuario Desconocido",
            usuario: null,
          }
        }
      }),
    )

    // AHORA SÍ actualizar contadores (las pestañas ya existen)
    actualizarContadores()
  } catch (error) {
    console.error("Error al cargar incidentes:", error)
    mostrarErrorCarga()
  }
}

function inicializarPestanas() {
  const contenedorPrincipal = document.getElementById("lista-incidentes").parentElement

  // Verificar si ya existen las pestañas
  if (!document.getElementById("pestanas-incidentes")) {
    const pestanasHTML = `
      <div id="pestanas-incidentes" class="tabs-container">
        <div class="tabs-header">
          <button class="tab-btn active" data-vista="abiertos" onclick="cambiarVista('abiertos')">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Incidentes Abiertos</span>
            <span class="badge" id="contador-abiertos">0</span>
          </button>
          <button class="tab-btn" data-vista="cerrados" onclick="cambiarVista('cerrados')">
            <i class="fas fa-check-circle"></i>
            <span>Incidentes Cerrados</span>
            <span class="badge" id="contador-cerrados">0</span>
          </button>
        </div>
      </div>
    `

    contenedorPrincipal.insertAdjacentHTML("beforebegin", pestanasHTML)
    console.log("✅ Pestañas creadas correctamente")
  }
}

function cambiarVista(nuevaVista) {
  vistaActual = nuevaVista

  // Actualizar pestañas activas
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[data-vista="${nuevaVista}"]`).classList.add("active")

  // Aplicar filtros con la nueva vista
  aplicarFiltros()
}

function actualizarContadores() {
  const abiertos = todosLosIncidentes.filter((incidente) => !estaIncidenteCerrado(incidente)).length
  const cerrados = todosLosIncidentes.filter((incidente) => estaIncidenteCerrado(incidente)).length

  console.log(`📊 Calculados: ${abiertos} abiertos, ${cerrados} cerrados`)

  // Buscar los elementos
  const contadorAbiertos = document.getElementById("contador-abiertos")
  const contadorCerrados = document.getElementById("contador-cerrados")

  console.log("🔍 Elementos encontrados:")
  console.log("- contador-abiertos:", contadorAbiertos)
  console.log("- contador-cerrados:", contadorCerrados)

  if (contadorAbiertos) {
    contadorAbiertos.textContent = abiertos
    console.log(`✅ Actualizado contador abiertos: ${abiertos}`)
  } else {
    console.log("❌ No se encontró elemento contador-abiertos")
  }

  if (contadorCerrados) {
    contadorCerrados.textContent = cerrados
    console.log(`✅ Actualizado contador cerrados: ${cerrados}`)
  } else {
    console.log("❌ No se encontró elemento contador-cerrados")
  }
}

function estaIncidenteCerrado(incidente) {
  // El campo correcto es 'estadoIncidente'
  const estado = (incidente.estadoIncidente || "").toString().trim().toLowerCase()

  const esCerrado =
    estado === "cerrado" ||
    estado === "closed" ||
    estado === "completado" ||
    estado === "completed" ||
    estado === "resuelto" ||
    estado === "resolved"

  return esCerrado
}

function agregarEventosDeFiltros() {
  document.getElementById("searchIncidentesInput").addEventListener("input", aplicarFiltros)
  document.getElementById("fechaIncidentesFilter").addEventListener("change", aplicarFiltros)

  const estadoFilter = document.getElementById("estadoIncidentesFilter")
  if (estadoFilter) {
    estadoFilter.addEventListener("change", aplicarFiltros)
  }
}

function aplicarFiltros() {
  const texto = document.getElementById("searchIncidentesInput").value.toLowerCase()
  const fechaFiltro = document.getElementById("fechaIncidentesFilter").value
  const estadoFiltro = document.getElementById("estadoIncidentesFilter")?.value || ""

  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - hoy.getDay())
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  // Filtrar por vista actual (abiertos o cerrados)
  const incidentesPorVista = todosLosIncidentes.filter((incidente) => {
    if (vistaActual === "cerrados") {
      return estaIncidenteCerrado(incidente)
    } else {
      return !estaIncidenteCerrado(incidente)
    }
  })

  const filtrados = incidentesPorVista.filter((incidente) => {
    const coincideTexto =
      incidente.nombre.toLowerCase().includes(texto) ||
      incidente.descripcion.toLowerCase().includes(texto) ||
      incidente.nombreCompleto.toLowerCase().includes(texto)

    const fechaIncidente = new Date(incidente.fechaIncidente)
    let coincideFecha = true

    if (fechaFiltro === "hoy") {
      coincideFecha = fechaIncidente.toDateString() === hoy.toDateString()
    } else if (fechaFiltro === "semana") {
      coincideFecha = fechaIncidente >= inicioSemana && fechaIncidente <= hoy
    } else if (fechaFiltro === "mes") {
      coincideFecha = fechaIncidente >= inicioMes && fechaIncidente <= hoy
    }

    let coincideEstado = true
    if (estadoFiltro) {
      const estadoIncidente = (incidente.estadoIncidente || "pendiente").toLowerCase()
      coincideEstado = estadoIncidente.includes(estadoFiltro.toLowerCase())
    }

    return coincideTexto && coincideFecha && coincideEstado
  })

  renderizarLista(filtrados)
}

function renderizarLista(lista) {
  const ul = document.getElementById("lista-incidentes")
  ul.innerHTML = ""

  if (lista.length === 0) {
    const mensajeVacio =
      vistaActual === "cerrados"
        ? "No hay incidentes cerrados que coincidan con los filtros."
        : "No hay incidentes abiertos que coincidan con los filtros."

    ul.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <h3>No se encontraron incidentes</h3>
        <p>${mensajeVacio}</p>
      </div>
    `
    return
  }

  lista.forEach((incidente) => {
    const item = document.createElement("li")
    item.classList.add("incidente-item", "fade-in")

    const estadoInfo = getEstadoInfo(incidente.estadoIncidente)
    const esCerrado = estaIncidenteCerrado(incidente)

    item.innerHTML = `
      <div class="incidente-header">
        <div class="incidente-info">
          <h3 class="incidente-titulo">
            <i class="fas fa-${esCerrado ? "check-circle" : "exclamation-triangle"}"></i>
            ${incidente.nombre}
          </h3>
          <div class="incidente-meta">
            <p>
              <strong><i class="fas fa-user"></i> Usuario:</strong>
              <span>${incidente.nombreCompleto}</span>
            </p>
            <p>
              <strong><i class="fas fa-calendar-alt"></i> Fecha:</strong>
              <span>${formatearFecha(incidente.fechaIncidente)}</span>
            </p>
            <p>
              <strong><i class="fas fa-info-circle"></i> Estado:</strong>
              <span class="status-badge ${estadoInfo.class}">
                <i class="${estadoInfo.icon}"></i>
                ${estadoInfo.text}
              </span>
            </p>
          </div>
        </div>
        <div class="incidente-imagen">
          <img src="${incidente.photoUrl || "/placeholder.svg?height=120&width=120"}"
               alt="Imagen del incidente"
               onerror="this.src='/placeholder.svg?height=120&width=120'">
        </div>
      </div>
      <div class="incidente-descripcion">
        <p><strong>Descripción:</strong> ${truncarTexto(incidente.descripcion, 150)}</p>
      </div>
      <div class="incidente-actions">
        <button class="btn btn-primary btn-sm" onclick="mostrarModal(${incidente.id})">
          <i class="fas fa-eye"></i> Ver detalles
        </button>
        ${
          !esCerrado
            ? `
          <button class="btn btn-secondary btn-sm" onclick="cambiarEstadoRapido(${incidente.id})">
            <i class="fas fa-sync-alt"></i> Cerrar incidente
          </button>
        `
            : `
          <button class="btn btn-success btn-sm" disabled>
            <i class="fas fa-check"></i> Cerrado
          </button>
        `
        }
      </div>
    `

    ul.appendChild(item)
  })
}

function mostrarModal(incidenteId) {
  const incidente = todosLosIncidentes.find((i) => i.id === incidenteId)
  if (!incidente) return

  incidenteSeleccionado = incidente
  const estadoInfo = getEstadoInfo(incidente.estadoIncidente)
  const esCerrado = estaIncidenteCerrado(incidente)

  const modalContent = `
    <div class="modal-header">
      <h2>
        <i class="fas fa-${esCerrado ? "check-circle" : "exclamation-triangle"}"></i>
        Detalles del Incidente
      </h2>
      <span class="close-btn" onclick="cerrarModal()">&times;</span>
    </div>
    <div class="modal-body">
      <div class="detail-item">
        <strong><i class="fas fa-tag"></i> Nombre:</strong>
        <span>${incidente.nombre}</span>
      </div>
      
      <div class="detail-item">
        <strong><i class="fas fa-align-left"></i> Descripción:</strong>
        <span>${incidente.descripcion}</span>
      </div>
      
      <div class="detail-item">
        <strong><i class="fas fa-user"></i> Reportado por:</strong>
        <span>${incidente.nombreCompleto}</span>
      </div>
      
      <div class="detail-item">
        <strong><i class="fas fa-calendar-alt"></i> Fecha del incidente:</strong>
        <span>${formatearFechaCompleta(incidente.fechaIncidente)}</span>
      </div>
      
      <div class="detail-item">
        <strong><i class="fas fa-info-circle"></i> Estado actual:</strong>
        <span class="status-badge ${estadoInfo.class}">
          <i class="${estadoInfo.icon}"></i>
          ${estadoInfo.text}
        </span>
      </div>
      
      ${
        incidente.photoUrl
          ? `
        <div class="detail-item">
          <strong><i class="fas fa-image"></i> Imagen:</strong>
        </div>
        <img src="${incidente.photoUrl}" alt="Imagen del incidente" class="modal-image">
      `
          : ""
      }
      
      <div class="modal-actions">
        ${
          !esCerrado
            ? `
          <button class="btn btn-primary" onclick="cambiarEstadoIncidente()">
            <i class="fas fa-sync-alt"></i>
            Cerrar incidente
          </button>
        `
            : `
          <button class="btn btn-success" disabled>
            <i class="fas fa-check"></i>
            Incidente cerrado
          </button>
        `
        }
        <button class="btn btn-secondary" onclick="cerrarModal()">
          <i class="fas fa-times"></i>
          Cerrar
        </button>
      </div>
    </div>
  `

  document.querySelector(".modal-content").innerHTML = modalContent
  document.getElementById("modalIncidente").style.display = "block"
  document.body.style.overflow = "hidden"
}

// PUT SIMPLE Y DIRECTO - AHORA CON EL CAMPO CORRECTO
async function cambiarEstadoIncidente() {
  if (!incidenteSeleccionado) return

  const id = incidenteSeleccionado.id
  const nuevoEstado = "CERRADO"

  try {
    console.log(`🔄 Cambiando incidente ${id} a ${nuevoEstado}`)
    const url = `https://localhost:5001/api/Incidentes/${id}`
    
    // CAMBIO: Usar el nombre correcto que espera el backend
    const datos = {
      estado_incidente: nuevoEstado,  // ← CAMBIO AQUÍ: snake_case en lugar de camelCase
    }

    console.log("📤 Datos enviados:", datos)
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })

    if (response.ok) {
      const resultado = await response.json()
      console.log("✅ Respuesta del servidor:", resultado)
      
      // Actualizar en la lista local CON EL CAMPO CORRECTO
      const index = todosLosIncidentes.findIndex((i) => i.id === id)
      if (index !== -1) {
        todosLosIncidentes[index].estadoIncidente = nuevoEstado
        console.log(`✅ Incidente ${id} actualizado localmente a ${nuevoEstado}`)
      }

      mostrarToast(`¡Incidente cerrado exitosamente! Se movió a la sección de cerrados.`, "success")
      cerrarModal()
      
      // Actualizar contadores
      actualizarContadores()
      
      // Si estamos en la vista de abiertos, aplicar filtros para que desaparezca
      if (vistaActual === "abiertos") {
        aplicarFiltros()
        // Mostrar notificación para cambiar a cerrados
        setTimeout(() => {
          mostrarToast("Puedes ver el incidente en la pestaña 'Incidentes Cerrados'", "info")
        }, 2000)
      } else {
        aplicarFiltros()
      }
    } else {
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.error("❌ Error al cambiar estado:", error)
    mostrarToast(`Error: ${error.message}`, "error")
  }
}

async function cambiarEstadoRapido(incidenteId) {
  const incidente = todosLosIncidentes.find((i) => i.id === incidenteId)
  if (!incidente) return

  incidenteSeleccionado = incidente
  await cambiarEstadoIncidente()
}

function getEstadoInfo(estado) {
  const estadoLower = (estado || "abierto").toLowerCase()

  if (
    estadoLower === "cerrado" ||
    estadoLower === "closed" ||
    estadoLower === "completado" ||
    estadoLower === "completed"
  ) {
    return {
      class: "status-completed",
      icon: "fas fa-check-circle",
      text: "Cerrado",
      nextAction: "Incidente cerrado",
    }
  } else if (estadoLower.includes("proceso") || estadoLower.includes("progreso")) {
    return {
      class: "status-processing",
      icon: "fas fa-clock",
      text: "En Proceso",
      nextAction: "Cerrar incidente",
    }
  } else {
    return {
      class: "status-pending",
      icon: "fas fa-exclamation-circle",
      text: "Abierto",
      nextAction: "Cerrar incidente",
    }
  }
}

function mostrarErrorCarga() {
  const ul = document.getElementById("lista-incidentes")
  ul.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Error al cargar incidentes</h3>
      <p>No se pudieron cargar los incidentes. Intenta recargar la página.</p>
      <button onclick="location.reload()" class="btn btn-primary">
        <i class="fas fa-redo"></i> Recargar
      </button>
    </div>
  `
}

function formatearFecha(fechaString) {
  if (!fechaString) return "Fecha no disponible"
  const fecha = new Date(fechaString)
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatearFechaCompleta(fechaString) {
  if (!fechaString) return "Fecha no disponible"
  const fecha = new Date(fechaString)
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncarTexto(texto, limite) {
  if (!texto) return "Sin descripción"
  if (texto.length <= limite) return texto
  return texto.substring(0, limite) + "..."
}

function mostrarToast(mensaje, tipo = "success") {
  const toastContainer = document.querySelector(".toast-container") || crearToastContainer()
  const toast = document.createElement("div")
  toast.className = `toast ${tipo}`

  let icon = "fas fa-check-circle"
  if (tipo === "error") icon = "fas fa-exclamation-triangle"
  if (tipo === "info") icon = "fas fa-info-circle"

  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${mensaje}</span>
  `

  toastContainer.appendChild(toast)

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 5000)
}

function crearToastContainer() {
  const container = document.createElement("div")
  container.className = "toast-container"
  document.body.appendChild(container)
  return container
}

function cerrarModal() {
  document.getElementById("modalIncidente").style.display = "none"
  document.body.style.overflow = "auto"
  incidenteSeleccionado = null
}

function inicializarEventosModal() {
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("modalIncidente")
    if (e.target === modal) {
      cerrarModal()
    }
  })

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarModal()
    }
  })
}

// Funciones globales para HTML
window.mostrarModal = mostrarModal
window.cambiarEstadoRapido = cambiarEstadoRapido
window.cambiarEstadoIncidente = cambiarEstadoIncidente
window.cerrarModal = cerrarModal
window.cambiarVista = cambiarVista
