/*
 * ESP32 Monitor Dashboard - Simple Version
 * Versi sederhana tanpa library eksternal
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

// ==================== KONFIGURASI ====================
const char* ssid = "TOTOLINK_N200RE";
const char* password = ""; // Tanpa password
const char* serverUrl = "https://desa.orbitdev.id/api/esp32/data";

// ==================== VARIABEL GLOBAL ====================
unsigned long previousMillis = 0;
const long interval = 10000; // Kirim data setiap 10 detik
int connectionAttempts = 0;
const int maxConnectionAttempts = 10;

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
  Serial.println("  Simple Version");
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
  
  // Create JSON string manual (tanpa ArduinoJson)
  String jsonData = "{";
  jsonData += "\"chipId\":\"" + getChipId() + "\",";
  jsonData += "\"mac\":\"" + WiFi.macAddress() + "\",";
  jsonData += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  jsonData += "\"flashSize\":" + String(ESP.getFlashChipSize()) + ",";
  jsonData += "\"freeHeap\":" + String(ESP.getFreeHeap()) + ",";
  jsonData += "\"cpuFreq\":" + String(ESP.getCpuFreqMHz()) + ",";
  jsonData += "\"sdkVersion\":\"" + String(ESP.getSdkVersion()) + "\",";
  jsonData += "\"coreVersion\":\"2.0.11\",";
  jsonData += "\"wifiRssi\":" + String(WiFi.RSSI()) + ",";
  jsonData += "\"uptime\":" + String(millis() / 1000) + ",";
  
  // Add pin data
  jsonData += "\"pins\":[";
  
  // GPIO 2 (LED built-in)
  jsonData += "{\"number\":2,\"available\":true,\"mode\":\"OUTPUT\",\"value\":" + String(digitalRead(2)) + "},";
  
  // GPIO 4
  pinMode(4, INPUT_PULLUP);
  jsonData += "{\"number\":4,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(4)) + "},";
  
  // GPIO 5
  pinMode(5, INPUT_PULLUP);
  jsonData += "{\"number\":5,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(5)) + "},";
  
  // GPIO 12
  pinMode(12, INPUT_PULLUP);
  jsonData += "{\"number\":12,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(12)) + "},";
  
  // GPIO 13
  pinMode(13, INPUT_PULLUP);
  jsonData += "{\"number\":13,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(13)) + "},";
  
  // GPIO 14
  pinMode(14, INPUT_PULLUP);
  jsonData += "{\"number\":14,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(14)) + "},";
  
  // GPIO 15
  pinMode(15, INPUT_PULLUP);
  jsonData += "{\"number\":15,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(15)) + "},";
  
  // GPIO 16
  pinMode(16, INPUT_PULLUP);
  jsonData += "{\"number\":16,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(16)) + "},";
  
  // GPIO 17
  pinMode(17, INPUT_PULLUP);
  jsonData += "{\"number\":17,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(17)) + "},";
  
  // GPIO 18
  pinMode(18, INPUT_PULLUP);
  jsonData += "{\"number\":18,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(18)) + "},";
  
  // GPIO 19
  pinMode(19, INPUT_PULLUP);
  jsonData += "{\"number\":19,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(19)) + "},";
  
  // GPIO 21
  pinMode(21, INPUT_PULLUP);
  jsonData += "{\"number\":21,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(21)) + "},";
  
  // GPIO 22
  pinMode(22, INPUT_PULLUP);
  jsonData += "{\"number\":22,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(22)) + "},";
  
  // GPIO 23
  pinMode(23, INPUT_PULLUP);
  jsonData += "{\"number\":23,\"available\":true,\"mode\":\"INPUT_PULLUP\",\"value\":" + String(digitalRead(23)) + "}";
  
  jsonData += "]}";
  
  // Send HTTP POST request
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000); // 10 seconds timeout
  
  Serial.print("📦 Data size: ");
  Serial.print(jsonData.length());
  Serial.println(" bytes");
  
  // Kirim data
  int httpResponseCode = http.POST(jsonData);
  
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