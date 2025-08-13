"use client";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../../config/Firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {
  const IP_URL = process.env.EXPO_PUBLIC_IP_URL;

  // Estados (sin cambios en la lógica)
  const [displayName, setDisplayName] = useState("");
  const [isLoadingName, setIsLoadingName] = useState(true);
  const [assignedTruck, setAssignedTruck] = useState(null);
  const [loadingTruck, setLoadingTruck] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Funciones de obtención de datos (sin cambios en la lógica)
  const fetchUserName = async () => {
    if (auth.currentUser) {
      setIsLoadingName(true);
      try {
        const docRef = doc(db, "usersApproval", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const nombre = userData.nombre || "";
          const apellidoPaterno = userData.apellidoPaterno || "";
          const fullName = [nombre, apellidoPaterno].filter(Boolean).join(" ");
          setDisplayName(fullName || auth.currentUser.email);
        } else {
          setDisplayName(auth.currentUser.email);
        }
      } catch (error) {
        console.error("Error fetching user name for HomeScreen:", error);
        setDisplayName(auth.currentUser.email);
      } finally {
        setIsLoadingName(false);
      }
    } else {
      setIsLoadingName(false);
    }
  };

  const fetchAssignedTruck = async () => {
    try {
      setLoadingTruck(true);
      const uid = auth.currentUser.uid;
      if (IP_URL) {
        const response = await fetch(`http://${IP_URL}:5000/api/camionasignado/${uid}`);
        const data = await response.json();
        setAssignedTruck(data.camion);
      } else {
        Alert.alert("Error de Configuración", "La URL del servidor no está definida. Contacta al administrador.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoadingTruck(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserName(), fetchAssignedTruck()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUserName();
    fetchAssignedTruck();
  }, []);

  // Función de ayuda para el estado (sin cambios)
  const getStatusDisplay = (status) => {
    switch (status) {
      case "activo":
        return { text: "ACTIVO", color: "#22c55e", backgroundColor: "#f0fdf4", icon: "check-circle" };
      case "en_mantenimiento":
        return { text: "EN MANTENIMIENTO", color: "#f59e0b", backgroundColor: "#fffbeb", icon: "build" };
      case "fuera_de_servicio":
        return { text: "FUERA DE SERVICIO", color: "#ef4444", backgroundColor: "#fef2f2", icon: "error" };
      default:
        return { text: "DESCONOCIDO", color: "#6b7280", backgroundColor: "#f3f4f6", icon: "help" };
    }
  };

  // --- [NUEVO DISEÑO] Pantalla de Carga ---
  if (loadingTruck || isLoadingName) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  // --- [NUEVO DISEÑO] Pantalla sin camión asignado ---
  if (!assignedTruck) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <ScrollView
          contentContainerStyle={styles.noTruckScrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} tintColor="#3b82f6" />
          }
        >
          <View style={styles.noTruckContainer}>
            <View style={styles.noTruckIconContainer}>
                <MaterialIcons name="local-shipping" size={60} color="#94a3b8" />
            </View>
            <Text style={styles.noTruckTitle}>Sin Camión Asignado</Text>
            <Text style={styles.noTruckText}>
              No tienes un camión asignado. Contacta a tu supervisor para más detalles.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusDisplay(assignedTruck.estado);

  // --- [NUEVO DISEÑO] Pantalla Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} tintColor="#3b82f6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta principal del camión */}
        <LinearGradient colors={["#3c5cc7ff", "#3b82f6"]} style={styles.truckCard}>
            <View style={styles.truckIconContainer}>
                <MaterialIcons name="local-shipping" size={40} color="#bfdbfe" />
            </View>
            <Text style={styles.truckName}>{assignedTruck.marca} {assignedTruck.modelo}</Text>
            <Text style={styles.truckId}>ID: {assignedTruck.idCamion}</Text>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <MaterialIcons name={statusInfo.icon} size={16} color="#FFFFFF" />
                <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
        </LinearGradient>

        {/* Información detallada */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Información del Vehículo</Text>
          <InfoRow icon="confirmation-number" label="Placas:" value={assignedTruck.placa} />
          <InfoRow icon="scale" label="Capacidad:" value={`${assignedTruck.capacidadCarga} kg`} />
          <InfoRow icon="timeline" label="Total Viajes:" value={assignedTruck.totalViajes} />
          <InfoRow icon="schedule" label="Último Viaje:" value={assignedTruck.ultimaFechaViaje ?? "N/A"} isLast />
        </View>

        {/* Botón de acción principal */}
        <TouchableOpacity style={styles.primaryActionButton} onPress={() => navigation.navigate("RouteTab")}>
            <MaterialIcons name="map" size={24} color="#1e3a8a" />
            <Text style={styles.actionButtonText}>VER RUTAS ASIGNADAS</Text>
            <MaterialIcons name="chevron-right" size={24} color="#1e3a8a" />
        </TouchableOpacity>


      </ScrollView>
    </SafeAreaView>
  );
}

// --- Componentes Auxiliares con Nuevo Diseño ---
const InfoRow = ({ icon, label, value, isLast = false }) => (
  <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
    <MaterialIcons name={icon} size={22} color="#64748b" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const StatItem = ({ icon, value, label, color }) => (
    <View style={styles.statItem}>
        <View style={[styles.statIconWrapper, { backgroundColor: `${color}20` }]}>
            <MaterialIcons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// --- [NUEVO DISEÑO] Hoja de Estilos ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // --- Tarjeta Principal del Camión ---
  truckCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  truckIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  truckName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  truckId: {
    fontSize: 16,
    color: "#dbeafe",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 8,
    textTransform: "uppercase",
  },
  // --- Botón de Acción Principal ---
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#e0e7ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  actionButtonText: {
    color: "#1e3a8a",
    fontSize: 14,
    fontWeight: "bold",
  },
  // --- Tarjeta de Estadísticas ---
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
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
  // --- Tarjeta de Detalles ---
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoRowLast: {
      borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    color: "#64748b",
    marginLeft: 16,
  },
  infoValue: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "600",
    marginLeft: 'auto',
  },
  // --- Estado sin Camión ---
  noTruckScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  noTruckContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    width: '100%',
  },
  noTruckIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noTruckTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  noTruckText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
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
});
