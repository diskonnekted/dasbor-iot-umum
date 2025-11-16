/*
 * ESP32 OTA Update Script
 * 
 * Script ini untuk melakukan OTA (Over-The-Air) update
 * Menghubungi server untuk mengecek update dan mengunduh firmware
 * 
 * Created by: Z.ai Code Assistant
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_ota.h>
#include <esp_partition.h>

// ==================== KONFIGURASI ====================
const char* ssid = "TOTOLINK_N200RE";
const char* password = ""; // Tanpa password
const char* serverUrl = "https://desa.orbitdev.id";
const char* currentVersion = "1.0.0";

// ==================== VARIABEL GLOBAL ====================
unsigned long previousCheck = 0;
const long checkInterval = 60000; // Check update setiap 1 menit
bool updateAvailable = false;
String updateUrl = "";
String updateVersion = "";

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Initialize LED
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
  
  Serial.println("=================================");
  Serial.println("  ESP32 OTA UPDATE SYSTEM");
  Serial.println("  Domain: desa.orbitdev.id");
  Serial.println("=================================");
  Serial.print("Current Version: ");
  Serial.println(currentVersion);
  Serial.println();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Check for updates on startup
  checkForUpdates();
  
  Serial.println("✅ ESP32 OTA System Ready");
  Serial.println("🔄 Checking for updates every 60 seconds");
  Serial.println();
}

// ==================== MAIN LOOP ====================
void loop() {
  unsigned long currentMillis = millis();
  
  // Blink LED untuk indikator normal
  if (currentMillis % 2000 < 1000) {
    digitalWrite(2, HIGH);
  } else {
    digitalWrite(2, LOW);
  }
  
  // Check for updates periodically
  if (currentMillis - previousCheck >= checkInterval) {
    previousCheck = currentMillis;
    
    if (WiFi.status() == WL_CONNECTED) {
      checkForUpdates();
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
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Blink LED cepat saat mencoba koneksi
    digitalWrite(2, !digitalRead(2));
    delay(100);
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi Terhubung!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("❌ Gagal menghubungkan ke WiFi!");
  }
  Serial.println();
}

// ==================== FUNGSI CEK UPDATE ====================
void checkForUpdates() {
  Serial.println("🔍 Checking for updates...");
  
  HTTPClient http;
  String checkUrl = String(serverUrl) + "/api/ota/check";
  
  http.begin(checkUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  
  // Create JSON request
  DynamicJsonDocument doc(512);
  doc["chipId"] = getChipId();
  doc["currentVersion"] = currentVersion;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("📡 Server response received");
    
    // Parse response
    DynamicJsonDocument responseDoc(1024);
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      bool hasUpdate = responseDoc["hasUpdate"];
      
      if (hasUpdate) {
        updateAvailable = true;
        updateVersion = responseDoc["update"]["version"].as<String>();
        updateUrl = String(serverUrl) + responseDoc["update"]["firmwareUrl"].as<String>();
        
        Serial.println("🆕 Update available!");
        Serial.print("New Version: ");
        Serial.println(updateVersion);
        Serial.print("Download URL: ");
        Serial.println(updateUrl);
        
        // Start update process
        performOTAUpdate();
      } else {
        Serial.println("✅ Device is up to date");
        updateAvailable = false;
      }
    } else {
      Serial.println("❌ Failed to parse update response");
    }
  } else {
    Serial.print("❌ Update check failed: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  Serial.println("─────────────────────────────────────");
  Serial.println();
}

// ==================== FUNGSI OTA UPDATE ====================
void performOTAUpdate() {
  if (!updateAvailable) {
    Serial.println("⚠️ No update available");
    return;
  }
  
  Serial.println("🚀 Starting OTA Update...");
  Serial.println("📥 Downloading firmware...");
  
  // Fast LED blink during update
  for (int i = 0; i < 10; i++) {
    digitalWrite(2, HIGH);
    delay(100);
    digitalWrite(2, LOW);
    delay(100);
  }
  
  HTTPClient http;
  http.begin(updateUrl);
  http.setTimeout(30000); // 30 seconds timeout
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    int contentLength = http.getSize();
    Serial.print("📦 Firmware size: ");
    Serial.print(contentLength);
    Serial.println(" bytes");
    
    // Get firmware stream
    WiFiClient* stream = http.getStreamPtr();
    
    if (stream) {
      // Begin OTA update
      bool otaBegin = ESP32OTA.begin();
      
      if (otaBegin) {
        Serial.println("📤 Writing firmware...");
        
        size_t written = 0;
        size_t chunkSize = 1024;
        uint8_t buffer[chunkSize];
        
        while (written < contentLength) {
          size_t toRead = min(chunkSize, contentLength - written);
          size_t read = stream->readBytes(buffer, toRead);
          
          if (read > 0) {
            size_t writtenThisTime = ESP32OTA.write(buffer, read);
            written += writtenThisTime;
            
            // Progress indicator
            int progress = (written * 100) / contentLength;
            Serial.print("📊 Progress: ");
            Serial.print(progress);
            Serial.println("%");
            
            // LED progress indicator
            digitalWrite(2, progress % 20 < 10);
          } else {
            Serial.println("❌ Failed to read firmware data");
            ESP32OTA.abort();
            break;
          }
          
          delay(10);
        }
        
        if (written == contentLength) {
          Serial.println("✅ Firmware written successfully");
          Serial.println("🔄 Applying update...");
          
          // End OTA and apply update
          bool otaEnd = ESP32OTA.end();
          
          if (otaEnd) {
            Serial.println("✅ Update completed successfully!");
            Serial.println("🔄 Restarting device...");
            Serial.println("=================================");
            Serial.println("  UPDATE SUCCESSFUL!");
            Serial.println("  Device will restart now");
            Serial.println("=================================");
            
            delay(2000);
            ESP.restart();
          } else {
            Serial.println("❌ Failed to apply update");
          }
        } else {
          Serial.println("❌ Firmware size mismatch");
          ESP32OTA.abort();
        }
      } else {
        Serial.println("❌ Failed to begin OTA update");
      }
    } else {
      Serial.println("❌ Failed to get firmware stream");
    }
  } else {
    Serial.print("❌ Failed to download firmware: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  
  // Reset update flag
  updateAvailable = false;
  updateUrl = "";
  updateVersion = "";
  
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

// ==================== ERROR HANDLING ====================
void handleOTAError(int error) {
  Serial.println("❌ OTA Update Error:");
  switch (error) {
    case OTA_AUTH_ERROR:
      Serial.println("Auth Failed");
      break;
    case OTA_BEGIN_ERROR:
      Serial.println("Begin Failed");
      break;
    case OTA_CONNECT_ERROR:
      Serial.println("Connect Failed");
      break;
    case OTA_RECEIVE_ERROR:
      Serial.println("Receive Failed");
      break;
    case OTA_END_ERROR:
      Serial.println("End Failed");
      break;
    default:
      Serial.println("Unknown Error");
      break;
  }
  
  // Reset update flag
  updateAvailable = false;
  updateUrl = "";
  updateVersion = "";
}