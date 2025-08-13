"use client"

// src/pages/Login/LoginScreen.js
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../../config/Firebase/firebaseConfig"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialIcons } from "@expo/vector-icons"

const STATUS_PENDING = 0
const STATUS_APPROVED = 1
const STATUS_REJECTED = 2
const IP_URL = process.env.EXPO_PUBLIC_IP_URL

const API_URL = `http://${IP_URL}:5000/api/usuarios`

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellidoPaterno, setApellidoPaterno] = useState("")
  const [apellidoMaterno, setApellidoMaterno] = useState("")
  const [numeroTelefono, setNumeroTelefono] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const saveUserToSQLServer = async (userData) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar usuario en SQL Server")
      }

      return data
    } catch (error) {
      console.error("Error al guardar en SQL Server:", error)
      throw error
    }
  }

  const handleAuthentication = async () => {
    setLoading(true)

    // Validaciones comunes
    if (!email || !password) {
      Alert.alert("Campos Obligatorios", "Por favor, ingresa tu correo y contraseña.")
      setLoading(false)
      return
    }

    // Validaciones específicas para registro
    if (isRegistering) {
      if (password !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden.")
        setLoading(false)
        return
      }
      if (password.length < 6) {
        Alert.alert("Contraseña Débil", "La contraseña debe tener al menos 6 caracteres.")
        setLoading(false)
        return
      }
      if (!nombre || !apellidoPaterno || !apellidoMaterno || !numeroTelefono) {
        Alert.alert(
          "Campos Obligatorios",
          "Por favor, llena todos los campos: Nombre, Apellido Paterno, Apellido Materno y Número de Teléfono.",
        )
        setLoading(false)
        return
      }
      if (!/^\d{10}$/.test(numeroTelefono)) {
        Alert.alert(
          "Número de Teléfono Inválido",
          "El número de teléfono debe contener exactamente 10 dígitos numéricos.",
        )
        setLoading(false)
        return
      }
    }

    try {
      if (isRegistering) {
        // Registro de usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Datos para Firestore
        const firestoreUserData = {
          email: user.email,
          nombre: nombre.trim(),
          apellidoPaterno: apellidoPaterno.trim(),
          apellidoMaterno: apellidoMaterno.trim(),
          numeroTelefono: numeroTelefono.trim(),
          status: STATUS_PENDING,
          accountType: "user",
          createdAt: serverTimestamp(),
        }

        // Datos para SQL Server
        const sqlUserData = {
          nombre: nombre.trim(),
          primerApellido: apellidoPaterno.trim(),
          segundoApellido: apellidoMaterno.trim(),
          correo: email.trim(),
          numeroTelefono: numeroTelefono.trim(),
          firebaseUid: user.uid,
          tipoUsuario: "recolector",
        }

        // Guardar en ambas bases de datos
        await Promise.all([
          setDoc(doc(db, "usersApproval", user.uid), firestoreUserData),
          saveUserToSQLServer(sqlUserData),
        ])

        Alert.alert(
          "Registro Exitoso",
          "¡Tu cuenta ha sido creada y está pendiente de aprobación por un administrador. Una vez aprobada, podrás iniciar sesión.",
        )

        // Limpiar campos
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setNombre("")
        setApellidoPaterno("")
        setApellidoMaterno("")
        setNumeroTelefono("")
        setIsRegistering(false)
        await signOut(auth)
      } else {
        // Inicio de sesión
        await signInWithEmailAndPassword(auth, email, password)
        setEmail("")
        setPassword("")
      }
    } catch (error) {
      console.error("Error completo:", error)

      let errorMessage = "Ha ocurrido un error. Por favor, inténtalo de nuevo."

      if (error.message.includes("Network request failed")) {
        errorMessage = "No se pudo conectar al servidor. Verifica tu conexión a internet."
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Ese correo electrónico ya está en uso."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El formato del correo electrónico no es válido."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres."
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Credenciales inválidas. Verifica tu email y contraseña."
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Este usuario ha sido deshabilitado."
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <LinearGradient colors={["#4A90E2", "#357ABD"]} style={StyleSheet.absoluteFillObject} />

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="local-shipping" size={60} color="#FFFFFF" />
            <Text style={styles.appTitle}>Trash & Track</Text>
            <Text style={styles.appSubtitle}>Sistema de Recolección</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{isRegistering ? "Crear Cuenta" : "Iniciar Sesión"}</Text>
              <Text style={styles.formSubtitle}>
                {isRegistering ? "Completa tus datos para registrarte" : "Ingresa tus credenciales para continuar"}
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Contraseña"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {isRegistering && (
              <>
                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                {/* Name */}
                <View style={styles.inputContainer}>
                  <MaterialIcons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    placeholderTextColor="#9CA3AF"
                    value={nombre}
                    onChangeText={setNombre}
                    autoCapitalize="words"
                  />
                </View>

                {/* Apellido Paterno */}
                <View style={styles.inputContainer}>
                  <MaterialIcons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Apellido Paterno"
                    placeholderTextColor="#9CA3AF"
                    value={apellidoPaterno}
                    onChangeText={setApellidoPaterno}
                    autoCapitalize="words"
                  />
                </View>

                {/* Apellido Materno */}
                <View style={styles.inputContainer}>
                  <MaterialIcons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Apellido Materno"
                    placeholderTextColor="#9CA3AF"
                    value={apellidoMaterno}
                    onChangeText={setApellidoMaterno}
                    autoCapitalize="words"
                  />
                </View>

                {/* Phone */}
                <View style={styles.inputContainer}>
                  <MaterialIcons name="phone" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Número de Teléfono (10 dígitos)"
                    placeholderTextColor="#9CA3AF"
                    value={numeroTelefono}
                    onChangeText={setNumeroTelefono}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAuthentication}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name={isRegistering ? "person-add" : "login"} size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>{isRegistering ? "Registrarse" : "Iniciar Sesión"}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Toggle Button */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => {
                setIsRegistering(!isRegistering)
                setEmail("")
                setPassword("")
                setConfirmPassword("")
                setNombre("")
                setApellidoPaterno("")
                setApellidoMaterno("")
                setNumeroTelefono("")
              }}
              disabled={loading}
            >
              <Text style={styles.toggleButtonText}>
                {isRegistering ? "¿Ya tienes una cuenta? Inicia Sesión" : "¿No tienes una cuenta? Regístrate"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 15,
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1F2937",
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  toggleButton: {
    marginTop: 20,
    padding: 10,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "500",
  },
})
