"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from "react-native"
import { Calendar, LocaleConfig } from "react-native-calendars"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { auth } from "../../config/Firebase/firebaseConfig"
import axios from "axios"

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  dayNamesShort: ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"],
  today: "Hoy",
}
LocaleConfig.defaultLocale = "es"

const CalendarScreen = () => {
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [collectionData, setCollectionData] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation()
  const [userId, setUserId] = useState(null)
  const IP_URL = process.env.EXPO_PUBLIC_IP_URL

  const getLocalDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  const [selectedDate, setSelectedDate] = useState(getLocalDateString())

  const fetchUserId = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.error("No hay usuario autenticado")
        throw new Error("No hay usuario autenticado")
      }
      const response = await fetch(`http://${IP_URL}:5000/api/usuarios/firebase/${currentUser.uid}`)
      if (!response.ok) {
        console.error("Error en respuesta:", response.status)
        throw new Error("Error al obtener datos del usuario")
      }
      const result = await response.json()
      if (!result?.usuario) {
        console.error("Respuesta no contiene usuario:", result)
        throw new Error("La respuesta no contiene datos de usuario")
      }
      return result.usuario.idUsuario
    } catch (error) {
      console.error("Error completo en fetchUserId:", error)
      throw error
    }
  }

  const fetchItinerarios = async (uid) => {
    try {
      const res = await axios.get(`http://${IP_URL}:5000/api/itinerarios/usuario/${uid}`)
      const data = res.data.data

      const grouped = {}

      data.forEach((it) => {
        if (it.estado.toLowerCase() === "cancelado") return

        // Extraer solo la parte de la fecha (YYYY-MM-DD) para la clave de agrupación
        const fecha = it.fechaProgramada.split("T")[0]
        if (!grouped[fecha]) grouped[fecha] = []

        // Función para formatear tiempo
        const formatTime = (dateString) => {
          if (!dateString) return "Sin hora"
          try {
            let date
            // Verificar si la cadena ya contiene información de zona horaria (Z, +HH:MM, -HH:MM)
            const hasTimezone = dateString.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateString)

            if (hasTimezone) {
              // Si tiene información de zona horaria, parsearla directamente
              date = new Date(dateString)
            } else {
              // Si no tiene información de zona horaria, asumir que es hora de Tijuana
              // y añadir el offset de Tijuana (UTC-07:00 durante PDT, que es común en agosto)
              // Esto asegura que se interprete como hora local de Tijuana desde el inicio.
              const dateWithTz = `${dateString}-07:00`
              date = new Date(dateWithTz)
            }

            // Formatear este objeto de fecha a la zona horaria deseada (Tijuana)
            return date.toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "America/Tijuana",
            })
          } catch (e) {
            console.error("Error al formatear la hora:", e, "para la cadena:", dateString)
            return "Sin hora"
          }
        }

        // Determinar el tiempo a mostrar basado en el estado
        let displayTime = "Sin hora"
        const estado = it.estado.toLowerCase()

        if (estado === "finalizada" && it.fechaFin) {
          displayTime = `Finalizada: ${formatTime(it.fechaFin)}`
        } else if (estado === "en_proceso" && it.fechaInicio) {
          displayTime = `Iniciada: ${formatTime(it.fechaInicio)}`
        } else if (estado === "iniciada" && it.fechaInicio) {
          displayTime = `Iniciada: ${formatTime(it.fechaInicio)}`
        } else if (it.fechaProgramada) {
          displayTime = `Programada: ${formatTime(it.fechaProgramada)}`
        }

        grouped[fecha].push({
          id: it.id,
          title: it.nombreRuta,
          time: displayTime,
          location: it.descripcionRuta,
          status: estado,
          details: {
            peso: calcularPeso(it.empresas),
            tipoResiduo: extraerTiposResiduo(it.empresas),
            notas: `Incluye ${contarEmpresas(it.empresas)} empresa(s)`,
          },
        })
      })

      setCollectionData(grouped)
    } catch (error) {
      console.error("Error al obtener itinerarios:", error)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    if (userId) {
      fetchItinerarios(userId).finally(() => setRefreshing(false))
    } else {
      setRefreshing(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUserId()
      .then((id) => setUserId(id))
      .catch((err) => console.error("No se pudo obtener el userId:", err))
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchItinerarios(userId)
      }
    }, [userId]),
  )

  const calcularPeso = (empresasJSON) => {
    try {
      const empresas = JSON.parse(empresasJSON)
      const total = empresas.reduce((sum, e) => sum + (e.peso_estimado || 0), 0)
      return `${total} kg estimados`
    } catch {
      return "Peso no disponible"
    }
  }

  const extraerTiposResiduo = (empresasJSON) => {
    try {
      const empresas = JSON.parse(empresasJSON)
      const tipos = new Set()
      empresas.forEach((emp) => emp.tipos_residuos.forEach((r) => tipos.add(r.nombre_tipo_residuo)))
      return Array.from(tipos).join(", ")
    } catch {
      return "Tipo no disponible"
    }
  }

  const contarEmpresas = (empresasJSON) => {
    try {
      return JSON.parse(empresasJSON).length
    } catch {
      return 0
    }
  }

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString)
  }

  const handleCollectionPress = (collection) => {
    setSelectedCollection(collection)
    setModalVisible(true)
  }

  const iniciarRuta = async (idItinerario) => {
    try {
      await axios.put(`http://${IP_URL}:5000/api/itinerarios/${idItinerario}/estado`, '"INICIADO"', {
        headers: { "Content-Type": "application/json" },
      })

      Alert.alert("Ruta iniciada", "Redirigiendo a tu ruta asignada...")
      setModalVisible(false)
      fetchItinerarios()

      navigation.navigate("Ruta")
    } catch (err) {
      console.error("Error al iniciar ruta:", err)
      Alert.alert("Error", "No se pudo actualizar el estado.")
    }
  }

  const markedDates = {}
  Object.keys(collectionData).forEach((date) => {
    const statuses = collectionData[date].map((c) => c.status)
    let dotColor = "#3b82f6" // Azul por defecto (programado/iniciado)

    // Si todas las rutas están finalizadas, verde
    if (statuses.every((s) => s === "finalizada")) {
      dotColor = "#16a34a"
    }
    // Si hay alguna en proceso, naranja
    else if (statuses.some((s) => s === "en_proceso")) {
      dotColor = "#f59e0b"
    }

    markedDates[date] = {
      marked: true,
      dotColor,
      selected: date === selectedDate,
    }
  })

  if (markedDates[selectedDate]) {
    markedDates[selectedDate].selectedColor = "#3b82f6"
  } else {
    markedDates[selectedDate] = { selected: true, selectedColor: "#3b82f6" }
  }

  const renderCollections = () => {
    const collections = collectionData[selectedDate]

    if (!collections || collections.length === 0) {
      return (
        <View style={styles.noCollections}>
          <View style={styles.noCollectionsIcon}>
            <MaterialIcons name="event-available" size={48} color="#3b82f6" />
          </View>
          <Text style={styles.noCollectionsTitle}>¡Día libre!</Text>
          <Text style={styles.noCollectionsText}>No hay recolecciones programadas para hoy.</Text>
        </View>
      )
    }

    return (
      <>
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={[
              styles.collectionCard,
              collection.status === "completado" ? styles.completedCard : styles.assignedCard,
            ]}
            onPress={() => handleCollectionPress(collection)}
          >
            <View style={styles.collectionHeader}>
              <View style={styles.collectionTimeContainer}>
                <MaterialIcons name="schedule" size={16} color="#64748b" />
                <Text style={styles.collectionTime}>{collection.time}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  collection.status === "finalizada"
                    ? styles.completedBadge
                    : collection.status === "en_proceso"
                      ? styles.inProgressBadge
                      : styles.assignedBadge,
                ]}
              >
                <MaterialIcons
                  name={
                    collection.status === "finalizada"
                      ? "check-circle"
                      : collection.status === "en_proceso"
                        ? "play-circle-filled"
                        : "schedule"
                  }
                  size={12}
                  color={
                    collection.status === "finalizada"
                      ? "#16a34a"
                      : collection.status === "en_proceso"
                        ? "#f59e0b"
                        : "#3b82f6"
                  }
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        collection.status === "finalizada"
                          ? "#16a34a"
                          : collection.status === "en_proceso"
                            ? "#f59e0b"
                            : "#3b82f6",
                    },
                  ]}
                >
                  {collection.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.collectionTitle}>{collection.title}</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="#64748b" />
              <Text style={styles.collectionLocation}>{collection.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="event" size={40} color="#bfdbfe" />
        </View>
        <Text style={styles.headerTitle}>Mi Calendario</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus recolecciones programadas</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} tintColor="#3b82f6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            style={styles.calendar}
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#64748b",
              selectedDayBackgroundColor: "#3b82f6",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#3b82f6",
              dayTextColor: "#1f2937",
              textDisabledColor: "#d1d5db",
              arrowColor: "#3b82f6",
              monthTextColor: "#1f2937",
              textMonthFontWeight: "bold",
              textDayFontFamily: "System",
              textMonthFontFamily: "System",
              textDayHeaderFontFamily: "System",
              textMonthFontSize: 18,
              textDayFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
            <Text style={styles.legendText}>Programado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#16a34a" }]} />
            <Text style={styles.legendText}>Completado</Text>
          </View>
        </View>

        {/* Selected Date Section */}
        <View style={styles.selectedDateContainer}>
          <Text style={styles.sectionTitle}>
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>

          {renderCollections()}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <MaterialIcons name="event" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.modalTitle}>{selectedCollection?.title}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={20} color="#3b82f6" />
                  <Text style={styles.detailText}>{selectedCollection?.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={20} color="#3b82f6" />
                  <Text style={styles.detailText}>{selectedCollection?.location}</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Detalles de la Carga</Text>
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Peso:</Text>
                  <Text style={styles.detailValue}>{selectedCollection?.details.peso}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Tipo de residuo:</Text>
                  <Text style={styles.detailValue}>{selectedCollection?.details.tipoResiduo}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Notas:</Text>
                  <Text style={styles.detailValue}>{selectedCollection?.details.notas}</Text>
                </View>
              </View>

              {selectedCollection?.status === "pendiente" && (
                <TouchableOpacity style={styles.startButton} onPress={() => iniciarRuta(selectedCollection.id)}>
                  <LinearGradient colors={["#16a34a", "#22c55e"]} style={styles.startButtonGradient}>
                    <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>INICIAR RUTA</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </ScrollView>
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
  calendarContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  selectedDateContainer: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  noCollections: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  noCollectionsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noCollectionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  noCollectionsText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  collectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  completedCard: {
    borderLeftColor: "#16a34a",
    borderLeftWidth: 4,
  },
  assignedCard: {
    borderLeftColor: "#3b82f6",
    borderLeftWidth: 4,
  },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  collectionTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionTime: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: "#dcfce7",
  },
  assignedBadge: {
    backgroundColor: "#dbeafe",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 4,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionLocation: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
    flex: 1,
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
    maxHeight: "85%",
  },
  closeButton: {
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 12,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
  },
  detailsContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  inProgressBadge: {
    backgroundColor: "#fef3c7",
  },
})

export default CalendarScreen
