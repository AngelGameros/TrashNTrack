"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as ImagePicker from "expo-image-picker"
import { auth } from "../../config/Firebase/firebaseConfig"

const formatDateTime = (dateObj) => {
  if (!dateObj) return ""
  return new Date(dateObj).toLocaleString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Tijuana",
  })
}

const IncidentsScreen = () => {
  const [incidentName, setIncidentName] = useState("")
  const [incidentDescription, setIncidentDescription] = useState("")
  const [incidentImage, setIncidentImage] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const IP_URL = process.env.EXPO_PUBLIC_IP_URL

  const uid = auth.currentUser?.uid

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`http://${IP_URL}:5000/api/incidentesporusuario/${uid}`)
      const data = await res.json()

      if (data.status === 0 && Array.isArray(data.data)) {
        const formatted = data.data.map((incidente) => ({
          id: incidente.id,
          userId: incidente.idUsuario,
          name: incidente.nombre,
          description: incidente.descripcion,
          date: parseDateString(incidente.fechaIncidente),
          imageUri: incidente.photoUrl,
        }))

        setIncidents(formatted)
      } else {
        setIncidents([])
        Alert.alert("Sin datos", data.message || "No hay incidentes.")
      }
    } catch (error) {
      setIncidents([])
      Alert.alert("Error", "No se pudo conectar al servidor de incidentes.")
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchIncidents()
    setRefreshing(false)
  }

  const parseDateString = (dateString) => {
    if (!dateString) return new Date()
    return new Date(dateString)
  }

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permiso Requerido", "Necesitas acceso a la cámara.")
      return false
    }
    return true
  }

  const takePhoto = async () => {
    if (!(await requestCameraPermission())) return
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    })
    if (!result.canceled && result.assets.length > 0) setIncidentImage(result.assets[0])
  }

  const uploadToCloudinary = async () => {
    const form = new FormData()
    const ts = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)
    const fileName = `${ts}_${auth.currentUser.uid}.jpg`
    form.append("file", {
      uri: incidentImage.uri,
      name: fileName,
      type: "image/jpeg",
    })
    form.append("upload_preset", "incidentes_app")
    form.append("cloud_name", "dlkonkhzu")

    const res = await fetch("https://api.cloudinary.com/v1_1/dlkonkhzu/image/upload", {
      method: "POST",
      body: form,
    })
    const json = await res.json()
    return json.secure_url
  }

  const handleSaveIncident = async () => {
    if (!incidentName || !incidentDescription || !incidentImage) {
      Alert.alert("Faltan datos", "Completa todos los campos y toma una foto.")
      return
    }

    try {
      const imageUrl = await uploadToCloudinary()
      const nowUtc = new Date().toISOString()

      const form = new FormData()
      form.append("nombre", incidentName)
      form.append("descripcion", incidentDescription)
      form.append("fechaIncidente", nowUtc)
      form.append("firebaseUid", uid)
      form.append("foto", imageUrl)

      const res = await fetch(`http://${IP_URL}:5000/api/incidentesporusuario`, {
        method: "POST",
        body: form,
      })

      const data = await res.json()

      if (data.status === 0) {
        Alert.alert("Éxito", "Incidente registrado correctamente.")
        setIncidentName("")
        setIncidentDescription("")
        setIncidentImage(null)
        setShowForm(false)
        fetchIncidents()
      } else {
        Alert.alert("Error", data.message || "No se pudo registrar.")
      }
    } catch (err) {
      Alert.alert("Error", "Error al guardar incidente: " + err.message)
    }
  }

  const handleViewIncident = (incident) => {
    setSelectedIncident(incident)
    setModalVisible(true)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="report-problem" size={40} color="#bfdbfe" />
        </View>
        <Text style={styles.headerTitle}>Gestión de Incidentes</Text>
        <Text style={styles.headerSubtitle}>Reporta y gestiona incidentes de recolección</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} tintColor="#3b82f6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Buttons */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, !showForm && styles.activeTabButton]}
            onPress={() => setShowForm(false)}
          >
            <MaterialIcons name="list" size={20} color={!showForm ? "#FFFFFF" : "#3b82f6"} />
            <Text style={[styles.tabButtonText, !showForm && styles.activeTabButtonText]}>Ver Incidentes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, showForm && styles.activeTabButton]}
            onPress={() => setShowForm(true)}
          >
            <MaterialIcons name="add-circle-outline" size={20} color={showForm ? "#FFFFFF" : "#3b82f6"} />
            <Text style={[styles.tabButtonText, showForm && styles.activeTabButtonText]}>Nuevo Incidente</Text>
          </TouchableOpacity>
        </View>

        {showForm ? (
          <View style={styles.formContainer}>
            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre del Incidente</Text>
              <TextInput
                placeholder="Ej: Derrame de aceite"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={incidentName}
                onChangeText={setIncidentName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripción Detallada</Text>
              <TextInput
                placeholder="Describe el incidente con el mayor detalle posible..."
                placeholderTextColor="#64748b"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                value={incidentDescription}
                onChangeText={setIncidentDescription}
              />
            </View>

            {/* Photo Section */}
            <View style={styles.photoSection}>
              <Text style={styles.inputLabel}>Evidencia Fotográfica</Text>
              <TouchableOpacity style={styles.buttonWrapper} onPress={takePhoto}>
                <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.buttonGradient}>
                  <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Tomar Foto</Text>
                </LinearGradient>
              </TouchableOpacity>

              {incidentImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: incidentImage.uri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setIncidentImage(null)}>
                    <MaterialIcons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.buttonWrapper} onPress={handleSaveIncident}>
              <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.buttonGradient}>
                <MaterialIcons name="save" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Guardar Incidente</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {incidents.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIconContainer}>
                  <MaterialIcons name="assignment-late" size={60} color="#94a3b8" />
                </View>
                <Text style={styles.emptyStateTitle}>Sin Incidentes Reportados</Text>
                <Text style={styles.emptyStateText}>
                  Aún no has reportado ningún incidente. Usa el botón "Nuevo Incidente" para comenzar.
                </Text>
              </View>
            ) : (
              incidents.map((incident) => (
                <TouchableOpacity
                  key={incident.id.toString()}
                  style={styles.incidentCard}
                  onPress={() => handleViewIncident(incident)}
                >
                  <View style={styles.incidentCardHeader}>
                    <View style={styles.incidentIconContainer}>
                      <MaterialIcons name="warning" size={24} color="#f59e0b" />
                    </View>
                    <View style={styles.incidentCardInfo}>
                      <Text style={styles.incidentCardTitle}>{incident.name}</Text>
                      <Text style={styles.incidentCardDate}>{formatDateTime(incident.date)}</Text>
                    </View>
                    {incident.imageUri && (
                      <View style={styles.imageIndicator}>
                        <MaterialIcons name="image" size={20} color="#3b82f6" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.incidentCardDescription} numberOfLines={2}>
                    {incident.description}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>

            {selectedIncident && (
              <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIconContainer}>
                    <MaterialIcons name="report-problem" size={32} color="#f59e0b" />
                  </View>
                  <Text style={styles.modalTitle}>{selectedIncident.name}</Text>
                  <Text style={styles.modalDate}>{formatDateTime(selectedIncident.date)}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Descripción del Incidente</Text>
                  <Text style={styles.modalDescription}>{selectedIncident.description}</Text>
                </View>

                {selectedIncident.imageUri && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Evidencia Fotográfica</Text>
                    <Image source={{ uri: selectedIncident.imageUri }} style={styles.modalImage} />
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  photoSection: {
    marginBottom: 20,
  },
  // New common styles for buttons with gradient and shadow
  buttonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    // Specific shadow color will be applied directly to the wrapper
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24, // Added horizontal padding for better spacing
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16, // Consistent font size
    fontWeight: "600", // Consistent font weight
    marginLeft: 8,
  },
  // Apply specific shadow colors to the button wrappers
  photoButton: {
    shadowColor: "#16a34a", // Green shadow for photo button
  },
  submitButton: {
    shadowColor: "#3b82f6", // Blue shadow for submit button
  },
  imagePreviewContainer: {
    marginTop: 16,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#ffffff",
    borderRadius: 24,
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
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  incidentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  incidentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  incidentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  incidentCardInfo: {
    flex: 1,
  },
  incidentCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  incidentCardDate: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  imageIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  incidentCardDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalCloseButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  modalScrollContent: {
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 10,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  modalDate: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 24,
  },
  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
})

export default IncidentsScreen
