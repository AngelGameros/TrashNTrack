import { postContainer } from './Post.js';
import { getContainer } from './Gets.js';

export const sensorAliasMap = {
  temperature_C: 'Temperature_C',
  humidity_RH: 'Humidity_RH',
  air_Quality_Ppm: 'Air_Quality_Ppm',
  gas_Ppm: 'Gas_Ppm',
  distance_Cm: 'Distance_Cm',
  weight_Kg: 'Weight_Kg',
  is_Open: 'Is_Open',
  open_Count: 'Open_Count'
};


export const sensorCharts = {};
export let selectedCollection = 'Tipo I';
let empresaTurnGlobal = 23;



export const containers = [
  { name: 'Tipo I',descripcion:"" , id_empresa: 23, type: 1, maxWeight: 150, currentWeight: 10, empresaTurn: 1 },
  { name: 'Tipo II',descripcion:"" , id_empresa: 23, type: 2, maxWeight: 180, currentWeight: 10, empresaTurn: 1 },
  { name: 'Tipo III',descripcion:"" , id_empresa: 23, type: 3, maxWeight: 210, currentWeight: 10, empresaTurn: 1 }
];

let simulatorInterval = null;
let chartUpdateInterval = null;
let weightUpdateInterval = null;

function getNextEmpresaID(current) {
  return current === 25 ? 23 : current + 1;
}


function getRandomSensorValue(baseValue, maxVariation = 2.0) {
  const variation = (Math.random() * maxVariation * 2) - maxVariation;
  return parseFloat((baseValue + variation).toFixed(2));
}

export function generateContainerData(container) {
  const tipoNumero = container.name === 'Tipo I' ? 1 :
                    container.name === 'Tipo II' ? 2 :
                    container.name === 'Tipo III' ? 3
                    : '';

  let descripcion = '';
  switch (empresaTurnGlobal) {
    case 23: descripcion = `Sunrise ${tipoNumero}`; break;
    case 24: descripcion = `SMK ${tipoNumero}`; break;
    case 25: descripcion = `Tuvanosa ${tipoNumero}`; break;
    default: descripcion = `Genérico ${tipoNumero}`; break;
  }
  const data = {
    IdEmpresa: empresaTurnGlobal,
    Name: container.name,
    Descripcion: descripcion,
    Status: "active",
    Type: container.type,
    MaxWeight_kg: container.maxWeight,
    Values: {
      Temperature_C: getRandomSensorValue(25.0),
      Humidity_RH: getRandomSensorValue(70.0),
      Air_Quality_Ppm: getRandomSensorValue(400.0, 50.0),
      Gas_Ppm: getRandomSensorValue(10.0, 5.0),
      Distance_Cm: getRandomSensorValue(2.0, 1.0),
      Weight_Kg: container.currentWeight,
      Is_Open: Math.random() > 0.5 ? "true" : "false",
      Open_Count: Math.floor(getRandomSensorValue(5.0, 2.0)) // enteros
    }
  };

  empresaTurnGlobal = getNextEmpresaID(empresaTurnGlobal);
  return data;
}


export function sendContainerData(logCallback) {
  const container = containers.find(c => c.name === selectedCollection);
  if (!container) {
    logCallback?.(`Error: no existe configuración para "${selectedCollection}"`, 'error');
    return;
  }

  const data = generateContainerData(container);
  logCallback?.(`Enviando datos a "${selectedCollection}" con id_empresa ${data.id_empresa}`, 'info');

  postContainer(data, selectedCollection)
    .then(res => logCallback?.(`Envío OK: ${JSON.stringify(res)}`, 'success'))
    .catch(err => {
      logCallback?.(`Error al enviar: ${err.message}`, 'error');
      console.error(err);
    });
}

export function initCharts(collection) {
  Object.values(sensorAliasMap).forEach(sensor => {
    if (sensorCharts[sensor]) {
      sensorCharts[sensor].destroy();
    }
    const el = document.getElementById(`chart-${sensor}`);
    if (!el) return;
    sensorCharts[sensor] = Highcharts.chart(el, {
      chart: { type: 'line' },
      title: { text: sensor },
      xAxis: { type: 'datetime' },
      series: [{ name: sensor, data: [] }]
    });
  });
  updateCharts(collection);
}

export async function updateCharts(collection) {
  try {
    const resp = await getContainer(collection);
    const items = Array.isArray(resp?.data) ? resp.data :
                Array.isArray(resp) ? resp : [];

    const sensorData = {};
    items.forEach(item => {
      const raw = item.values;
      const ts = new Date(item.updatedAt || item.createdAt).getTime();
      Object.entries(raw).forEach(([k, v]) => {
        const key = sensorAliasMap[k];
        if (!key) return;
        sensorData[key] = sensorData[key] || [];
        sensorData[key].push([ts, v]);
      });
    });

    Object.entries(sensorData).forEach(([sensor, data]) => {
      const chart = sensorCharts[sensor];
      if (chart) chart.series[0].setData(data, true);
    });
  } catch (err) {
    console.error('Error updateCharts:', err);
  }
}

export function startSimulator(logCallback) {
  if (simulatorInterval) {
    logCallback?.("Simulador ya activo.", "warning");
    return;
  }

  logCallback?.(`Simulador iniciado para "${selectedCollection}"`, 'success');
  simulatorInterval = setInterval(() => sendContainerData(logCallback), 3000);
  chartUpdateInterval = setInterval(() => updateCharts(selectedCollection), 5000);
  weightUpdateInterval = setInterval(() => increaseWeight(logCallback), 10000); // 30 minutos
}

export function stopSimulator(logCallback) {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
  if (chartUpdateInterval) {
    clearInterval(chartUpdateInterval);
    chartUpdateInterval = null;
  }
  if (weightUpdateInterval) {
    clearInterval(weightUpdateInterval);
    weightUpdateInterval = null;
  }
  logCallback?.("Simulador detenido.", "info");
}

function increaseWeight(logCallback) {
  const timestamp = Date.now();

  containers.forEach(container => {
    container.currentWeight += 10;

    if (container.currentWeight >= container.maxWeight * 0.95) {
      logCallback?.(`⚠️ Contenedor "${container.name}" alcanzó el 95%. Vaciando...`, "warning");
      container.currentWeight = 0;
    } else {
      logCallback?.(`📦 "${container.name}" peso: ${container.currentWeight} kg`, "info");
    }

    // Actualizar gráfico de peso si existe
    const chart = sensorCharts['Weight_Kg'];
    if (chart && container.name === selectedCollection) {
      chart.series[0].addPoint([timestamp, container.currentWeight], true, chart.series[0].data.length >= 20);
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const selector   = document.getElementById('containerSelector');
  const btnStart   = document.getElementById('startButton');
  const btnStop    = document.getElementById('stopButton');
  const btnRefresh = document.getElementById('refreshButton');
  const logDiv     = document.getElementById('log');

  // logging helper
  function logMessage(msg, type = 'info') {
    if (!logDiv) return;
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    p.className = type;
    logDiv.prepend(p);
    while (logDiv.children.length > 50) {
      logDiv.removeChild(logDiv.lastChild);
    }
  }

  // llenar <select> con contenedores
  containers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    selector.appendChild(opt);
  });

  // estado inicial
  selector.value  = selectedCollection;
  btnStop.disabled = true;
  initCharts(selectedCollection);

  // cambiar colección
  selector.addEventListener('change', () => {
    selectedCollection = selector.value;
    logMessage(`Contenedor seleccionado: ${selectedCollection}`, 'info');
    initCharts(selectedCollection);
  });

  // iniciar
  btnStart.addEventListener('click', () => {
    startSimulator(logMessage);
    btnStart.disabled = true;
    btnStop.disabled  = false;
    selector.disabled = true;
  });

  // detener
  btnStop.addEventListener('click', () => {
    stopSimulator(logMessage);
    btnStart.disabled = false;
    btnStop.disabled  = true;
    selector.disabled = false;
  });

  // refrescar gráficas manual
  btnRefresh.addEventListener('click', () => {
    updateCharts(selectedCollection);
  });
});
