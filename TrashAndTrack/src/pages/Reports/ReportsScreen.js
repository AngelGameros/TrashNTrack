"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import axios from "axios"
import { auth } from "../../config/Firebase/firebaseConfig"

export default function ReportsScreen({ route }) {
  const IP_URL = process.env.EXPO_PUBLIC_IP_URL
  const [activeTab, setActiveTab] = useState("create")

  // Empresas y selección
  const [empresas, setEmpresas] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState("")

  // Contenedores de empresa seleccionada
  const [contenedores, setContenedores] = useState([])

  // Formulario
  const [reportData, setReportData] = useState({
    reportName: "",
    descripcion: "",
    containerId: "",
    collectedAmount: "",
    containerStatus: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdReports, setCreatedReports] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loadingContenedores, setLoadingContenedores] = useState(false)

  const [idUsuario, setIdUsuario] = useState(null)
  const [idCamion, setIdCamion] = useState(null)

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          console.error("No hay usuario autenticado")
          return
        }
        const response = await fetch(`http://${IP_URL}:5000/api/usuarios/firebase/${currentUser.uid}`)
        if (!response.ok) throw new Error("Error al obtener datos del usuario")

        const result = await response.json()
        if (!result?.usuario?.idUsuario) throw new Error("La respuesta no contiene ID")

        setIdUsuario(result.usuario.idUsuario)
        console.log("ID de usuario asignado:", result.usuario.idUsuario)
      } catch (error) {
        console.error("Error al obtener ID del usuario:", error)
        Alert.alert("Error", "No se pudo obtener tu información de usuario.")
      }
    }

    fetchUserId()
  }, [])

  useEffect(() => {
    const fetchCamionAsignado = async () => {
      try {
        const uid = auth.currentUser?.uid
        if (!uid) return

        const res = await axios.get(`http://${IP_URL}:5000/api/camionasignado/${uid}`)
        if (res.data?.camion?.idCamion) {
          setIdCamion(res.data.camion.idCamion)
        } else {
          Alert.alert("Aviso", "No tienes un camión asignado.")
        }
      } catch (error) {
        console.error("Error al obtener camión asignado:", error.message)
        Alert.alert("Error", "No se pudo obtener tu camión asignado.")
      }
    }
    fetchCamionAsignado()
  }, [])

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await axios.get(`http://${IP_URL}:5000/api/empresas`)
        setEmpresas(res.data.data || [])
        if (res.data.data.length > 0) {
          setEmpresaSeleccionada(res.data.data[0].id)
        }
      } catch (e) {
        Alert.alert("Error", "No se pudieron cargar las empresas")
      }
    }
    fetchEmpresas()
  }, [])

  useEffect(() => {
    if (!empresaSeleccionada) return

    setLoadingContenedores(true)
    const fetchContenedores = async () => {
      try {
        const res = await axios.get(`http://${IP_URL}:5000/api/contenedores/empresa/${empresaSeleccionada}`)
        setContenedores(res.data.contenedores || [])
        setReportData((prev) => ({ ...prev, containerId: "" }))
      } catch (e) {
        Alert.alert("Error", "No se pudieron cargar los contenedores")
      } finally {
        setLoadingContenedores(false)
      }
    }
    fetchContenedores()
  }, [empresaSeleccionada])

  useEffect(() => {
    if (activeTab === "view") {
      fetchReports()
    }
  }, [activeTab])

  const fetchReports = async () => {
    setRefreshing(true)
    try {
      const uid = auth.currentUser.uid
      const response = await axios.get(`http://${IP_URL}:5000/api/reportes/uid/${uid}`)
      if (response.data.status === 0) {
        setCreatedReports(response.data.data)
      } else {
        Alert.alert("Error", response.data.message || "No se pudieron obtener los reportes.")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los reportes.")
    } finally {
      setRefreshing(false)
    }
  }

  const handleInputChange = (field, value) => {
    setReportData({ ...reportData, [field]: value })
  }

  const handleSubmitReport = async () => {
    const { reportName, containerId, collectedAmount, containerStatus, descripcion } = reportData

    if (!reportName || !containerId || !collectedAmount || !containerStatus) {
      Alert.alert("Campos incompletos", "Completa todos los campos obligatorios.")
      return
    }

    if (!idCamion) {
      Alert.alert("Sin camión asignado", "No se puede enviar el reporte sin un camión asignado.")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("nombre", reportName)
      formData.append("descripcion", descripcion || "")
      formData.append("idContenedor", Number.parseInt(containerId))
      formData.append("cantidadRecolectada", Number.parseFloat(collectedAmount))
      formData.append("estadoContenedor", containerStatus)
      formData.append("idUsuario", idUsuario)
      formData.append("idCamion", idCamion)

      const response = await axios.post(`http://${IP_URL}:5000/api/reportes/registrar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.status === 0) {
        Alert.alert("Éxito", "Reporte registrado correctamente.")
        setReportData({
          reportName: "",
          descripcion: "",
          containerId: "",
          collectedAmount: "",
          containerStatus: "",
        })
        setActiveTab("view")
        fetchReports()
      } else {
        Alert.alert("Error", response.data.message || "Error al registrar el reporte.")
      }
    } catch (error) {
      console.error("Error completo:", error.response?.data || error.message)
      Alert.alert("Error", error.response?.data?.message || "Hubo un error al registrar el reporte.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderReportItem = ({ item }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIconContainer}>
          <MaterialIcons name="description" size={24} color="#3b82f6" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{item.nombre}</Text>
          <Text style={styles.reportDate}>{item.fecha}</Text>
        </View>
      </View>
      <View style={styles.reportDetails}>
        <View style={styles.reportDetailRow}>
          <Text style={styles.reportDetailLabel}>ID Contenedor:</Text>
          <Text style={styles.reportDetailValue}>{item.containerId}</Text>
        </View>
        <View style={styles.reportDetailRow}>
          <Text style={styles.reportDetailLabel}>Cantidad Recolectada:</Text>
          <Text style={styles.reportDetailValue}>{item.collectedAmount}</Text>
        </View>
        <View style={styles.reportDetailRow}>
          <Text style={styles.reportDetailLabel}>Estado Contenedor:</Text>
          <Text style={styles.reportDetailValue}>{item.containerStatus}</Text>
        </View>
        {item.descripcion && (
          <View style={styles.reportDetailRow}>
            <Text style={styles.reportDetailLabel}>Descripción:</Text>
            <Text style={styles.reportDetailValue}>{item.descripcion}</Text>
          </View>
        )}
      </View>
    </View>
  )

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "create" && styles.activeTabButton]}
        onPress={() => setActiveTab("create")}
      >
        <MaterialIcons name="add-task" size={20} color={activeTab === "create" ? "#FFFFFF" : "#3b82f6"} />
        <Text style={[styles.tabButtonText, activeTab === "create" && styles.activeTabButtonText]}>Nuevo Reporte</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === "view" && styles.activeTabButton]}
        onPress={() => setActiveTab("view")}
      >
        <MaterialIcons name="view-list" size={20} color={activeTab === "view" ? "#FFFFFF" : "#3b82f6"} />
        <Text style={[styles.tabButtonText, activeTab === "view" && styles.activeTabButtonText]}>Ver Reportes</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCreateReport = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.formLabel}>Empresa:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={empresaSeleccionada}
            onValueChange={(itemValue) => setEmpresaSeleccionada(itemValue)}
            mode="dropdown"
            style={styles.picker}
          >
            {empresas.map((empresa) => (
              <Picker.Item key={empresa.id.toString()} label={empresa.nombre} value={empresa.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.formLabel}>Contenedor:</Text>
        {loadingContenedores ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingText}>Cargando contenedores...</Text>
          </View>
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={reportData.containerId}
              onValueChange={(val) => handleInputChange("containerId", val)}
              mode="dropdown"
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un contenedor" value="" />
              {contenedores.map((c) => (
                <Picker.Item
                  key={c.id.toString()}
                  label={`${c.id} - ${c.descripcion} (${c.tipoContenedor || "Sin tipo"})`}
                  value={c.id}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.formLabel}>Nombre del Reporte:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Recolección Norte"
          placeholderTextColor="#64748b"
          value={reportData.reportName}
          onChangeText={(text) => handleInputChange("reportName", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.formLabel}>Cantidad Recolectada (kg/L):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Ej: 500"
          placeholderTextColor="#64748b"
          value={reportData.collectedAmount}
          onChangeText={(text) => handleInputChange("collectedAmount", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.formLabel}>Estado del Contenedor:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Vacío"
          placeholderTextColor="#64748b"
          value={reportData.containerStatus}
          onChangeText={(text) => handleInputChange("containerStatus", text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.formLabel}>Descripción / Observaciones:</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="Detalles adicionales..."
          placeholderTextColor="#64748b"
          value={reportData.descripcion}
          onChangeText={(text) => handleInputChange("descripcion", text)}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmitReport}
        disabled={isSubmitting}
      >
        <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.submitButtonGradient}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>ENVIAR REPORTE</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="assessment" size={40} color="#bfdbfe" />
        </View>
        <Text style={styles.headerTitle}>Reportes de Recolección</Text>
        <Text style={styles.headerSubtitle}>Crea y gestiona tus reportes de trabajo</Text>
      </LinearGradient>

      <FlatList
        data={activeTab === "view" ? createdReports : []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReportItem}
        ListHeaderComponent={
          <>
            {renderTabs()}

            {activeTab === "create" && renderCreateReport()}

            {activeTab === "view" && createdReports.length === 0 && !refreshing && (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIconContainer}>
                  <MaterialIcons name="assignment" size={60} color="#94a3b8" />
                </View>
                <Text style={styles.emptyStateTitle}>Sin Reportes</Text>
                <Text style={styles.emptyStateText}>
                  No hay reportes creados aún. Crea tu primer reporte usando la pestaña "Nuevo Reporte".
                </Text>
              </View>
            )}
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchReports} colors={["#3b82f6"]} tintColor="#3b82f6" />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
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
  tabsContainer: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: "#3b82f6",
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  activeTabButtonText: {
    color: "#FFFFFF",
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: "#1f2937",
    height: 100,
    textAlignVertical: "top",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  picker: {
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#64748b",
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
  reportItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reportIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 13,
    color: "#64748b",
  },
  reportDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  reportDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reportDetailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  reportDetailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    margin: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
})
