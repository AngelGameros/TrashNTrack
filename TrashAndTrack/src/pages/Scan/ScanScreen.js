"use client";

import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Linking, Alert, Dimensions, TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// --- Componente de Alerta Personalizada (Sin cambios) ---
const CustomAlert = ({ data, onDismiss, onCopy, onOpenLink }) => {
    const isLink = data?.startsWith("http");

    const handleCopyToClipboard = () => {
        // For web/iframe environments, execCommand is more reliable
        const textArea = document.createElement("textarea");
        textArea.value = data;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            onCopy();
        } catch (err) {
            Alert.alert("Error", "No se pudo copiar el texto.");
        }
        document.body.removeChild(textArea);
    };

    return (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalIconWrapper}>
                        <MaterialIcons name="check-circle" size={24} color="#22c55e" />
                    </View>
                    <Text style={styles.modalTitle}>Código Escaneado</Text>
                </View>
                <Text style={styles.modalData} numberOfLines={4}>{data}</Text>
                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalButton} onPress={handleCopyToClipboard}>
                        <MaterialIcons name="content-copy" size={20} color="#3b82f6" />
                        <Text style={styles.modalButtonText}>Copiar</Text>
                    </TouchableOpacity>
                    {isLink && (
                         <TouchableOpacity style={styles.modalButton} onPress={() => onOpenLink(data)}>
                            <MaterialIcons name="open-in-new" size={20} color="#3b82f6" />
                            <Text style={styles.modalButtonText}>Abrir</Text>
                        </TouchableOpacity>
                    )}
                </View>
                 <TouchableOpacity style={styles.modalPrimaryButton} onPress={onDismiss}>
                    <Text style={styles.modalPrimaryButtonText}>Escanear Otro</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default function ScanScreen() {
  const [scannedData, setScannedData] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState("back");
  const [torchEnabled, setTorchEnabled] = useState(false);
  // La clave de la cámara fuerza el reinicio del componente cuando cambia
  const [cameraKey, setCameraKey] = useState(0);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }) => {
    if (scannedData) return; // Evita escanear múltiples veces
    setScannedData(data);
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch((err) => Alert.alert("Error", "No se pudo abrir el enlace."));
    setScannedData(null);
  };
  
  const handleCopy = () => {
    Alert.alert("Copiado", "El contenido se ha copiado al portapapeles.");
  };

  // Función para reiniciar la cámara manualmente
  const restartCamera = () => {
    setScannedData(null);
    setCameraKey(prevKey => prevKey + 1);
  };

  if (!permission) return null;

  // --- Pantalla de Permisos (Sin cambios) ---
  if (!permission.granted) {
    return (
      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionIconContainer}>
            <MaterialIcons name="camera-alt" size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
        <Text style={styles.permissionText}>
          Necesitamos tu permiso para usar la cámara y poder escanear códigos QR.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // --- Pantalla Principal del Escáner (Actualizada) ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <CameraView
        key={cameraKey} // Se usa la clave para forzar el reinicio
        onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        facing={cameraType}
        enableTorch={torchEnabled}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <SafeAreaView style={styles.header}>
            <Text style={styles.headerTitle}>Escáner QR</Text>
          </SafeAreaView>

          {/* Marco de escaneo */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionsText}>Apunta al código para escanear</Text>

          {/* Controles inferiores */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={() => setTorchEnabled(t => !t)}>
              <MaterialIcons name={torchEnabled ? "flash-on" : "flash-off"} size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={restartCamera}>
              <MaterialIcons name="refresh" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => setCameraType(c => c === 'back' ? 'front' : 'back')}>
              <MaterialIcons name="flip-camera-ios" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>

      {scannedData && (
        <CustomAlert 
            data={scannedData} 
            onDismiss={() => setScannedData(null)}
            onCopy={handleCopy}
            onOpenLink={handleOpenLink}
        />
      )}
    </View>
  );
}

// --- Hoja de Estilos (Sin cambios) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  permissionButtonText: {
    color: "#1e3a8a",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scanFrame: {
    alignSelf: 'center',
    width: width * 0.65,
    height: width * 0.65,
    position: 'relative',
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFFFFF",
    borderWidth: 5,
    borderRadius: 12,
  },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  instructionsText: {
    alignSelf: 'center',
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 24,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: 'center',
    width: '100%',
    paddingVertical: 32,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
  },
  modalIconWrapper: {
      backgroundColor: '#dcfce7',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalData: {
    fontSize: 16,
    color: '#4b5569',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  modalActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalPrimaryButton: {
      width: '100%',
      backgroundColor: '#3b82f6',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
  },
  modalPrimaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
  }
});
