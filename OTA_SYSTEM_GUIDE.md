# ESP32 OTA Update System - Complete Guide

## 🚀 System Overview

Saya telah implementasikan sistem OTA (Over-The-Air) update yang lengkap untuk ESP32 dengan 2 pendekatan:

### Pilihan 1: Web-based OTA (Recommended)
- Upload firmware .bin melalui web interface
- Automatic update checking di ESP32
- Progress indicators dan error handling
- Version management

### Pilihan 2: Binary Upload System
- Upload .bin file langsung ke server
- ESP32 download dan install otomatis
- Safe update dengan rollback protection

## 🌐 Web Interface

### Access OTA Manager
Buka: https://desa.orbitdev.id/ota

### Features:
- **Upload Firmware**: Upload .bin file dengan version control
- **Firmware Library**: Lihat semua firmware yang terupload
- **Progress Indicators**: Real-time upload dan download progress
- **Version Management**: Activate/deactivate firmware versions

## 📱 ESP32 OTA Script

### File: `esp32_ota_update.ino`

**Features:**
- Automatic update checking setiap 60 detik
- Download firmware dari server
- Safe OTA update dengan progress
- Error handling dan retry logic
- LED indicators untuk status

### Cara Upload ke ESP32:

1. **Buka Arduino IDE**
2. **Load script**: `esp32_ota_update.ino`
3. **Setup WiFi**: Tambahkan koneksi monitoring data
4. **Upload ke ESP32**

## 🔄 Cara Kerja System

### 1. Upload Firmware ke Web
```bash
# Di OTA Manager web interface:
1. Masukkan Device Chip ID (contoh: ESP32-001)
2. Pilih firmware .bin file
3. Masukkan version (contoh: 1.1.0)
4. Click "Upload Firmware"
```

### 2. ESP32 Automatic Update
```cpp
// ESP32 akan otomatis:
1. Check update ke server setiap 60 detik
2. Download firmware jika ada update
3. Install dengan aman
4. Restart dengan firmware baru
```

### 3. API Endpoints

#### POST /api/ota/firmware
Upload firmware file ke server
```json
{
  "chipId": "ESP32-001",
  "version": "1.1.0",
  "filename": "ESP32-001_1.1.0.bin"
}
```

#### POST /api/ota/check
Check for available updates
```json
{
  "chipId": "ESP32-001",
  "currentVersion": "1.0.0"
}
```

#### GET /api/ota/download/[id]
Download firmware file
```
GET /api/ota/download/firmware-id
```

## 🛠️ Setup Instructions

### 1. Update Server
```bash
# Di server Anda
cd ~/htdocs/desa.orbitdev.id/dasbor-iot-umum

# Pull latest changes
git pull origin master

# Update database
npm run db:push

# Restart aplikasi
pm2 restart dasbor-iot
```

### 2. Create Firmware Directory
```bash
# Create firmware storage directory
mkdir -p firmware
chmod 755 firmware
```

### 3. Upload ESP32 Script
```bash
# Upload ke ESP32
1. Buka esp32_ota_update.ino
2. Setup WiFi credentials
3. Upload ke ESP32
4. Monitor serial output
```

## 📊 Expected Output

### ESP32 Serial Monitor:
```
=================================
  ESP32 OTA UPDATE SYSTEM
  Domain: desa.orbitdev.id
=================================
Current Version: 1.0.0

🔌 Menghubungkan ke WiFi: TOTOLINK_N200RE
..........
✅ WiFi Terhubung!
📍 IP Address: 192.168.1.100

🔍 Checking for updates...
📡 Server response received
🆕 Update available!
New Version: 1.1.0
🚀 Starting OTA Update...
📥 Downloading firmware...
📦 Firmware size: 1048576 bytes
📤 Writing firmware...
📊 Progress: 25%
📊 Progress: 50%
📊 Progress: 75%
📊 Progress: 100%
✅ Firmware written successfully
🔄 Applying update...
✅ Update completed successfully!
🔄 Restarting device...
=================================
  UPDATE SUCCESSFUL!
  Device will restart now
=================================
```

### Web Interface:
- Upload progress bar
- File size indicator
- Success/error notifications
- Firmware list dengan version info

## 🔧 Configuration

### ESP32 Configuration
```cpp
// Di esp32_ota_update.ino
const char* ssid = "TOTOLINK_N200RE";
const char* password = "";
const char* serverUrl = "https://desa.orbitdev.id";
const char* currentVersion = "1.0.0";
const long checkInterval = 60000; // 60 detik
```

### Server Configuration
```bash
# Environment variables
DATABASE_URL=file:./db/custom.db
NODE_ENV=production
PORT=3000
```

## 📋 Best Practices

### 1. Firmware Versioning
- Gunakan semantic versioning (1.0.0, 1.1.0, 2.0.0)
- Document changes setiap version
- Test thoroughly sebelum upload

### 2. Update Safety
- Backup firmware lama sebelum update
- Test di development device dulu
- Monitor update progress

### 3. Security
- Validate file types (.bin only)
- Limit upload size
- Monitor update logs

## 🚨 Troubleshooting

### Common Issues:

#### 1. Upload Failed
```bash
# Check file permissions
ls -la firmware/
chmod 755 firmware/

# Check disk space
df -h
```

#### 2. ESP32 Update Failed
- Check WiFi connection
- Verify server accessibility
- Monitor serial output untuk error messages

#### 3. Version Conflicts
- Pastikan version number unik
- Check firmware activation status
- Verify database records

## 🎯 Advanced Features

### 1. Rollback Support
- Keep previous firmware versions
- Allow downgrade jika perlu
- Automatic rollback jika update gagal

### 2. Batch Updates
- Update multiple devices sekaligus
- Group devices by type/location
- Schedule updates untuk maintenance window

### 3. Update Notifications
- Email notifications untuk update success/failure
- SMS alerts untuk critical updates
- Dashboard notifications

## 📞 Support

Jika mengalami masalah:
1. Check server logs: `pm2 logs dasbor-iot`
2. Monitor ESP32 serial output
3. Verify network connectivity
4. Check firmware file integrity

## 🎉 Summary

**System ini menyediakan:**
- Web-based firmware management
- Automatic ESP32 updates
- Progress tracking
- Version control
- Error handling
- Safe update process

**Cara penggunaan paling mudah:**
1. Upload firmware ke web interface
2. ESP32 otomatis check dan update
3. Monitor progress di serial monitor
4. Device restart dengan firmware baru

**Sistem OTA siap digunakan!** 🚀