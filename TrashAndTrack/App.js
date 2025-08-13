// App.js
"use client"
import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "./src/config/Firebase/firebaseConfig"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons } from "@expo/vector-icons"

// --- Pantallas (Sin cambios) ---
import LoginScreen from "./src/pages/Login/LoginScreen"
import HomeScreen from "./src/pages/Home/HomeScreen"
import ProfileScreen from "./src/pages/Profile/ProfileScreen"
import RouteScreen from "./src/pages/Route/RouteScreen"
import CalendarScreen from "./src/pages/Calendar/CalendarScreen"
import ScanScreen from "./src/pages/Scan/ScanScreen"
import ReportsScreen from "./src/pages/Reports/ReportsScreen"
import IncidentsScreen from "./src/pages/Incidents/IncidentsScreen"
import InfoScreen from "./src/pages/Info/InfoScreen"
import ChatScreen from "./src/pages/Chat/ChatScreen"

// --- Constantes (Sin cambios) ---
const STATUS_PENDING = 0
const STATUS_APPROVED = 1
const STATUS_REJECTED = 2

// --- Navegadores (Sin cambios) ---
const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()
const MoreStack = createNativeStackNavigator()

// --- [NUEVO DISEÑO] Componente de Cabecera Personalizada ---
function CustomHeader({ userName, navigation, title }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.log("Error al cerrar sesión:", e)
    }
  }

  return (
    <View>
      <LinearGradient colors={["#15285dff", "#11479dff"]} style={styles.headerContainer}>
        <SafeAreaView>
          <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerGreeting}>Bienvenido de vuelta,</Text>
              <Text style={styles.headerUserName} numberOfLines={1}>
                {userName || "Usuario"}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {/* Botón de Avatar */}
              <TouchableOpacity style={styles.headerButton} onPress={() => setShowProfileMenu(!showProfileMenu)}>
                <View style={styles.avatar}>
                  <MaterialIcons name="person" size={24} color="#3b82f6" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Menú desplegable del perfil */}
      {showProfileMenu && (
        <View style={styles.profileMenu}>
          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => {
              setShowProfileMenu(false)
              navigation.navigate("MoreTab", { screen: "Profile" })
            }}
          >
            <MaterialIcons name="person-outline" size={22} color="#4b5563" />
            <Text style={styles.profileMenuText}>Mi Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => {
              setShowProfileMenu(false)
              navigation.navigate("MoreTab", { screen: "Info" })
            }}
          >
            <MaterialIcons name="info-outline" size={22} color="#4b5563" />
            <Text style={styles.profileMenuText}>Información</Text>
          </TouchableOpacity>
          <View style={styles.profileMenuDivider} />
          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => {
              setShowProfileMenu(false)
              handleSignOut()
            }}
          >
            <MaterialIcons name="logout" size={22} color="#ef4444" />
            <Text style={[styles.profileMenuText, styles.signOutText]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// --- Componentes de Navegación (Sin cambios en la lógica) ---
function MoreStackNavigator({ userName }) {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreHome" component={MoreScreen} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} />
      <MoreStack.Screen name="Incidents" component={IncidentsScreen} />
      <MoreStack.Screen name="Chat" component={ChatScreen} />
      <MoreStack.Screen name="Profile" component={ProfileScreen} />
      <MoreStack.Screen name="Info" component={InfoScreen} />
    </MoreStack.Navigator>
  )
}

function MainTabNavigator({ userName }) {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        header: () => (route.name === "HomeTab" ? <CustomHeader userName={userName} navigation={navigation} /> : null),
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            HomeTab: "home",
            RouteTab: "map",
            CalendarTab: "calendar-today",
            ScanTab: "qr-code-scanner",
            MoreTab: "more-horiz",
          }
          const iconName = icons[route.name] || "circle"
          return (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <MaterialIcons name={iconName} size={focused ? 28 : 24} color={color} />
              {focused && <View style={styles.tabIndicator} />}
            </View>
          )
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginTop: 4 },
        tabBarItemStyle: { paddingVertical: 5 },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: "Inicio" }} />
      <Tab.Screen name="RouteTab" component={RouteScreen} options={{ tabBarLabel: "Rutas" }} />
      <Tab.Screen name="CalendarTab" component={CalendarScreen} options={{ tabBarLabel: "Calendario" }} />
      <Tab.Screen name="ScanTab" component={ScanScreen} options={{ tabBarLabel: "Escanear" }} />
      <Tab.Screen name="MoreTab">{(props) => <MoreStackNavigator {...props} userName={userName} />}</Tab.Screen>
    </Tab.Navigator>
  )
}

function MoreScreen({ navigation }) {
  const options = [
    {
      id: "reports",
      title: "Reportes de Recolección",
      subtitle: "Crear y gestionar reportes de trabajo",
      icon: "assessment",
      color: "#3b82f6",
      screen: "Reports",
    },
    {
      id: "incidents",
      title: "Gestión de Incidentes",
      subtitle: "Reportar y gestionar incidentes",
      icon: "report-problem",
      color: "#f59e0b",
      screen: "Incidents",
    },
    {
      id: "chat",
      title: "Soporte Técnico",
      subtitle: "Contactar con administradores",
      icon: "support-agent",
      color: "#16a34a",
      screen: "Chat",
    },
    {
      id: "profile",
      title: "Mi Perfil",
      subtitle: "Configurar información personal",
      icon: "person",
      color: "#06b6d4",
      screen: "Profile",
    },
    {
      id: "info",
      title: "Centro de Información",
      subtitle: "Guías y documentación",
      icon: "info-outline",
      color: "#8b5cf6",
      screen: "Info",
    },
  ]

  return (
    <SafeAreaView style={styles.moreContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.moreHeader}>
        <View style={styles.moreHeaderIconContainer}>
          <MaterialIcons name="apps" size={40} color="#bfdbfe" />
        </View>
        <Text style={styles.moreHeaderTitle}>Opciones Adicionales</Text>
        <Text style={styles.moreHeaderSubtitle}>Accede a más funciones de la aplicación</Text>
      </LinearGradient>

      <ScrollView
        style={styles.moreScrollView}
        contentContainerStyle={styles.moreScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.moreGrid}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.moreOption}
              onPress={() => navigation.navigate(option.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.moreOptionContent}>
                <View style={[styles.moreOptionIconContainer, { backgroundColor: `${option.color}15` }]}>
                  <MaterialIcons name={option.icon} size={32} color={option.color} />
                </View>
                <View style={styles.moreOptionTextContainer}>
                  <Text style={styles.moreOptionTitle}>{option.title}</Text>
                  <Text style={styles.moreOptionSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <View style={styles.moreOptionArrow}>
                <MaterialIcons name="chevron-right" size={24} color="#64748b" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

// --- Componente Principal App (Sin cambios en la lógica) ---
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approvalCheckLoading, setApprovalCheckLoading] = useState(false)
  const [userName, setUserName] = useState("")
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      setApprovalCheckLoading(true)
      if (currentUser) {
        try {
          const docRef = doc(db, "usersApproval", currentUser.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists() && docSnap.data().status === STATUS_APPROVED) {
            setIsApproved(true)
            const { nombre, apellidoPaterno, apellidoMaterno } = docSnap.data()
            setUserName([nombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ") || currentUser.email)
          } else {
            await signOut(auth)
            Alert.alert("Acceso Denegado", "Tu cuenta no está aprobada.")
          }
        } catch {
          await signOut(auth)
          Alert.alert("Error", "No se pudo verificar tu cuenta.")
        }
      }
      setApprovalCheckLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading || approvalCheckLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
        <LinearGradient colors={["#4A90E2", "#357ABD", "#2E5984"]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingContent}>
          <MaterialIcons name="local-shipping" size={100} color="#FFF" style={styles.logoGlow} />
          <Text style={styles.loadingTitle}>Trash & Track</Text>
          <Text style={styles.loadingSubtitle}>Sistema de Gestión de Residuos</Text>
          <ActivityIndicator size="large" color="#FFF" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>{loading ? "Verificando sesión..." : "Cargando..."}</Text>
        </View>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && isApproved ? (
          <Stack.Screen name="AppHome">{(props) => <MainTabNavigator {...props} userName={userName} />}</Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// --- [NUEVO DISEÑO] Hoja de Estilos ---
const styles = StyleSheet.create({
  // --- Estilos de Carga (Sin cambios) ---
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingContent: { alignItems: "center", padding: 40 },
  logoGlow: { position: "relative", marginBottom: 20 },
  loadingTitle: { color: "#FFF", fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  loadingSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: 16, marginBottom: 40, textAlign: "center" },
  loadingSpinner: { marginBottom: 20 },
  loadingText: { color: "#FFF", fontSize: 16, textAlign: "center", opacity: 0.9 },

  // --- Estilos de la Cabecera (Actualizados) ---
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerGreeting: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  headerUserName: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 12,
    padding: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },

  // --- Estilos del Menú de Perfil (Actualizados) ---
  profileMenu: {
    position: "absolute",
    top: 110,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1000,
    width: 220,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  profileMenuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 6,
    marginHorizontal: 10,
  },
  signOutText: {
    color: "#ef4444",
    fontWeight: "600",
  },

  // --- Estilos de la Barra de Pestañas (Actualizados) ---
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  tabIconContainerActive: {},
  tabIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
    marginTop: 6,
  },

  // --- Estilos de la Pantalla "Más" (COMPLETAMENTE REDISEÑADOS) ---
  moreContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  moreHeader: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    margin: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  moreHeaderIconContainer: {
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
  moreHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  moreHeaderSubtitle: {
    fontSize: 16,
    color: "#dbeafe",
    textAlign: "center",
  },
  moreScrollView: {
    flex: 1,
  },
  moreScrollContent: {
    paddingBottom: 20,
  },
  moreGrid: {
    padding: 16,
  },
  moreOption: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  moreOptionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  moreOptionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  moreOptionTextContainer: {
    flex: 1,
  },
  moreOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  moreOptionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  moreOptionArrow: {
    marginLeft: 12,
  },
  
})
