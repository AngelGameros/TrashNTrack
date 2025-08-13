// public/js/contenedores.js

// Se importa la función para obtener los datos de tiempo real.
import { getContainer, getContenedores, getEmpresas } from "../DataConnection/Gets.js";
// Se importa la función para realizar la petición POST de tu API
import { postContenedor } from "../DataConnection/Post.js";

let allContainers = [];
let secondApiContainers = [];
let mainUpdateInterval = null;
let allCompanies = []; // Array para almacenar las empresas

const containerTypeMap = {
    1: "Contenedor Inteligente Orgánico",
    2: "Contenedor Básico Plástico",
    3: "Contenedor Químico Peligroso"
};

const cerradoIconPath = "../assets/contenedor_cerrado.svg";
const abiertoIconPath = "../assets/contenedor_abierto.svg";

function extractDataArray(apiResponse) {
    if (!apiResponse) {
        return [];
    }
    if (Array.isArray(apiResponse)) {
        return apiResponse;
    }
    if (apiResponse && Array.isArray(apiResponse.data)) {
        return apiResponse.data;
    }
    if (apiResponse && typeof apiResponse === 'object') {
        return [apiResponse];
    }
    console.warn("La respuesta de la API no es un arreglo o no contiene una propiedad 'data' con un arreglo.", apiResponse);
    return [];
}

function formatDate(isoString) {
    if (!isoString) return "N/A";
    try {
        const date = new Date(isoString);
        return date.toLocaleString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (e) {
        console.error("Error al dar formato a la fecha:", isoString, e);
        return "Fecha inválida";
    }
}

function calculateFillLevel(currentWeight_kg, maxWeight_kg) {
    if (currentWeight_kg == null || maxWeight_kg == null || maxWeight_kg <= 0) {
        return 0;
    }
    const fill = (currentWeight_kg / maxWeight_kg) * 100;
    return Math.max(0, Math.min(100, Math.round(fill)));
}

function getStatusClass(fillLevel) {
    if (fillLevel == null) return "status-offline";
    if (fillLevel >= 76) return "status-full";
    if (fillLevel >= 26) return "status-medium";
    return "status-empty";
}

function updateStatsCards() {
    const totalContainers = allContainers.length;
    let emptyCount = 0;
    let mediumCount = 0;
    let fullCount = 0;
    let offlineCount = 0;
    let totalFillLevel = 0;

    allContainers.forEach(container => {
        if (!container.values || container.values.weight_Kg == null || container.maxWeight_kg == null) {
            return;
        }

        const fillLevel = calculateFillLevel(container.values.weight_Kg, container.maxWeight_kg);
        totalFillLevel += fillLevel;

        if (fillLevel >= 76) {
            fullCount++;
        } else if (fillLevel >= 26) {
            mediumCount++;
        } else {
            emptyCount++;
        }
    });

    offlineCount = secondApiContainers.length;

    const averageFillLevel = totalContainers > 0 ? (totalFillLevel / totalContainers).toFixed(1) : 0;

    const emptyBinsEl = document.getElementById("emptyBinsCount");
    if (emptyBinsEl) emptyBinsEl.textContent = emptyCount;

    const mediumLevelEl = document.getElementById("mediumLevelCount");
    if (mediumLevelEl) mediumLevelEl.textContent = mediumCount;
    
    const fullBinsEl = document.getElementById("fullBinsCount");
    if (fullBinsEl) fullBinsEl.textContent = fullCount;
    
    const offlineSensorsEl = document.getElementById("offlineSensorsCount");
    if (offlineSensorsEl) offlineSensorsEl.textContent = offlineCount;

    const averageFillEl = document.getElementById("averageFillLevel");
    if (averageFillEl) averageFillEl.textContent = `${averageFillLevel}%`;
}


async function refreshAllContainers() {
    try {
        const containerTypes = ["Tipo I", "Tipo II", "Tipo III"];
        const promises = containerTypes.map(type => getContainer(type));
        
        const results = await Promise.all(promises);
        const allFetchedContainers = results.map(res => extractDataArray(res)).flat();
        
        const uniqueContainersMap = new Map();
        allFetchedContainers.forEach(container => {
            const key = `${container.idEmpresa}-${container.descripcion}`;
            if (!uniqueContainersMap.has(key) || new Date(container.updatedAt) > new Date(uniqueContainersMap.get(key).updatedAt)) {
                uniqueContainersMap.set(key, container);
            }
        });

        allContainers = Array.from(uniqueContainersMap.values());
        
        const secondApiResult = await getContenedores();
        secondApiContainers = extractDataArray(secondApiResult);
        
        updateStatsCards();
        renderContainers(allContainers);
        renderSecondApiContainers(secondApiContainers);

    } catch (error) {
        console.error("Error fatal al cargar los datos de los contenedores:", error);
        allContainers = [];
        secondApiContainers = [];
        const containersGrid = document.getElementById("containersGrid");
        if(containersGrid) {
            containersGrid.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar datos de contenedores activos.</p>';
        }
        const secondApiContainersGrid = document.getElementById("secondApiContainersGrid");
        if(secondApiContainersGrid) {
            secondApiContainersGrid.innerHTML = '<p class="text-red-500 text-center col-span-full">Error al cargar datos de contenedores inactivos.</p>';
        }
    }
}

function renderContainers(containersToRender) {
    const containersGrid = document.getElementById("containersGrid");
    if (!containersGrid) return;

    containersGrid.innerHTML = "";

    if (!containersToRender || containersToRender.length === 0) {
        containersGrid.innerHTML = '<p class="text-gray-500 text-center col-span-full">No se encontraron contenedores activos.</p>';
        return;
    }

    containersToRender.forEach((container) => {
        const fillLevel = calculateFillLevel(container.values.weight_Kg, container.maxWeight_kg);
        const statusClass = getStatusClass(fillLevel);
        
        // Se determina la ruta del icono SVG basado en el estado de 'is_Open'
        const isOpen = container.values.is_Open === "true";
        const svgPath = isOpen ? abiertoIconPath : cerradoIconPath;
        const altText = isOpen ? "Icono de contenedor abierto" : "Icono de contenedor cerrado";

        const containerCard = document.createElement("div");
        containerCard.className = `container-card`;
        containerCard.setAttribute("data-container-id", container.id);
        containerCard.setAttribute("data-idempresa", container.idEmpresa);

        containerCard.innerHTML = `
            <div class="card-header">
                <span class="card-name">${container.descripcion || "Sin descripción"}</span>
            </div>
            <div class="card-image cursor-pointer">
                <img src="${svgPath}" alt="${altText}" class="container-image-svg" />
            </div>
            <div class="card-metrics">
                <div class="metric-value">${container.values.temperature_C?.toFixed(1) || 'N/A'}°C</div>
            </div>
            <div class="fill-level-bar">
                <div class="fill-progress ${statusClass}" style="width: ${fillLevel}%"></div>
            </div>
            <div class="fill-level-text">Nivel: ${fillLevel}%</div>
        `;
        containersGrid.appendChild(containerCard);
    });

    attachCardListeners();
}


function renderSecondApiContainers(containersToRender) {
    const containersGrid = document.getElementById("secondApiContainersGrid");
    if (!containersGrid) return;
    
    containersGrid.innerHTML = "";

    if (!containersToRender || containersToRender.length === 0) { 
        containersGrid.innerHTML = '<p class="text-gray-500 text-center col-span-full">No se encontraron contenedores inactivos.</p>';
        return;
    }

    containersToRender.forEach((container) => {
        const containerCard = document.createElement("div");
        containerCard.className = `container-card`;
        containerCard.setAttribute("data-container-id", container.id);

        containerCard.innerHTML = `
            <div class="card-header">
                <span class="card-name">${container.descripcion || "Sin descripción"}</span>
            </div>
            <div class="card-image cursor-pointer">
                <img src="../assets/contenedor.svg" alt="Icono de contenedor básico" class="container-image-svg" />
            </div>
            <div class="card-metrics">
                <div class="metric-value">Sin datos</div>
            </div>
            <div class="fill-level-bar">
                <div class="fill-progress" style="width: 0%"></div>
            </div>
            <div class="fill-level-text">Nivel: N/A</div>
        `;
        containersGrid.appendChild(containerCard);
    });

    attachSecondApiCardListeners();
}

function attachCardListeners() {
    document.querySelectorAll("#containersGrid .container-card").forEach((card) => {
        card.onclick = () => {
            const containerId = card.dataset.containerId;
            if (containerId) {
                showViewContainerModal(containerId);
            }
        };
    });
}

function attachSecondApiCardListeners() {
    document.querySelectorAll("#secondApiContainersGrid .container-card").forEach((card) => {
        card.onclick = () => {
            const containerId = card.dataset.containerId;
            if (containerId) {
                showSecondApiModal(containerId);
            }
        };
    });
}

function showViewContainerModal(containerId) {
    const detailsDiv = document.getElementById("viewContainerDetails");
    detailsDiv.innerHTML = '<p class="text-center text-gray-500">Cargando datos detallados...</p>';
    document.getElementById("viewContainerModal").classList.remove("hidden");

    const container = allContainers.find(c => String(c.id) === containerId);
    
    if (!container) {
        detailsDiv.innerHTML = `<p class="text-center text-red-500">No se encontraron los datos del contenedor.</p>`;
        return;
    }

    const fillLevel = calculateFillLevel(container.values.weight_Kg, container.maxWeight_kg);
    const statusClass = getStatusClass(fillLevel);
    const statusText = statusClass.replace("status-", "").charAt(0).toUpperCase() + statusClass.slice(8);

    detailsDiv.innerHTML = `
        <h3 class="text-lg font-bold mb-4">Detalles - ${container.descripcion}</h3>
        <br>
        <div class="modal-info-row"><span class="modal-info-label">ID Empresa:</span><span class="modal-info-value">${container.idEmpresa}</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Nombre de Colección:</span><span class="modal-info-value">${container.name}</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Estado:</span><span class="modal-info-value status-indicator ${statusClass}">${statusText}</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Tipo de Contenedor:</span><span class="modal-info-value">${containerTypeMap[container.type] || 'N/A'}</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Peso Máximo:</span><span class="modal-info-value">${container.maxWeight_kg || "N/A"} kg</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Última Actualización:</span><span class="modal-info-value">${formatDate(container.updatedAt)}</span></div>
        <hr class="modal-divider">
        <h4 class="text-md font-semibold mt-4 mb-2">Datos de Sensores</h4>
        <br>
        <div class="modal-info-row"><span class="modal-info-label">Temp. (°C):</span><span class="modal-info-value">${container.values.temperature_C?.toFixed(2) || "N/A"}</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Humedad (%RH):</span><span class="modal-info-value">${container.values.humidity_RH?.toFixed(2) || "N/A"}</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Peso Actual (kg):</span><span class="modal-info-value">${container.values.weight_Kg?.toFixed(2) || "N/A"}</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Nivel de Llenado:</span><span class="modal-info-value">${fillLevel}%</span></div>
        <div class="modal-info-row"><span class="modal-info-label">Tapa Abierta:</span><span class="modal-info-value">${container.values.is_Open === "true" ? "Sí" : "No"}</span></div>
    `;
}

function showSecondApiModal(containerId) {
    const modal = document.getElementById("secondApiModal");
    const detailsDiv = document.getElementById("secondApiDetails");
    if (!modal || !detailsDiv) {
        console.error("Modal o div de detalles no encontrados.");
        return;
    }

    detailsDiv.innerHTML = `
        <h3 class="text-lg font-bold mb-4">Detalles del Contenedor</h3>
        <br>
        <p class="modal-info-row">Información no disponible para este contenedor.</p>
        <p class="modal-info-row">ID: ${containerId}</p>
    `;
    modal.classList.remove("hidden");
}

function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        modalElement.classList.add("hidden");
    }
}
window.closeModal = closeModal;


function handleContainerSearch() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    if (!searchTerm) {
        renderContainers(allContainers);
        renderSecondApiContainers(secondApiContainers);
        return;
    }

    const filtered = allContainers.filter(c =>
        (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm)) ||
        (String(c.id) && String(c.id).includes(searchTerm)) ||
        (String(c.idEmpresa) && String(c.idEmpresa).includes(searchTerm)) ||
        (String(c.name) && String(c.name).toLowerCase().includes(searchTerm))
    );
    const secondFiltered = secondApiContainers.filter(c =>
        (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm)) ||
        (String(c.id) && String(c.id).includes(searchTerm))
    );
    
    renderContainers(filtered);
    renderSecondApiContainers(secondFiltered);
}
window.handleContainerSearch = handleContainerSearch;


function switchTab(activeTabId, inactiveTabId, activeContentId, inactiveContentId) {
    document.getElementById(activeTabId).classList.add("active");
    document.getElementById(inactiveTabId).classList.remove("active");
    document.getElementById(activeContentId).classList.remove("hidden");
    document.getElementById(inactiveContentId).classList.add("hidden");
}

window.onload = async () => {
    const containersGrid = document.getElementById("containersGrid");
    if (containersGrid) {
        containersGrid.innerHTML = '<p class="text-center col-span-full">Cargando datos...</p>';
    }
    
    await refreshAllContainers();
    
    mainUpdateInterval = setInterval(refreshAllContainers, 5000);

    const activeTabBtn = document.getElementById("activeTabBtn");
    const inactiveTabBtn = document.getElementById("inactiveTabBtn");

    if (activeTabBtn) {
        activeTabBtn.addEventListener("click", () => {
            switchTab("activeTabBtn", "inactiveTabBtn", "containersGrid", "secondApiContainersGrid");
        });
    }

    if (inactiveTabBtn) {
        inactiveTabBtn.addEventListener("click", () => {
            switchTab("inactiveTabBtn", "activeTabBtn", "secondApiContainersGrid", "containersGrid");
        });
    }

    // Event listener para el botón de "Nuevo Bote"
    const newContainerBtn = document.getElementById("newContainerBtn");
    if (newContainerBtn) {
        newContainerBtn.addEventListener("click", showAddContainerModal);
    }
};

// =======================================
// Lógica del modal de registro de contenedor
// =======================================

function showAddContainerModal() {
    const modal = document.getElementById("addContainerModal");
    if (modal) {
        modal.classList.remove("hidden");
        // Cargamos las empresas al abrir el modal
        populateCompanySelect();
    }
}

async function populateCompanySelect() {
    const selectElement = document.getElementById("newContainerEmpresa");
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="">Cargando empresas...</option>';
    selectElement.disabled = true;

    try {
        const response = await getEmpresas();
        allCompanies = extractDataArray(response);
        
        selectElement.innerHTML = '';
        if (allCompanies.length > 0) {
            selectElement.disabled = false;
            selectElement.innerHTML += '<option value="" disabled selected>Selecciona una empresa</option>';
            allCompanies.forEach(company => {
                const option = document.createElement("option");
                option.value = company.id;
                option.textContent = company.nombre;
                selectElement.appendChild(option);
            });
        } else {
            selectElement.innerHTML = '<option value="">No hay empresas disponibles</option>';
        }
    } catch (error) {
        console.error("Error al cargar empresas:", error);
        selectElement.innerHTML = '<option value="">Error al cargar empresas</option>';
    }
}


// Event listener para el formulario de registro de contenedor
document.getElementById("addContainerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const formMessageEl = document.getElementById("formMessage");
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    formMessageEl.textContent = "Registrando contenedor...";
    formMessageEl.className = "text-yellow-500 text-center mt-4";

    const newContenedorData = {
        descripcion: form.newContainerDescripcion.value,
        fecha_registro: new Date().toISOString().slice(0, 10), // Fecha actual en formato YYYY-MM-DD
        id_empresa: parseInt(form.newContainerEmpresa.value),
        id_tipo_contenedor: Math.floor(Math.random() * 3) + 1 // Número aleatorio entre 1 y 3
    };

    try {
        // AQUI CAMBIAMOS LA LLAMADA
        const result = await postContenedor(newContenedorData);
        formMessageEl.textContent = result.message || "Contenedor registrado con éxito!";
        formMessageEl.className = "text-green-500 text-center mt-4";
        
        setTimeout(() => {
            closeModal('addContainerModal');
            refreshAllContainers();
        }, 2000);
        
    } catch (error) {
        const errorMessage = error.message || "Error al registrar el contenedor.";
        formMessageEl.textContent = errorMessage;
        formMessageEl.className = "text-red-500 text-center mt-4";
    } finally {
        submitBtn.disabled = false;
    }
});


// Event listener para el botón de cerrar del modal
document.querySelector('#addContainerModal .modal-close-btn').addEventListener('click', () => {
    closeModal('addContainerModal');
}); 