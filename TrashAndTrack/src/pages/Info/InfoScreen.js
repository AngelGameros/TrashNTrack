"use client"

import { useState, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

// Datos de las secciones (sin cambios)
const infoSections = [
  {
    id: "marcoLegal",
    title: "1. Marco Legal y Responsabilidades",
    icon: "gavel",
    content:
      "Como recolector de residuos peligrosos industriales, es clave conocer el marco legal que regula tus operaciones y responsabilidades.",
    subItems: [
      {
        id: "lgpgir",
        title: "Ley General para la Prevención y Gestión Integral de los Residuos (LGPGIR)",
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
    icon: "science",
    content: "Debes identificar correctamente los residuos peligrosos industriales para su manejo seguro.",
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
    icon: "security",
    content: "Tu seguridad es primero. Usa siempre el EPP adecuado cuando manejes residuos peligrosos industriales.",
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
    title: "4. Procedimientos de Recolección",
    icon: "inventory-2",
    content: "Aplica procedimientos correctos al recolectar residuos peligrosos industriales para evitar riesgos.",
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
    id: "emergencias",
    title: "5. Manejo de Emergencias",
    icon: "warning-amber",
    content: "Debes estar preparado para responder ante incidentes durante el manejo o transporte.",
    subItems: [
      {
        id: "derrames",
        title: "En Caso de Derrame",
        content:
          "• Activa tu EPP.\n• Contén el derrame con material absorbente.\n• Coloca el residuo contaminado en un recipiente seguro y etiquétalo.\n• Reporta el incidente.",
      },
      {
        id: "contacto",
        title: "En Caso de Contacto o Exposición",
        content:
          "• Lava la zona afectada con agua y jabón.\n• Retira ropa contaminada.\n• Busca atención médica inmediata.",
      },
      {
        id: "numeros",
        title: "Números de Emergencia",
        content:
          "• Emergencias: 911\n• CENACOM (para emergencias químicas): 800 00 45226\n• Protección Civil Local: busca el número en tu localidad.",
      },
    ],
  },
]

// Componente de Acordeón
const AccordionItem = ({ title, content, icon, subItems, link, isSubItem = false }) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) => Alert.alert("Error", "No se pudo abrir el enlace: " + url))
  }

  return (
    <View style={[styles.accordionContainer, isSubItem && styles.subAccordionContainer]}>
      <TouchableOpacity onPress={toggleExpand} style={styles.accordionHeader}>
        {icon && (
          <View style={styles.iconWrapper}>
            <MaterialIcons name={icon} size={24} color="#3b82f6" />
          </View>
        )}
        <Text style={[styles.accordionTitle, !icon && styles.accordionTitleNoIcon]}>{title}</Text>
        <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={28} color="#64748b" />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.accordionContent}>
          {content && <Text style={styles.accordionText}>{content}</Text>}
          {link && (
            <TouchableOpacity onPress={() => handleLinkPress(link)} style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Ver Documento Oficial</Text>
              <MaterialIcons name="open-in-new" size={16} color="#1e40af" />
            </TouchableOpacity>
          )}
          {subItems &&
            subItems.map((subItem) => (
              <AccordionItem
                key={subItem.id}
                title={subItem.title}
                content={subItem.content}
                link={subItem.link}
                isSubItem={true}
              />
            ))}
        </View>
      )}
    </View>
  )
}

// Pantalla de Información
export default function InfoScreen() {
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }, [])

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="info-outline" size={40} color="#bfdbfe" />
        </View>
        <Text style={styles.headerTitle}>Centro de Información</Text>
        <Text style={styles.headerSubtitle}>Guía esencial para recolectores</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} tintColor="#3b82f6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {infoSections.map((section) => (
          <AccordionItem
            key={section.id}
            title={section.title}
            content={section.content}
            icon={section.icon}
            subItems={section.subItems}
          />
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// Hoja de Estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  // Header
  header: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    margin: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  headerIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#dbeafe",
    textAlign: "center",
  },
  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  // Acordeón
  accordionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  subAccordionContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginTop: 12,
    shadowColor: "transparent",
    elevation: 0,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  accordionTitleNoIcon: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  accordionText: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 16,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#e2e8f0",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  linkButtonText: {
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
})
