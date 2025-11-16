/*
 * ESP32 Monitor Dashboard Script
 * 
 * Script ini untuk mengirim data ESP32 ke dashboard monitoring
 * Domain: https://desa.orbitdev.id/
 * 
 * Hardware: ESP32
 * WiFi: TOTOLINK_N200RE (tanpa password)
 * 
 * Created by: Z.ai Code Assistant
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_wifi.h>

// ==================== KONFIGURASI ====================
const char* ssid = "TOTOLINK_N200RE";
const char* password = ""; // Tanpa password
const char* serverUrl = "https://desa.orbitdev.id/api/esp32/data";

// ==================== VARIABEL GLOBAL ====================
unsigned long previousMillis = 0;
const long interval = 10000; // Kirim data setiap 10 detik
int connectionAttempts = 0;
const int maxConnectionAttempts = 10;
bool ledState = false;

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Initialize LED pin (GPIO 2 biasanya LED built-in)
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  // Print header
  Serial.println("=================================");
  Serial.println("  ESP32 MONITOR DASHBOARD");
  Serial.println("  Domain: desa.orbitdev.id");
  Serial.println("=================================");
  Serial.println();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Print initial status
  printSystemInfo();
  Serial.println("✅ ESP32 siap mengirim data ke dashboard");
  Serial.println("📡 Mengirim data setiap 10 detik...");
  Serial.println();
}

// ==================== MAIN LOOP ====================
void loop() {
  unsigned long currentMillis = millis();
  
  // Blink LED untuk indikator aktivitas
  if (currentMillis % 1000 < 500) {
    digitalWrite(2, HIGH);
  } else {
    digitalWrite(2, LOW);
  }
  
  // Kirim data setiap interval
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    if (WiFi.status() == WL_CONNECTED) {
      sendSensorData();
    } else {
      Serial.println("❌ WiFi terputus, mencoba menghubungkan kembali...");
      connectToWiFi();
    }
  }
  
  delay(100);
}

// ==================== FUNGSI KONEKSI WIFI ====================
void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("🔌 Menghubungkan ke WiFi: ");
  Serial.println(ssid);
  
  connectionAttempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && connectionAttempts < maxConnectionAttempts) {
    delay(500);
    Serial.print(".");
    connectionAttempts++;
    
    // Blink LED cepat saat mencoba koneksi
    digitalWrite(2, !digitalRead(2));
    delay(100);
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi Terhubung!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("🔗 MAC Address: ");
    Serial.println(WiFi.macAddress());
  } else {
    Serial.println("❌ Gagal menghubungkan ke WiFi!");
    Serial.println("🔄 Akan mencoba kembali dalam 10 detik...");
  }
  
  Serial.println();
}

// ==================== FUNGSI KIRIM DATA ====================
void sendSensorData() {
  HTTPClient http;
  
  Serial.println("📤 Mengirim data ke server...");
  
  // Create JSON document dengan ukuran yang cukup
  DynamicJsonDocument doc(4096);
  
  // Get ESP32 information
  doc["chipId"] = getChipId();
  doc["mac"] = WiFi.macAddress();
  doc["ip"] = WiFi.localIP().toString();
  doc["flashSize"] = ESP.getFlashChipSize();
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["cpuFreq"] = ESP.getCpuFreqMHz();
  doc["sdkVersion"] = ESP.getSdkVersion();
  doc["wifiRssi"] = WiFi.RSSI();
  doc["uptime"] = millis() / 1000;
  
  // Tambahkan informasi tambahan
  doc["coreVersion"] = "2.0.11"; // Arduino core version
  doc["sketchSize"] = ESP.getSketchSize();
  doc["freeSketchSpace"] = ESP.getFreeSketchSpace();
  
  // Add pin information untuk pin yang umum digunakan
  JsonArray pins = doc.createNestedArray("pins");
  
  // GPIO 2 (LED built-in)
  JsonObject pin2 = pins.createNestedObject();
  pin2["number"] = 2;
  pin2["available"] = true;
  pin2["mode"] = "OUTPUT";
  pin2["value"] = digitalRead(2);
  
  // GPIO 4
  pinMode(4, INPUT_PULLUP);
  JsonObject pin4 = pins.createNestedObject();
  pin4["number"] = 4;
  pin4["available"] = true;
  pin4["mode"] = "INPUT_PULLUP";
  pin4["value"] = digitalRead(4);
  
  // GPIO 5 
  pinMode(5, INPUT_PULLUP);
  JsonObject pin5 = pins.createNestedObject();
  pin5["number"] = 5;
  pin5["available"] = true;
  pin5["mode"] = "INPUT_PULLUP";
  pin5["value"] = digitalRead(5);
  
  // GPIO 12
  pinMode(12, INPUT_PULLUP);
  JsonObject pin12 = pins.createNestedObject();
  pin12["number"] = 12;
  pin12["available"] = true;
  pin12["mode"] = "INPUT_PULLUP";
  pin12["value"] = digitalRead(12);
  
  // GPIO 13
  pinMode(13, INPUT_PULLUP);
  JsonObject pin13 = pins.createNestedObject();
  pin13["number"] = 13;
  pin13["available"] = true;
  pin13["mode"] = "INPUT_PULLUP";
  pin13["value"] = digitalRead(13);
  
  // GPIO 14
  pinMode(14, INPUT_PULLUP);
  JsonObject pin14 = pins.createNestedObject();
  pin14["number"] = 14;
  pin14["available"] = true;
  pin14["mode"] = "INPUT_PULLUP";
  pin14["value"] = digitalRead(14);
  
  // GPIO 15
  pinMode(15, INPUT_PULLUP);
  JsonObject pin15 = pins.createNestedObject();
  pin15["number"] = 15;
  pin15["available"] = true;
  pin15["mode"] = "INPUT_PULLUP";
  pin15["value"] = digitalRead(15);
  
  // GPIO 16
  pinMode(16, INPUT_PULLUP);
  JsonObject pin16 = pins.createNestedObject();
  pin16["number"] = 16;
  pin16["available"] = true;
  pin16["mode"] = "INPUT_PULLUP";
  pin16["value"] = digitalRead(16);
  
  // GPIO 17
  pinMode(17, INPUT_PULLUP);
  JsonObject pin17 = pins.createNestedObject();
  pin17["number"] = 17;
  pin17["available"] = true;
  pin17["mode"] = "INPUT_PULLUP";
  pin17["value"] = digitalRead(17);
  
  // GPIO 18
  pinMode(18, INPUT_PULLUP);
  JsonObject pin18 = pins.createNestedObject();
  pin18["number"] = 18;
  pin18["available"] = true;
  pin18["mode"] = "INPUT_PULLUP";
  pin18["value"] = digitalRead(18);
  
  // GPIO 19
  pinMode(19, INPUT_PULLUP);
  JsonObject pin19 = pins.createNestedObject();
  pin19["number"] = 19;
  pin19["available"] = true;
  pin19["mode"] = "INPUT_PULLUP";
  pin19["value"] = digitalRead(19);
  
  // GPIO 21
  pinMode(21, INPUT_PULLUP);
  JsonObject pin21 = pins.createNestedObject();
  pin21["number"] = 21;
  pin21["available"] = true;
  pin21["mode"] = "INPUT_PULLUP";
  pin21["value"] = digitalRead(21);
  
  // GPIO 22
  pinMode(22, INPUT_PULLUP);
  JsonObject pin22 = pins.createNestedObject();
  pin22["number"] = 22;
  pin22["available"] = true;
  pin22["mode"] = "INPUT_PULLUP";
  pin22["value"] = digitalRead(22);
  
  // GPIO 23
  pinMode(23, INPUT_PULLUP);
  JsonObject pin23 = pins.createNestedObject();
  pin23["number"] = 23;
  pin23["available"] = true;
  pin23["mode"] = "INPUT_PULLUP";
  pin23["value"] = digitalRead(23);
  
  // Convert JSON to string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 seconds timeout
  
  Serial.print("📦 Data size: ");
  Serial.print(jsonString.length());
  Serial.println(" bytes");
  
  // Kirim data
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("📡 HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    String response = http.getString();
    Serial.print("📄 Server response: ");
    Serial.println(response);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Data terkirim berhasil!");
      // Blink LED 3 kali untuk sukses
      for (int i = 0; i < 3; i++) {
        digitalWrite(2, HIGH);
        delay(200);
        digitalWrite(2, LOW);
        delay(200);
      }
    } else {
      Serial.println("⚠️ Server merespon dengan error");
    }
  } else {
    Serial.print("❌ Error on sending POST: ");
    Serial.println(httpResponseCode);
    Serial.println("🔍 Cek koneksi internet dan server");
  }
  
  http.end();
  Serial.println("─────────────────────────────────────");
  Serial.println();
}

// ==================== FUNGSI HELPER ====================
String getChipId() {
  uint64_t chipid = ESP.getEfuseMac();
  String chipId = String((uint16_t)(chipid >> 32), HEX) + 
                  String((uint32_t)chipid, HEX);
  chipId.toUpperCase();
  return chipId;
}

void printSystemInfo() {
  Serial.println("📊 SISTEM INFORMATION");
  Serial.println("─────────────────────────────────────");
  Serial.print("🔧 Chip ID: ");
  Serial.println(getChipId());
  Serial.print("💾 Flash Size: ");
  Serial.print(ESP.getFlashChipSize() / 1024 / 1024);
  Serial.println(" MB");
  Serial.print("🧠 Free Heap: ");
  Serial.print(ESP.getFreeHeap());
  Serial.println(" bytes");
  Serial.print("⚡ CPU Frequency: ");
  Serial.print(ESP.getCpuFreqMHz());
  Serial.println(" MHz");
  Serial.print("📱 SDK Version: ");
  Serial.println(ESP.getSdkVersion());
  Serial.print("📦 Sketch Size: ");
  Serial.print(ESP.getSketchSize());
  Serial.println(" bytes");
  Serial.print("💿 Free Sketch Space: ");
  Serial.print(ESP.getFreeSketchSpace());
  Serial.println(" bytes");
  Serial.println("─────────────────────────────────────");
  Serial.println();
}

void printConnectionStatus() {
  Serial.println("🔗 KONEKSI STATUS");
  Serial.println("─────────────────────────────────────");
  Serial.print("📶 WiFi SSID: ");
  Serial.println(ssid);
  Serial.print("📍 IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("🔗 MAC Address: ");
  Serial.println(WiFi.macAddress());
  Serial.print("📊 Signal Strength: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
  Serial.print("⏱️ Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");
  Serial.print("🧠 Free Heap: ");
  Serial.print(ESP.getFreeHeap());
  Serial.println(" bytes");
  Serial.println("─────────────────────────────────────");
  Serial.println();
}

// ==================== ERROR HANDLING ====================
void handleWiFiError() {
  Serial.println("❌ WiFi ERROR!");
  Serial.println("🔄 Memulai ulang koneksi...");
  
  WiFi.disconnect();
  delay(1000);
  connectToWiFi();
}

// ==================== WATCHDOG TIMER ====================
void setupWatchdog() {
  // Setup watchdog timer untuk restart otomatis jika hang
  esp_task_wdt_init(30, true); // 30 seconds timeout
  esp_task_wdt_add(NULL);
}

void feedWatchdog() {
  // Feed watchdog untuk prevent restart
  esp_task_wdt_reset();
}