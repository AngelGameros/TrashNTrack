#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "time.h"
#include "DHT.h"
#include <Keypad.h>
#include <ESP32Servo.h>

// --- CONFIGURACIÓN DE PINES ---
#define DHT_PIN 33
#define MQ135_PIN 34
#define MQ9_PIN 35
#define SERVO_PIN 26
#define TRIG_PIN 13
#define ECHO_PIN 12
#define POT_PIN 36

// --- CONFIGURACIÓN DE SENSORES ---
#define DHTTYPE DHT22
DHT dht(DHT_PIN, DHTTYPE);

// Teclado Matricial 4x4
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'7','8','9','B'},
  {'4','5','6','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {32, 23, 22, 21};
byte colPins[COLS] = {19, 18, 5, 4};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

String input_password;
const String MASTER_PASSWORD = "258";

// Servomotor
Servo lockServo;
const int SERVO_LOCKED_POS = 0;
const int SERVO_UNLOCKED_POS = 90;

// Variables globales
float temperature_c = 0.0;
float humidity_rh = 0.0;
int air_quality_ppm = 0;
int gas_ppm = 0;
float weight_kg = 0.0;
float distance_cm = 0.0;
float fill_level_percent = 0.0;
bool is_open = false;
int open_count = 0;

const float alturaMaximaContenedor = 22.0; // Ajusta según tu diseño físico

// Red y MQTT
const char* ssid = "Totalplay-2.4G-a618";
const char* password = "hGyKdJ4dA2g2bY5R";
const char* mqtt_broker = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* out_topic = "UTT/TRASHANDTRACK";

WiFiClient espClient;
PubSubClient client(espClient);

// NTP
const char* ntpServer = "pool.ntp.org";
// Desfase para la Zona del Pacífico (Tijuana) GMT-8
const long  gmtOffset_sec = -28800;
// Ajuste de 1 hora para el horario de verano
const int   daylightOffset_sec = 3600;

long previousMillis = 0;
const long sampling_period = 5000;

void setup_wifi() {
  delay(10);
  Serial.println();
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect_mqtt() {
  while (!client.connected()) {
    if (client.connect("CLIENTESP")) {
      Serial.println("MQTT conectado!");
    } else {
      Serial.print("MQTT falló. rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

String get_iso_timestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "1970-01-01T00:00:00.000Z";
  }
  
  unsigned long ms = millis() % 1000;

  char timeString[21];
  strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  
  char finalTimestamp[30];
  sprintf(finalTimestamp, "%s.%03luZ", timeString, ms);

  return String(finalTimestamp);
}

float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracion = pulseIn(ECHO_PIN, HIGH, 30000);

  Serial.printf("  [DEBUG SENSOR] Duracion cruda: %ld us\n", duracion);

  if (duracion == 0) {
    Serial.println("  [DEBUG SENSOR] Timeout en pulseIn(). Verifica el cableado.");
    return 0.0;
  }

  float distancia = duracion * 0.034 / 2;
  return distancia;
}

float leerPeso() {
  int potValue = analogRead(POT_PIN);
  float kgValue = potValue * (210.0 / 4095.0);
  Serial.printf("Valor ADC Pot: %d -> Peso simulado: %.2f kg\n", potValue, kgValue);
  return kgValue;
}

void read_all_sensors() {
  temperature_c = dht.readTemperature();
  humidity_rh = dht.readHumidity();
  air_quality_ppm = analogRead(MQ135_PIN);
  gas_ppm = analogRead(MQ9_PIN);
  weight_kg = leerPeso();

  distance_cm = medirDistancia();
  if (distance_cm > 0 && distance_cm < alturaMaximaContenedor) {
      fill_level_percent = 100.0 * (alturaMaximaContenedor - distance_cm) / alturaMaximaContenedor;
  } else if (distance_cm >= alturaMaximaContenedor) {
      fill_level_percent = 0;
  } else {
      fill_level_percent = 100;
  }
  fill_level_percent = constrain(fill_level_percent, 0, 100);

  Serial.println("--- Lectura de Sensores ---");
  Serial.printf("Temperatura: %.1f °C\n", temperature_c);
  Serial.printf("Humedad: %.1f %%\n", humidity_rh);
  Serial.printf("Calidad de Aire: %d\n", air_quality_ppm);
  Serial.printf("Gas: %d\n", gas_ppm);
  Serial.printf("Peso: %.2f kg\n", weight_kg);
  Serial.printf("Distancia: %.1f cm\n", distance_cm);
  Serial.printf("Nivel de llenado: %.1f %%\n", fill_level_percent);
  Serial.println("--------------------------");
}

void handle_keypad_and_lock() {
  char key = keypad.getKey();
  if (key) {
    Serial.print("Tecla presionada: ");
    Serial.println(key);
    if (key == '#') {
      if (input_password == MASTER_PASSWORD && !is_open) {
        is_open = true;
        open_count++;
        lockServo.write(SERVO_UNLOCKED_POS);
        Serial.println("Acceso concedido!");
      } else {
        Serial.println("Acceso denegado o ya está abierto.");
      }
      input_password = "";
    } else if (key == '*') {
      if (is_open) {
        is_open = false;
        lockServo.write(SERVO_LOCKED_POS);
        Serial.println("Contenedor cerrado.");
      } else {
        Serial.println("Ya está cerrado.");
      }
      input_password = "";
    } else {
      input_password += key;
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando sistema...");

  dht.begin();
  lockServo.attach(SERVO_PIN);
  lockServo.write(SERVO_LOCKED_POS);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(POT_PIN, INPUT);

  setup_wifi();
  client.setServer(mqtt_broker, mqtt_port);
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  previousMillis = millis();
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  handle_keypad_and_lock();

  unsigned long now = millis();
  if (now - previousMillis >= sampling_period) {
    previousMillis = now;

    read_all_sensors();
    
    DynamicJsonDocument doc(1024);
    
    doc["IdEmpresa"] = 24;
    doc["Name"] = "Tipo I";
    doc["Descripcion"] = "SMK 4";
    doc["Status"] = "active";
    doc["Type"] = 1;
    doc["MaxWeight_kg"] = 210; 

    JsonObject valuesObject = doc.createNestedObject("Values");
    valuesObject["Temperature_C"] = temperature_c;
    valuesObject["Humidity_RH"] = humidity_rh;
    valuesObject["Air_Quality_Ppm"] = air_quality_ppm;
    valuesObject["Gas_Ppm"] = gas_ppm;
    valuesObject["Distance_Cm"] = distance_cm;
    valuesObject["Weight_Kg"] = weight_kg;
    valuesObject["Is_Open"] = is_open ? "true" : "false";
    valuesObject["Open_Count"] = open_count;

    // Asignamos la fecha directamente como una cadena de texto
    doc["updatedAt"] = get_iso_timestamp();

    String jsonString;
    serializeJson(doc, jsonString);

    Serial.println("\nEnviando datos a MQTT:");
    serializeJsonPretty(doc, Serial);
    Serial.println();

    if (client.connected()) {
      client.publish(out_topic, jsonString.c_str());
    } else {
      Serial.println("No conectado al broker.");
    }
  }
}