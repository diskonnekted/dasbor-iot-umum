# ESP32 Monitor Dashboard

Dashboard untuk monitoring ESP32 secara real-time dengan domain https://desa.orbitdev.id/

## Fitur

- **Real-time Monitoring**: Status koneksi dan data ESP32 diperbarui secara real-time
- **Spesifikasi Lengkap**: Menampilkan informasi chip, memory, dan software ESP32
- **Status Pin GPIO**: Monitoring ketersediaan dan mode pin GPIO
- **WebSocket Support**: Update data real-time tanpa perlu refresh
- **Database Persistence**: Data disimpan menggunakan Prisma dengan SQLite

## API Endpoints

### 1. Menerima Data dari ESP32
```
POST /api/esp32/data
Content-Type: application/json

{
  "chipId": "ESP32-001",
  "mac": "24:6F:28:AB:CD:EF",
  "ip": "192.168.1.100",
  "flashSize": 4194304,
  "freeHeap": 234567,
  "cpuFreq": 240,
  "sdkVersion": "v4.4.1",
  "coreVersion": "2.0.11",
  "wifiRssi": -45,
  "uptime": 3600,
  "pins": [
    {
      "number": 2,
      "available": true,
      "mode": "INPUT",
      "value": 1
    }
  ]
}
```

### 2. Mendapatkan Status ESP32
```
GET /api/esp32/status
```

## Contoh Arduino Code untuk ESP32

Berikut adalah contoh kode Arduino untuk ESP32 yang dapat digunakan untuk mengirim data ke dashboard:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <esp_wifi.h>

// WiFi Configuration
const char* ssid = "TOTOLINK_N200RE";
const char* password = ""; // Tanpa password

// Server Configuration
const char* serverUrl = "https://desa.orbitdev.id/api/esp32/data";

// Variables
unsigned long previousMillis = 0;
const long interval = 10000; // Kirim data setiap 10 detik

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi Terhubung!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  // Print initial connection status
  Serial.println("ESP32 siap mengirim data ke dashboard");
}

void loop() {
  unsigned long currentMillis = millis();
  
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    if (WiFi.status() == WL_CONNECTED) {
      sendSensorData();
    } else {
      Serial.println("WiFi terputus, mencoba menghubungkan kembali...");
      WiFi.reconnect();
    }
  }
}

void sendSensorData() {
  HTTPClient http;
  
  // Create JSON document
  DynamicJsonDocument doc(2048);
  
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
  
  // Add pin information (contoh untuk beberapa pin)
  JsonArray pins = doc.createNestedArray("pins");
  
  // GPIO 2 (Biasanya LED built-in)
  JsonObject pin2 = pins.createNestedObject();
  pin2["number"] = 2;
  pin2["available"] = true;
  pin2["mode"] = "OUTPUT";
  pin2["value"] = digitalRead(2);
  
  // GPIO 4
  JsonObject pin4 = pins.createNestedObject();
  pin4["number"] = 4;
  pin4["available"] = true;
  pin4["mode"] = "INPUT";
  pin4["value"] = digitalRead(4);
  
  // GPIO 5
  JsonObject pin5 = pins.createNestedObject();
  pin5["number"] = 5;
  pin5["available"] = true;
  pin5["mode"] = "INPUT";
  pin5["value"] = digitalRead(5);
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST request
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  Serial.println("Mengirim data ke server...");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    String response = http.getString();
    Serial.print("Server response: ");
    Serial.println(response);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Data terkirim berhasil!");
    } else {
      Serial.println("❌ Gagal mengirim data");
    }
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

String getChipId() {
  uint64_t chipid = ESP.getEfuseMac();
  return String((uint16_t)(chipid >> 32), HEX) + 
         String((uint32_t)chipid, HEX);
}

// Fungsi untuk menampilkan status koneksi di serial monitor
void printConnectionStatus() {
  Serial.println("=== Status Koneksi ESP32 ===");
  Serial.print("WiFi SSID: ");
  Serial.println(ssid);
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("MAC Address: ");
  Serial.println(WiFi.macAddress());
  Serial.print("Signal Strength: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
  Serial.print("Free Heap: ");
  Serial.print(ESP.getFreeHeap());
  Serial.println(" bytes");
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds");
  Serial.println("========================");
}
```

## Cara Menggunakan

1. **Upload kode Arduino ke ESP32**
   - Buka Arduino IDE
   - Install library yang dibutuhkan: `WiFi`, `HTTPClient`, `ArduinoJson`
   - Pilih board ESP32 yang sesuai
   - Upload kode di atas

2. **Monitor Serial Output**
   - Buka Serial Monitor (baudrate 115200)
   - Anda akan melihat status koneksi dan pengiriman data
   - Contoh output:
     ```
     WiFi Terhubung!
     IP Address: 192.168.1.100
     ESP32 siap mengirim data ke dashboard
     Mengirim data ke server...
     HTTP Response code: 200
     ✅ Data terkirim berhasil!
     ```

3. **Buka Dashboard**
   - Akses https://desa.orbitdev.id/
   - Dashboard akan menampilkan data ESP32 secara real-time
   - Status akan berubah menjadi "Terhubung" ketika data diterima

## Struktur Data yang Dikirim ESP32

### Field Wajib:
- `chipId`: Unique identifier ESP32
- `mac`: MAC address WiFi
- `ip`: IP address ESP32

### Field Opsional:
- `flashSize`: Ukuran flash memory
- `freeHeap`: Memory tersedia
- `cpuFreq`: Frekuensi CPU
- `sdkVersion`: Versi SDK ESP32
- `coreVersion`: Versi Arduino core
- `wifiRssi`: Kekuatan sinyal WiFi
- `uptime`: Waktu operasi dalam detik
- `pins`: Array status pin GPIO

## Troubleshooting

### 1. ESP32 tidak terhubung ke WiFi
- Pastikan SSID "TOTOLINK_N200RE" tersedia
- Check jarak antara ESP32 dan access point
- Pastikan tidak ada password yang dibutuhkan

### 2. Data tidak terkirim ke server
- Check koneksi internet
- Pastikan domain https://desa.orbitdev.id/ dapat diakses
- Monitor serial output untuk error message

### 3. Dashboard tidak menampilkan data
- Refresh halaman dashboard
- Check console browser untuk error
- Pastikan API endpoint merespon dengan benar

## Monitoring di Serial Monitor

Serial monitor akan menampilkan:
- Status koneksi WiFi
- Status pengiriman data (berhasil/gagal)
- Response dari server
- Informasi spesifikasi ESP32

Contoh output yang diharapkan:
```
Menghubungkan ke WiFi....
WiFi Terhubung!
IP Address: 192.168.1.100
ESP32 siap mengirim data ke dashboard

Mengirim data ke server...
HTTP Response code: 200
Server response: {"success":true,"message":"Data received successfully"}
✅ Data terkirim berhasil!
```

Dashboard akan secara otomatis menampilkan data terbaru dari ESP32 setiap 10 detik.