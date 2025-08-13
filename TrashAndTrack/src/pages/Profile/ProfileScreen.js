"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from "react-native"
import { auth, db } from "../../config/Firebase/firebaseConfig"
import { doc, updateDoc } from "firebase/firestore"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

// Componente Principal de la Pantalla de Perfil
export default function ProfileScreen() {
  // Estado del Componente
  const IP_URL = process.env.EXPO_PUBLIC_IP_URL
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Efecto para Cargar Datos del Usuario
  useEffect(() => {
    fetchUserData()
  }, [])

  // Función para Obtener Datos del Usuario desde el Servidor
  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No hay usuario autenticado")

      const response = await fetch(`http://${IP_URL}:5000/api/usuarios/firebase/${currentUser.uid}`)
      if (!response.ok) throw new Error("Error al obtener datos del usuario")

      const result = await response.json()
      if (!result?.usuario) throw new Error("La respuesta no contiene datos de usuario")

      setUserData(result.usuario)
      setPhoneNumber(result.usuario.numeroTelefono || "")
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error)
      Alert.alert("Error", "No se pudo cargar la información del perfil")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Función de Refresco (Pull-to-refresh)
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchUserData()
  }, [])

  // Función para Actualizar el Número de Teléfono
  const handleUpdatePhone = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "El número de teléfono no puede estar vacío")
      return
    }

    if (phoneNumber === userData.numeroTelefono) {
      Alert.alert("Info", "No hay cambios que guardar")
      setIsEditing(false)
      return
    }

    setIsUpdating(true)

    try {
      const currentUser = auth.currentUser
      if (!currentUser?.uid) throw new Error("No hay usuario autenticado")

      // Actualización en la base de datos SQL
      const sqlResponse = await fetch(`http://${IP_URL}:5000/api/usuarios/phone`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_uid: currentUser.uid,
          numero_telefono: phoneNumber,
        }),
      })

      if (!sqlResponse.ok) throw new Error("Error al actualizar el número en SQL Server")

      // Actualización en Firestore
      const userDocRef = doc(db, "usersApproval", currentUser.uid)
      await updateDoc(userDocRef, { numeroTelefono: phoneNumber })

      setUserData((prev) => ({ ...prev, numeroTelefono: phoneNumber }))
      Alert.alert("Éxito", "Número de teléfono actualizado correctamente")
      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar el teléfono:", error)
      let errorMessage = "No se pudo actualizar el número de teléfono"
      if (error.code === "not-found") {
        errorMessage = "Documento de usuario no encontrado"
      } else if (error.message?.includes("permission-denied")) {
        errorMessage = "No tienes permiso para realizar esta acción"
      }
      Alert.alert("Error", errorMessage)
      setPhoneNumber(userData.numeroTelefono || "")
    } finally {
      setIsUpdating(false)
    }
  }

  // Renderizado Condicional: Pantalla de Carga
  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    )
  }

  // Renderizado Condicional: Pantalla de Error
  if (!userData) {
    return (
      <View style={styles.centeredScreen}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.errorIconContainer}>
          <MaterialIcons name="error-outline" size={60} color="#ef4444" />
        </View>
        <Text style={styles.errorTitle}>Error de Carga</Text>
        <Text style={styles.errorText}>No se pudo cargar la información del usuario.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Renderizado Principal de la Pantalla
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} tintColor="#3b82f6" />
        }
      >
        {/* Encabezado con Degradado */}
        <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userData.nombre + " " + userData.primerApellido,
                )}&background=e0e7ff&color=1e40af&size=128&fontSize=0.4&bold=true`,
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>
            {userData.nombre} {userData.primerApellido} {userData.segundoApellido}
          </Text>
          <Text style={styles.userRole}>{userData.tipoUsuario === "recolector" ? "Recolector" : "Administrador"}</Text>
        </LinearGradient>

        {/* Contenido Principal */}
        <View style={styles.contentContainer}>
          {/* Tarjeta de Información Personal */}
          <View style={styles.infoCard}>
            <InfoRow icon="mail-outline" label="Correo electrónico" value={userData.correo} />
            <InfoRow
              icon="phone-iphone"
              label="Teléfono"
              isEditing={isEditing}
              editComponent={
                <TextInput
                  style={styles.phoneInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="Ingresa tu número"
                  placeholderTextColor="#64748b"
                  autoFocus
                />
              }
              value={phoneNumber || "No proporcionado"}
            />
            <InfoRow icon="fingerprint" label="ID de usuario" value={userData.firebaseUid} isLast />
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionsContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={handleUpdatePhone} disabled={isUpdating}>
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons name="save" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Guardar Cambios</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setIsEditing(false)
                    setPhoneNumber(userData.numeroTelefono || "")
                  }}
                  disabled={isUpdating}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditing(true)}>
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Editar Teléfono</Text>
              </TouchableOpacity>
            )}
          </View>

         
         
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Componentes Auxiliares de UI
const InfoRow = ({ icon, label, value, isEditing, editComponent, isLast = false }) => (
  <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
    <MaterialIcons name={icon} size={22} color="#3b82f6" style={styles.infoIcon} />
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? editComponent : <Text style={styles.infoValue}>{value}</Text>}
    </View>
  </View>
)

const StatItem = ({ icon, value, label, color }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconWrapper, { backgroundColor: `${color}20` }]}>
      <MaterialIcons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

// Hoja de Estilos
const styles = StyleSheet.create({
  // Contenedores Principales
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centeredScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  contentContainer: {
    padding: 20,
    marginTop: -60, // Sube el contenido para que se solape con el header
  },

  // Encabezado de Perfil
  profileHeader: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 80, // Más padding para que la tarjeta de info quepa encima
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  userRole: {
    fontSize: 17,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    fontWeight: "500",
  },

  // Tarjetas de Contenido
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
  },

  // Filas de Información
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    marginRight: 15,
    marginTop: 3,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  phoneInput: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
    paddingVertical: 0,
  },

  // Botones de Acción
  actionsContainer: {
    marginTop: 30,
    gap: 15,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Sección de Estadísticas
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },

  // Textos de Estado (Carga/Error)
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 30,
  },
})
