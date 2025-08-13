import { getReportes, getUserById } from "../DataConnection/Gets.js"

document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById("loadingState")
  const emptyState = document.getElementById("emptyState")
  const tableBody = document.getElementById("reportsTableBody")

  // Crear el modal una sola vez
  createReportModal()

  loadingState.style.display = "block"

  try {
    const response = await getReportes()
    const reportes = response.data

    loadingState.style.display = "none"

    if (!Array.isArray(reportes) || reportes.length === 0) {
      emptyState.style.display = "block"
      return
    }

    for (const reporte of reportes) {
      const usuarioResponse = await getUserById(reporte.idUsuario)
      const usuario = usuarioResponse.usuario
      const nombreCompleto = usuario
        ? `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido}`
        : "Desconocido"

      const row = document.createElement("tr")
      row.className = "report-row"
      row.dataset.reportData = JSON.stringify({
        ...reporte,
        nombreCompleto,
        usuario,
      })

      row.innerHTML = `
        <td class="truncated-cell">
          <span class="id-badge">#${reporte.id}</span>
        </td>
        <td class="truncated-cell">${reporte.nombre}</td>
        <td class="truncated-cell">${formatDate(reporte.fechaReporte)}</td>
        <td class="truncated-cell">${reporte.descripcion}</td>
        <td class="truncated-cell">${nombreCompleto}</td>
        <td><span class="status-badge ${getStatusClass(reporte.estado)}">${reporte.estado || "-"}</span></td>
        <td class="truncated-cell">${reporte.id_contenedor}</td>
        <td class="quantity-cell">${reporte.collected_amount ?? "-"}</td>
        <td><span class="status-badge ${getStatusClass(reporte.container_status)}">${reporte.container_status}</span></td>
      `

      // Agregar event listener para abrir modal
      row.addEventListener("click", () => openReportModal(reporte, nombreCompleto, usuario))

      tableBody.appendChild(row)
    }
  } catch (error) {
    console.error("Error al cargar los reportes:", error)
    loadingState.style.display = "none"
    emptyState.style.display = "block"
    emptyState.querySelector("h3").textContent = "Error al cargar reportes"
    emptyState.querySelector("p").textContent = "Intenta nuevamente más tarde."
  }
})

// Crear el modal una sola vez
function createReportModal() {
  const modalHTML = `
    <div id="reportModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-header-content">
            <div class="report-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="header-text">
              <h2 id="modalTitle">Detalles del Reporte</h2>
              <p id="modalSubtitle">Información completa</p>
            </div>
          </div>
          <button class="modal-close" onclick="closeReportModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="report-summary">
            <div class="summary-item">
              <div class="summary-icon">
                <i class="fas fa-hashtag"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">ID del Reporte</span>
                <span class="summary-value" id="modalReportId">#000</span>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Fecha de Creación</span>
                <span class="summary-value" id="modalDate">--</span>
              </div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">
                <i class="fas fa-user"></i>
              </div>
              <div class="summary-content">
                <span class="summary-label">Creado por</span>
                <span class="summary-value" id="modalUser">--</span>
              </div>
            </div>
          </div>

          <div class="report-details">
            <div class="detail-section">
              <h3><i class="fas fa-info-circle"></i> Información General</h3>
              <div class="detail-grid">
                <div class="detail-card">
                  <label>Nombre del Reporte</label>
                  <div class="detail-value" id="modalName">--</div>
                </div>
                <div class="detail-card">
                  <label>Estado Actual</label>
                  <div class="detail-value" id="modalStatus">--</div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3><i class="fas fa-align-left"></i> Descripción</h3>
              <div class="description-card">
                <p id="modalDescription">--</p>
              </div>
            </div>

            <div class="detail-section">
              <h3><i class="fas fa-box"></i> Información del Contenedor</h3>
              <div class="detail-grid">
                <div class="detail-card">
                  <label>ID del Contenedor</label>
                  <div class="detail-value" id="modalContainerId">--</div>
                </div>
                <div class="detail-card">
                  <label>Estado del Contenedor</label>
                  <div class="detail-value" id="modalContainerStatus">--</div>
                </div>
                <div class="detail-card">
                  <label>Cantidad Recolectada</label>
                  <div class="detail-value quantity-highlight" id="modalQuantity">--</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="footer-actions">
            <button class="btn-secondary" onclick="closeReportModal()">
              <i class="fas fa-arrow-left"></i> Cerrar
            </button>
            <button class="btn-primary" onclick="printReport()">
              <i class="fas fa-print"></i> Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML("beforeend", modalHTML)
}

// Abrir modal con datos del reporte
function openReportModal(reporte, nombreCompleto, usuario) {
  const modal = document.getElementById("reportModal")

  // Llenar datos
  document.getElementById("modalTitle").textContent = `Reporte: ${reporte.nombre}`
  document.getElementById("modalSubtitle").textContent = `Creado el ${formatDate(reporte.fechaReporte)}`
  document.getElementById("modalReportId").textContent = `#${reporte.id}`
  document.getElementById("modalDate").textContent = formatDate(reporte.fechaReporte)
  document.getElementById("modalUser").textContent = nombreCompleto
  document.getElementById("modalName").textContent = reporte.nombre
  document.getElementById("modalDescription").textContent = reporte.descripcion
  document.getElementById("modalContainerId").textContent = reporte.id_contenedor
  document.getElementById("modalQuantity").textContent = reporte.collected_amount ?? "No especificada"

  // Status badges
  const statusElement = document.getElementById("modalStatus")
  statusElement.innerHTML = `<span class="status-badge ${getStatusClass(reporte.estado)}">${reporte.estado || "Sin estado"}</span>`

  const containerStatusElement = document.getElementById("modalContainerStatus")
  containerStatusElement.innerHTML = `<span class="status-badge ${getStatusClass(reporte.container_status)}">${reporte.container_status}</span>`

  // Mostrar modal con animación
  modal.classList.add("active")
  document.body.style.overflow = "hidden"
}

// Cerrar modal
function closeReportModal() {
  const modal = document.getElementById("reportModal")
  modal.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Función para imprimir reporte
function printReport() {
  const modalContent = document.querySelector(".modal-container")
  if (!modalContent) return

  html2pdf()
    .set({
      margin: 1,
      filename: `Reporte_${document.getElementById("modalReportId").textContent}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    })
    .from(modalContent)
    .save()
}



// Cerrar modal al hacer clic fuera
document.addEventListener("click", (e) => {
  const modal = document.getElementById("reportModal")
  if (e.target === modal) {
    closeReportModal()
  }
})

// Cerrar modal con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeReportModal()
  }
})

// Funciones auxiliares
function formatDate(dateString) {
  if (!dateString) return "--"
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusClass(status) {
  if (!status) return ""
  const statusLower = status.toLowerCase()
  if (statusLower.includes("activo") || statusLower.includes("completado") || statusLower.includes("lleno")) {
    return "active"
  } else if (statusLower.includes("pendiente") || statusLower.includes("proceso")) {
    return "pending"
  } else if (statusLower.includes("inactivo") || statusLower.includes("error")) {
    return "inactive"
  } else {
    return "processing"
  }
}

// Hacer funciones globales
window.closeReportModal = closeReportModal
window.printReport = printReport
