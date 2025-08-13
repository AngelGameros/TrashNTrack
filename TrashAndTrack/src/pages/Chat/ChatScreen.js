"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from "react-native"
import { auth, db } from "../../config/Firebase/firebaseConfig"
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

export default function ChatScreen() {
  const [admins, setAdmins] = useState([])
  const [adminNamesMap, setAdminNamesMap] = useState({})
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [loadingAdmins, setLoadingAdmins] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardKey, setKeyboardKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const flatListRef = useRef(null)

  const currentUser = auth.currentUser
  const userUID = currentUser?.uid

  const getChatRoomId = (uid1, uid2) => [uid1, uid2].sort().join("_")

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true))
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
      setKeyboardKey((prev) => prev + 1)
    })
    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const fetchAdmins = () => {
    setLoadingAdmins(true)
    const q = query(collection(db, "usersApproval"), where("accountType", "==", "admin"))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const adminsList = []
        const namesMap = {}
        snapshot.docs.forEach((d) => {
          const adminData = d.data()
          const adminUid = d.id
          const fullName = [adminData.nombre, adminData.apellidoPaterno].filter(Boolean).join(" ")
          adminsList.push({ uid: adminUid, name: fullName, email: adminData.email })
          namesMap[adminUid] = fullName || adminData.email
        })
        setAdmins(adminsList)
        setAdminNamesMap(namesMap)
        setLoadingAdmins(false)
        setRefreshing(false)
      },
      (error) => {
        console.error("Error al cargar administradores:", error)
        Alert.alert("Error", "No se pudo cargar la lista de administradores.")
        setLoadingAdmins(false)
        setRefreshing(false)
      },
    )
    return unsubscribe
  }

  useEffect(() => {
    const unsubscribeAdmins = fetchAdmins()
    return () => unsubscribeAdmins && unsubscribeAdmins()
  }, [])

  useEffect(() => {
    let unsubscribe = null
    if (userUID && selectedAdmin) {
      setLoadingMessages(true)

      const chatRoomId = getChatRoomId(userUID, selectedAdmin.uid)
      const chatMessagesRef = collection(db, "privateChats", chatRoomId, "messages")
      const q = query(chatMessagesRef, orderBy("timestamp", "asc"))

      const userChatMetadataRef = doc(db, "chats", userUID)
      setDoc(
        userChatMetadataRef,
        {
          lastActive: serverTimestamp(),
          userEmail: currentUser?.email,
          userName: currentUser?.displayName || userUID,
          lastChatWithAdmin: selectedAdmin.uid,
        },
        { merge: true },
      ).catch((error) => console.error("Error al actualizar metadata del chat:", error))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
          setMessages(msgs)
          setLoadingMessages(false)
          setRefreshing(false)
          if (flatListRef.current && msgs.length > 0) {
            setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100)
          }
        },
        (error) => {
          console.error("Error al obtener mensajes:", error)
          Alert.alert("Error", "No se pudieron cargar los mensajes de la conversación.")
          setLoadingMessages(false)
          setRefreshing(false)
        },
      )
    } else {
      setMessages([])
      setLoadingMessages(false)
      setRefreshing(false)
    }
    return () => unsubscribe && unsubscribe()
  }, [userUID, selectedAdmin])

  const onRefresh = () => {
    setRefreshing(true)
    if (!selectedAdmin) {
      fetchAdmins()
    } else {
      setSelectedAdmin(null)
      setTimeout(() => setSelectedAdmin((prev) => prev), 500)
      setRefreshing(false)
    }
  }

  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin)
    setMessages([])
    setInputText("")
  }

  const sendMessage = async () => {
    if (inputText.trim() === "" || !userUID || !selectedAdmin) return
    try {
      const chatRoomId = getChatRoomId(userUID, selectedAdmin.uid)
      const chatMessagesRef = collection(db, "privateChats", chatRoomId, "messages")
      await addDoc(chatMessagesRef, {
        text: inputText,
        senderId: userUID,
        senderType: "user",
        timestamp: serverTimestamp(),
        recipientId: selectedAdmin.uid,
      })
      setInputText("")
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      Alert.alert("Error", "No se pudo enviar el mensaje.")
    }
  }

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === userUID
    const senderLabel = isMyMessage
      ? "Tú"
      : item.senderType === "admin"
        ? `${adminNamesMap[item.senderId] || "Administrador"}`
        : "Usuario Desconocido"

    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {!isMyMessage && <Text style={styles.senderName}>{senderLabel}</Text>}
        <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>{item.text}</Text>
        <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
          {item.timestamp
            ? new Date(item.timestamp.toDate()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
    )
  }

  if (loadingAdmins) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando administradores...</Text>
      </View>
    )
  }

  if (!selectedAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        {/* Header */}
        <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="support-agent" size={40} color="#bfdbfe" />
          </View>
          <Text style={styles.headerTitle}>Soporte Técnico</Text>
          <Text style={styles.headerSubtitle}>Selecciona un administrador para chatear</Text>
        </LinearGradient>

        {admins.length === 0 ? (
          <View style={styles.noAdminsContainer}>
            <View style={styles.noAdminsIconContainer}>
              <MaterialIcons name="support-agent" size={60} color="#94a3b8" />
            </View>
            <Text style={styles.noAdminsTitle}>Sin Administradores</Text>
            <Text style={styles.noAdminsText}>No hay administradores disponibles en este momento.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={admins}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.adminItem} onPress={() => handleSelectAdmin(item)}>
                <View style={styles.adminAvatar}>
                  <MaterialIcons name="person" size={24} color="#3b82f6" />
                </View>
                <View style={styles.adminInfo}>
                  <Text style={styles.adminName}>{item.name || item.email}</Text>
                  <Text style={styles.adminEmail}>{item.email}</Text>
                  <Text style={styles.adminStatus}>Disponible</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#64748b" />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.adminList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3b82f6"]} tintColor="#3b82f6" />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Chat Header */}
      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => {
            setSelectedAdmin(null)
            setKeyboardVisible(false)
          }}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderTitle}>{selectedAdmin.name || selectedAdmin.email}</Text>
          <Text style={styles.chatHeaderSubtitle}>Administrador • En línea</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        key={keyboardKey}
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 90 : 60}
      >
        <View style={{ flex: 1 }}>
          {loadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={[styles.loadingText, { color: "#3b82f6" }]}>Cargando mensajes...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.noMessagesContainer}>
              <View style={styles.noMessagesIconContainer}>
                <MaterialIcons name="chat-bubble-outline" size={60} color="#94a3b8" />
              </View>
              <Text style={styles.noMessagesTitle}>¡Inicia la conversación!</Text>
              <Text style={styles.noMessagesText}>
                Envía tu primer mensaje para comenzar a chatear con el administrador.
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              style={styles.flatListContentArea}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#3b82f6"]}
                  tintColor="#3b82f6"
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Input Container */}
          <View style={[styles.inputContainer, { paddingBottom: keyboardVisible ? 5 : 20 }]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor="#64748b"
                multiline
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              >
                <MaterialIcons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

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
  noAdminsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    margin: 16,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  noAdminsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noAdminsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  noAdminsText: {
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
  adminList: {
    padding: 16,
  },
  adminItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  adminStatus: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "500",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  chatHeaderSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  chatHeaderActions: {
    marginLeft: 12,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  flatListContentArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#9ca3af",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  senderName: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 22,
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 11,
    color: "#64748b",
    alignSelf: "flex-end",
    marginTop: 6,
  },
  myTimestamp: {
    color: "#dbeafe",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: "#3b82f6",
  },
  sendButtonInactive: {
    backgroundColor: "#94a3b8",
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noMessagesIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noMessagesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 10,
  },
  noMessagesText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
})
