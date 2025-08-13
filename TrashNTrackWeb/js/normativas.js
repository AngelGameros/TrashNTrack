const infoSections = [
  {
    id: "marcoLegal",
    title: "1. Marco Legal y Responsabilidades",
    icon: "📄",
    content:
      "Como recolector de residuos peligrosos industriales, es clave conocer el marco legal que regula tus operaciones y responsabilidades.",
    subItems: [
      {
        id: "lgpgir",
        title:
          "Ley General para la Prevención y Gestión Integral de los Residuos (LGPGIR)",
        content:
          "La ley fundamental en México para residuos peligrosos. Establece las bases para prevenir, valorizar y gestionar residuos peligrosos industriales, detallando obligaciones de generadores, transportistas y destinatarios.",
        link: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGPGIR.pdf",
      },
      {
        id: "nom052",
        title: "NOM-052-SEMARNAT-2005: Identificación de Residuos Peligrosos",
        content:
          "Define las características CRETIB (Corrosivo, Reactivo, Explosivo, Tóxico, Inflamable, Biológico-infeccioso) y el procedimiento para identificar y clasificar residuos peligrosos industriales. Es indispensable para tu labor diaria.",
        link: "https://www.dof.gob.mx/normasOficiales/1055/SEMARNA/SEMARNA.htm",
      },
      {
        id: "nom002sct",
        title: "NOM-002-SCT/2011: Transporte de Sustancias Peligrosas",
        content:
          "Norma esencial para el transporte terrestre de residuos peligrosos industriales: establece requisitos de embalaje, etiquetado, rotulado y condiciones de seguridad para los vehículos.",
        link: "https://www.dof.gob.mx/normasOficiales/4623/SCT2a/SCT2a.htm",
      },
      {
        id: "responsabilidades",
        title: "Responsabilidades Clave del Recolector",
        content:
          "• Verificar el etiquetado y estado de los envases.\n• Segregar adecuadamente los residuos según sus características.\n• Transportar de forma segura y con manifiestos.\n• Asegurar la entrega a destinatarios autorizados.",
      },
    ],
  },
  {
    id: "identificacion",
    title: "2. Identificación de Residuos (CRETIB)",
    icon: "🔍",
    content:
      "Debes identificar correctamente los residuos peligrosos industriales para su manejo seguro.",
    subItems: [
      {
        id: "cretib",
        title: "Características CRETIB",
        content:
          "• C: Corrosivo – Ácidos, álcalis fuertes.\n• R: Reactivo – Sustancias inestables.\n• E: Explosivo – Materiales que pueden detonar.\n• T: Tóxico – Metales pesados, solventes.\n• I: Inflamable – Aceites, disolventes, pinturas.",
      },
      {
        id: "senales",
        title: "Señales de Alerta",
        content:
          "• Olores químicos fuertes o inusuales.\n• Derrames, fugas o manchas.\n• Envases dañados o sin etiqueta.\n• Cambios en el color o textura de residuos conocidos.",
      },
    ],
  },
  {
    id: "epp",
    title: "3. Equipo de Protección Personal (EPP)",
    icon: "🛡️",
    content:
      "Tu seguridad es primero. Usa siempre el EPP adecuado cuando manejes residuos peligrosos industriales.",
    subItems: [
      {
        id: "eppIndispensable",
        title: "EPP Indispensable",
        content:
          "• Guantes resistentes a químicos.\n• Gafas de seguridad.\n• Mascarilla o respirador.\n• Calzado con puntera de acero.\n• Ropa de manga larga y chaleco reflectante.",
      },
      {
        id: "mantenimiento",
        title: "Mantenimiento del EPP",
        content:
          "• Inspecciona antes de cada uso.\n• Límpialo y almacénalo en buen estado.\n• Reemplázalo inmediatamente si está dañado.",
      },
    ],
  },
  {
    id: "recoleccion",
    title: "4. Procedimientos de Recolección y Segregación",
    icon: "📦",
    content:
      "Aplica procedimientos correctos al recolectar residuos peligrosos industriales para evitar riesgos.",
    subItems: [
      {
        id: "procedimiento",
        title: "Buenas Prácticas de Recolección",
        content:
          "• Evalúa el área antes de recoger.\n• Usa el EPP adecuado.\n• No mezcles residuos peligrosos con no peligrosos ni diferentes tipos de residuos peligrosos.\n• Utiliza herramientas como pinzas para evitar el contacto directo.",
      },
      {
        id: "etiquetado",
        title: "Etiquetado y Envase",
        content:
          "• Usa contenedores compatibles con el residuo.\n• Etiqueta cada recipiente con: nombre del residuo, características CRETIB, fecha de recolección, generador.\n• No llenes los envases hasta el tope.",
      },
    ],
  },
  {
    id: "transporte",
    title: "5. Transporte Seguro y Documentación",
    icon: "🚌",
    content:
      "Asegura el transporte correcto de residuos peligrosos industriales con la documentación requerida y las medidas de seguridad.",
    subItems: [
      {
        id: "documentacion",
        title: "Documentación Necesaria",
        content:
          "• Manifiesto de residuos peligrosos: documento legal que debe acompañar al transporte.\n• Permisos y autorizaciones vigentes.\n• Registro de entregas y recepciones.",
      },
      {
        id: "seguridad",
        title: "Medidas de Seguridad en el Transporte",
        content:
          "• Vehículos adecuados y en buen estado.\n• Señalización visible de residuos peligrosos.\n• Capacitación continua para conductores.\n• Uso de EPP durante carga y descarga.",
      },
    ],
  },
];

// Función para crear un elemento acordeón
function createAccordionItem(section) {
  const item = document.createElement("div");
  item.className = "accordion-item";

  // Header botón para accesibilidad
  const header = document.createElement("button");
  header.className = "accordion-header";
  header.setAttribute("aria-expanded", "false");
  header.setAttribute("aria-controls", `${section.id}-content`);
  header.id = `${section.id}-header`;
  header.type = "button";

  const headerContent = document.createElement("div");
  headerContent.className = "header-content";
  headerContent.innerHTML = `<span class="header-icon">${section.icon}</span> ${section.title}`;

  header.appendChild(headerContent);

  // Icono para indicar expansión
  const chevron = document.createElement("span");
  chevron.className = "icon-chevron";
  chevron.textContent = "▼";
  header.appendChild(chevron);

  // Contenido principal
  const content = document.createElement("div");
  content.className = "accordion-content";
  content.id = `${section.id}-content`;
  content.setAttribute("role", "region");
  content.setAttribute("aria-labelledby", header.id);

  const mainText = document.createElement("p");
  mainText.className = "accordion-text";
  mainText.textContent = section.content;
  content.appendChild(mainText);

  // Subitems (si hay)
  if (section.subItems && section.subItems.length) {
    section.subItems.forEach((sub) => {
      const subTitle = document.createElement("h3");
      subTitle.textContent = sub.title;
      subTitle.style.marginTop = "12px";
      content.appendChild(subTitle);

      const subText = document.createElement("p");
      subText.className = "accordion-text";
      subText.textContent = sub.content;
      content.appendChild(subText);

      if (sub.link) {
        const linkBtn = document.createElement("button");
        linkBtn.className = "link-button";
        linkBtn.textContent = "Ver documento oficial";
        linkBtn.type = "button";
        linkBtn.addEventListener("click", () => {
          window.open(sub.link, "_blank");
        });
        content.appendChild(linkBtn);
      }
    });
  }

  // Evento para abrir/cerrar acordeón
  header.addEventListener("click", () => {
    const expanded = header.getAttribute("aria-expanded") === "true";
    header.setAttribute("aria-expanded", !expanded);
    if (!expanded) {
      content.classList.add("expanded");
      chevron.textContent = "▲";
    } else {
      content.classList.remove("expanded");
      chevron.textContent = "▼";
    }
  });

  item.appendChild(header);
  item.appendChild(content);
  return item;
}

function renderAccordion() {
  const container = document.getElementById("accordionContainer");
  container.innerHTML = ""; // limpiar

  infoSections.forEach((section) => {
    const accordionItem = createAccordionItem(section);
    container.appendChild(accordionItem);
  });
}

// Botón refrescar (simula recarga)
document.getElementById("refreshBtn").addEventListener("click", () => {
  renderAccordion();
});

renderAccordion();
