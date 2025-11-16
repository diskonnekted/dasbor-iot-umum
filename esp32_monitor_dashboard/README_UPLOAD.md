# ESP32 Monitor Dashboard - Script Upload

## 📋 Persiapan Sebelum Upload

### 1. Install Library yang Dibutuhkan
Buka Arduino IDE, lalu install library berikut:
- **WiFi** (biasanya sudah built-in)
- **HTTPClient** (biasanya sudah built-in)
- **ArduinoJson** oleh Benoit Blanchon

Cara install:
1. Buka Arduino IDE
2. Menu → Tools → Manage Libraries
3. Search "ArduinoJson" dan install versi terbaru

### 2. Setup Board ESP32
1. Menu → File → Preferences
2. Additional Boards Manager URLs, tambahkan:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Menu → Tools → Board → Boards Manager
4. Search "ESP32" dan install "ESP32 by Espressif Systems"
5. Pilih board: Tools → Board → ESP32 Arduino → ESP32 Dev Module

## 🔥 Cara Upload Script

### 1. Buka File Script
- Buka file `esp32_monitor_dashboard.ino` di Arduino IDE
- Atau copy-paste kode ke sketch baru

### 2. Koneksi ESP32
- Hubungkan ESP32 ke komputer menggunakan USB
- Pilih port yang sesuai: Tools → Port (pilih port ESP32)

### 3. Upload Script
- Klik tombol Upload (→) atau tekan Ctrl+U
- Tunggu proses upload selesai

### 4. Monitor Serial
- Buka Serial Monitor: Tools → Serial Monitor atau tekan Ctrl+Shift+M
- Set baudrate ke **115200**
- Anda akan melihat output dari ESP32

## 📊 Output yang Diharapkan

Setelah upload berhasil, Serial Monitor akan menampilkan:

```
=================================
  ESP32 MONITOR DASHBOARD
  Domain: desa.orbitdev.id
=================================

🔌 Menghubungkan ke WiFi: TOTOLINK_N200RE
..........
✅ WiFi Terhubung!
📍 IP Address: 192.168.1.100
📶 Signal Strength: -45 dBm
🔗 MAC Address: 24:6F:28:AB:CD:EF

📊 SISTEM INFORMATION
─────────────────────────────────────
🔧 Chip ID: A1B2C3D4E5F6
💾 Flash Size: 4 MB
🧠 Free Heap: 234567 bytes
⚡ CPU Frequency: 240 MHz
📱 SDK Version: v4.4.1
📦 Sketch Size: 45678 bytes
💿 Free Sketch Space: 1345678 bytes
─────────────────────────────────────

✅ ESP32 siap mengirim data ke dashboard
📡 Mengirim data setiap 10 detik...

📤 Mengirim data ke server...
📦 Data size: 2048 bytes
📡 HTTP Response code: 200
📄 Server response: {"success":true,"message":"Data received successfully"}
✅ Data terkirim berhasil!
─────────────────────────────────────
```

## 🌐 Buka Dashboard

1. Buka browser
2. Akses: **https://desa.orbitdev.id/**
3. Dashboard akan menampilkan data ESP32 secara real-time

## ⚙️ Konfigurasi (Jika Diperlukan)

### Mengubah Interval Pengiriman Data
```cpp
const long interval = 10000; // Ubah ke 5000 untuk 5 detik
```

### Mengubah WiFi SSID
```cpp
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI";
```

### Mengubah Server URL
```cpp
const char* serverUrl = "https://domain-anda.com/api/esp32/data";
```

## 🔧 Troubleshooting

### 1. Upload Gagal
- Pastikan driver ESP32 terinstall dengan benar
- Coba ganti USB port
- Tekan tombol BOOT saat upload
- Pastikan board yang dipilih benar

### 2. WiFi Tidak Terhubung
- Check SSID dan password WiFi
- Pastikan access point TOTOLINK_N200RE aktif
- Check jarak antara ESP32 dan router
- Coba restart ESP32

### 3. Data Tidak Terkirim
- Check koneksi internet
- Pastikan domain https://desa.orbitdev.id/ dapat diakses
- Monitor Serial Monitor untuk error message
- Coba restart ESP32

### 4. Dashboard Tidak Update
- Refresh browser
- Check console browser untuk error
- Pastikan ESP32 mengirim data (lihat Serial Monitor)

## 📱 Pin GPIO yang Dimonitor

Script ini memonitor pin GPIO berikut:
- GPIO 2: LED built-in (OUTPUT)
- GPIO 4, 5, 12-19, 21-23: Input dengan pull-up

Anda dapat menghubungkan sensor atau tombol ke pin-pin tersebut untuk monitoring.

## 🎯 Tips Penggunaan

1. **Indikator LED**: LED built-in akan berkedip untuk menunjukkan aktivitas
2. **Serial Monitor**: Selalu buka untuk monitoring status
3. **Dashboard**: Buka di browser untuk monitoring visual
4. **Error Handling**: Script otomatis mencoba reconnect jika WiFi terputus
5. **Data Logging**: Server menyimpan history data ESP32

## 📞 Bantuan

Jika mengalami masalah:
1. Check Serial Monitor untuk error message
2. Pastikan semua library terinstall
3. Verify koneksi hardware
4. Restart ESP32 dan coba lagi

Script ini sudah siap digunakan dan telah diuji untuk eksperimen monitoring ESP32 Anda!