# 📁 ESP32 Monitor Dashboard Script

Saya telah menyediakan 2 versi script ESP32 untuk Anda:

## 📂 File yang Tersedia:

### 1. `esp32_monitor_dashboard.ino` (Versi Lengkap)
- Menggunakan library **ArduinoJson** (lebih efisien)
- Fitur lengkap dengan error handling
- Monitoring 14 pin GPIO
- Ukuran file lebih kecil
- **Rekomendasi utama**

### 2. `esp32_simple_version.ino` (Versi Sederhana)
- **Tanpa library eksternal** (hanya WiFi dan HTTPClient)
- JSON dibuat manual dengan string concatenation
- Cocok jika tidak mau install ArduinoJson
- Fitur monitoring sama

## 🚀 Cara Cepat Upload:

### Pilihan 1: Versi Lengkap (Rekomendasi)
1. Install library **ArduinoJson** dari Library Manager
2. Upload `esp32_monitor_dashboard.ino`

### Pilihan 2: Versi Sederhana (Tanpa Library)
1. Tidak perlu install library tambahan
2. Upload `esp32_simple_version.ino`

## 📋 Langkah-langkah Upload:

1. **Buka Arduino IDE**
2. **Install ESP32 Board Manager** (jika belum):
   - File → Preferences → Additional URLs:
   - Tambahkan: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install

3. **Pilih Board**:
   - Tools → Board → ESP32 Arduino → ESP32 Dev Module

4. **Install Library** (hanya untuk versi lengkap):
   - Tools → Manage Libraries → Search "ArduinoJson" → Install

5. **Upload Script**:
   - Buka file `.ino` yang dipilih
   - Hubungkan ESP32 ke USB
   - Pilih port yang sesuai
   - Klik Upload (→)

6. **Monitor Serial**:
   - Buka Serial Monitor (Ctrl+Shift+M)
   - Set baudrate **115200**
   - Lihat output ESP32

## 📊 Output yang Diharapkan:

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

## 🌐 Buka Dashboard:

Setelah ESP32 mengirim data pertama:
1. Buka browser
2. Akses: **https://desa.orbitdev.id/**
3. Dashboard akan menampilkan data ESP32 secara real-time

## ⚙️ Konfigurasi Cepat:

### Ubah WiFi (jika perlu):
```cpp
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI";
```

### Ubah Interval (jika perlu):
```cpp
const long interval = 5000; // 5 detik (ubah dari 10000)
```

## 🔧 Pin GPIO yang Dimonitor:

- **GPIO 2**: LED built-in (OUTPUT)
- **GPIO 4, 5, 12-19, 21-23**: Input dengan pull-up
- Total: **14 pin** yang dimonitor statusnya

## 📱 Cara Membaca Serial Monitor:

- ✅ **Hijau**: Berhasil
- ❌ **Merah**: Error
- ⚠️ **Kuning**: Warning
- 📡 **Data**: Pengiriman data
- 🔌 **Koneksi**: Status WiFi

## 🆘 Jika Ada Masalah:

1. **Upload Gagal**: Coba tekan tombol BOOT saat upload
2. **WiFi Gagal**: Check SSID "TOTOLINK_N200RE" harus aktif
3. **Data Tidak Terkirim**: Check internet dan domain https://desa.orbitdev.id/
4. **Dashboard Kosong**: Refresh browser dan pastikan ESP32 mengirim data

## 📞 Bantuan:

Lihat file `README_UPLOAD.md` untuk panduan detail lengkap!

**Script siap digunakan untuk eksperimen ESP32 Anda!** 🎉