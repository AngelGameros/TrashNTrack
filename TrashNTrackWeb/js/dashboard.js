import { getCamiones,getRutas,getContenedores, getUsuarios,getContainer} from "../DataConnection/Gets.js";


async function loadInfo(){
    try{
        //llamada a los métodos
        const Camiones = await getCamiones();
        const Rutas = await getRutas();
        const Contenedores = await getContenedores();
        const Usuarios = await getUsuarios();

        //mapeo de las funciones
        const infoCamiones = Camiones.camiones || [];
        const infoRutas = Rutas.data || [];
        const infoContenedores = Contenedores.data || [];
        const infoUsuarios = Usuarios.usuarios || [];

        //conteo de datos
        const totalCamiones = infoCamiones.length;
        const totalRutas = infoRutas.length;
        const totalContenedores = infoContenedores.length;
        const totalUsuarios = infoUsuarios.length;

        const ContadorCamiones = document.getElementById("ContadorCamiones");
        const contadorContenedores = document.getElementById("contadorContenedores");
        const contadorRutas = document.getElementById("contadorRutas");
        const contadorUsuarios = document.getElementById("contadorUsuarios");


        const collections = [
          "Tipo I",
          "Tipo II",
          "Tipo III"
        ];


        await renderBarChart(collections, "gas_Ppm", "chartGasPorEmpresa", "Gas PPM por Empresa");
        await renderBarChart(collections, "humidity_RH", "chartHumedadPorEmpresa", "Humedad Relativa por Empresa");
        await renderBarChart(collections, "temperature_C", "chartTemperaturaPorEmpresa", "Temperatura por Empresa");
        await renderWeightGauges(collections);


        if(ContadorCamiones){ContadorCamiones.textContent = totalCamiones;}
        if(contadorContenedores){contadorContenedores.textContent = totalContenedores;}
        if(contadorRutas){contadorRutas.textContent = totalRutas;}
        if(contadorUsuarios){contadorUsuarios.textContent = totalUsuarios;}


    }
    catch(error){throw (error);}
}



// ==========================
// CONFIGURACIÓN DEL GAUGE
// ==========================
function createGauge(containerId, title, value) {
  Highcharts.chart(containerId, {
    chart: { type: 'gauge', backgroundColor: null },
    title: { text: title },
    pane: {
      startAngle: -150,
      endAngle: 150,
      background: [{ outerRadius: '100%', innerRadius: '60%' }]
    },
    yAxis: {
      min: 0,
      max: 1000,
      title: { text: 'Peso (Kg)' },
      plotBands: [
        { from: 0, to: 500, color: '#80cbc4' },      // verde celeste
        { from: 500, to: 750, color: '#fdd835' },    // amarillo
        { from: 750, to: 1000, color: '#e53935' }    // rojo
      ]
    },
    series: [{
      name: 'Peso',
      data: [value],
      tooltip: { valueSuffix: ' kg' }
    }]
  });
}
// ==========================
// RENDERIZAR GAUGES
// ==========================
export async function renderWeightGauges(collections) {
  const responses = await Promise.all(collections.map(c => getContainer(c)));

  const allData = responses.map((resp, i) => ({
    name: collections[i],
    items: Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : []
  }));

  allData.forEach(({ name, items }) => {
    const empresaMap = {};

    items.forEach(item => {
      const idEmpresa = item.idEmpresa;
      const weight = item.values?.weight_Kg || 0;
      if (!empresaMap[idEmpresa]) empresaMap[idEmpresa] = [];
      empresaMap[idEmpresa].push(weight);
    });

    Object.entries(empresaMap).forEach(([id, weights]) => {
      const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
      const divId = `gauge-${name}-${id}`;
      const parent = document.getElementById('gaugeContainer');
      const div = document.createElement('div');
      div.id = divId;
      div.style.height = '300px';
      parent.appendChild(div);
      createGauge(divId, `${name} - Empresa ${id}`, avg);
    });
  });
}

// ==========================
// GRÁFICA DE BARRAS
// ==========================
export async function renderBarChart(collections, sensorKey, chartElementId, chartTitle) {
  try {
    const allResponses = await Promise.all(
      collections.map(name => getContainer(name))
    );

    const series = [];

    allResponses.forEach((resp, index) => {
      const data = Array.isArray(resp?.data) ? resp.data :
                   Array.isArray(resp) ? resp : [];

      const empresaSensorMap = {};

      data.forEach(item => {
        const empresaId = item.idEmpresa;
        const value = item.values?.[sensorKey] || 0;
        if (!empresaSensorMap[empresaId]) empresaSensorMap[empresaId] = [];
        empresaSensorMap[empresaId].push(value);
      });

      const serieData = Object.entries(empresaSensorMap).map(([empresaId, values]) => {
        const promedio = values.reduce((a, b) => a + b, 0) / values.length;
        return { name: `Empresa ${empresaId}`, y: parseFloat(promedio.toFixed(2)) };
      });

      series.push({
        name: collections[index],
        data: serieData
      });
    });

    const chartDiv = document.getElementById(chartElementId);
    if (!chartDiv) {
      console.warn(`Elemento ${chartElementId} no encontrado`);
      return;
    }

    Highcharts.chart(chartDiv, {
      chart: { type: 'column' },
      title: { text: chartTitle },
      xAxis: {
        type: 'category',
        title: { text: 'Empresa' },
        categories: ["Empresa 23", "Empresa 24", "Empresa 25"]
      },
      yAxis: {
        title: { text: sensorKey.replace(/_/g, ' ') }
      },
      plotOptions: {
        column: {
          grouping: true,
          groupPadding: 0.2
        }
      },
      series: series
    });
  } catch (err) {
    console.error(`Error generando gráfica de ${sensorKey}:`, err);
  }
}


// ==========================
// INICIALIZACIÓN
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  await loadInfo();

  const collections = [
    "ContenedorInteligenteOrganico",
    "ContenedorBasicoPlastico",
    "ContenedorQuimicoPeligroso"
  ];

  await renderWeightGauges(collections);
});

