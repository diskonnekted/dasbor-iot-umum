# ESP32 Firmware Build Guide

## 📦 Cara Membuat Firmware .bin untuk ESP32

### 🎯 Metode 1: Arduino IDE (Paling Mudah)

#### Langkah 1: Setup Arduino IDE
```bash
1. Download Arduino IDE 2.0+
2. Tambahkan ESP32 Board Support:
   - File → Preferences
   - Additional Boards Manager URLs:
   - Tambahkan: https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
3. Tools → Board → Boards Manager → Search "ESP32" → Install
4. Pilih Board: Tools → Board → ESP32 Arduino → ESP32 Dev Module
```

#### Langkah 2: Compile ke .bin
```bash
1. Buka sketch ESP32 Anda
2. Pilih Board yang sesuai
3. Pilih Port (untuk upload testing)
4. Klik: Sketch → Export Compiled Binary
```

#### Langkah 3: Lokasi File
```bash
# File akan dihasilkan di:
Windows: C:\Users\[Username]\AppData\Local\Temp\arduino_build_[random]\
macOS: /var/folders/[random]/T/arduino_build_[random]/
Linux: /tmp/arduino_build_[random]/

# File yang dihasilkan:
- sketch.ino.bin (firmware utama)
- sketch.ino.partitions.bin (partisi)
- sketch.ino.bootloader.bin (bootloader)
```

### 🎯 Metode 2: PlatformIO (Recommended untuk Production)

#### Langkah 1: Install PlatformIO
```bash
# Install PlatformIO CLI
pip install platformio

# Atau install VS Code Extension:
1. Buka VS Code
2. Extensions → Search "PlatformIO IDE"
3. Install extension
4. Restart VS Code
```

#### Langkah 2: Buat Project Structure
```
esp32-firmware/
├── platformio.ini
├── src/
│   └── main.cpp
├── lib/
└── include/
```

#### Langkah 3: platformio.ini
```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
upload_speed = 921600

# Build configuration
build_flags = 
    -DCORE_DEBUG_LEVEL=3
    -DCORE_DEBUG_VIA_SERIAL=1

# OTA configuration
build_type = release
```

#### Langkah 4: Build Firmware
```bash
# Build project
pio run

# File .bin akan ada di:
.pio/build/esp32dev/firmware.bin
```

### 🎯 Metode 3: ESP-IDF (Advanced)

#### Langkah 1: Setup ESP-IDF
```bash
# Clone ESP-IDF
git clone --recursive https://github.com/espressif/esp-idf.git

# Install dependencies
cd esp-idf
./install.sh esp32
source ./export.sh
```

#### Langkah 2: Build Project
```bash
# Configure project
idf.py menuconfig

# Build firmware
idf.py build

# File .bin ada di:
build/esp32/firmware.bin
```

### 🎯 Metode 4: Build Script Otomatis

#### Gunakan build script yang saya sediakan:
```bash
# Buat script executable
chmod +x build_firmware.sh

# Build dengan version
./build_firmware.sh 1.0.0

# Build tanpa version (default 1.0.0)
./build_firmware.sh
```

#### Features Build Script:
- Otomatis detect Arduino CLI atau PlatformIO
- Create versioned firmware files
- Generate checksum untuk integrity
- Create build info JSON
- Support untuk multiple build methods

### 📋 Contoh Firmware yang Dihasilkan

#### File Structure:
```
firmware/
├── esp32-monitor_v1.0.0_20240101_120000.bin
├── esp32-monitor_v1.0.0_20240101_120000.sha256
└── build_info.json
```

#### build_info.json:
```json
{
    "project": "esp32-monitor",
    "version": "1.0.0",
    "filename": "esp32-monitor_v1.0.0_20240101_120000.bin",
    "build_time": "2024-01-01T12:00:00Z",
    "build_type": "ota",
    "target": "ESP32",
    "checksum": "a1b2c3d4e5f6..."
}
```

### 🔧 Best Practices untuk Production

#### 1. Version Management
```bash
# Gunakan semantic versioning
1.0.0 - Major release
1.1.0 - Minor release
1.1.1 - Patch release
```

#### 2. Build Configuration
```ini
# Untuk production build
build_type = release
build_flags = 
    -Os                    # Optimize size
    -DNDEBUG              # Disable debug
    -DCORE_DEBUG_LEVEL=0  # No debug output
```

#### 3. Testing
```bash
# Test firmware sebelum upload ke production
1. Upload ke development ESP32
2. Monitor serial output
3. Test semua fitur
4. Check stability
```

#### 4. Quality Assurance
```bash
# Create checksum untuk integrity
sha256sum firmware.bin > firmware.bin.sha256

# Verify checksum
sha256sum -c firmware.bin.sha256

# Create build logs
pio run > build.log 2>&1
```

### 🚀 Workflow Production

#### 1. Development
```bash
1. Develop fitur baru
2. Test di development board
3. Fix bugs
4. Version bump
```

#### 2. Build
```bash
1. Run build script
2. Verify checksum
3. Test firmware di development board
4. Create release notes
```

#### 3. Deployment
```bash
1. Upload firmware ke OTA system
2. Activate version
3. Monitor deployment
4. Rollback jika ada masalah
```

### 📊 File Size Optimization

#### Tips untuk Mengurangi Size:
```cpp
// Gunakan PROGMEM untuk constants
const char* const largeString PROGMEM = "Large string...";

// Gunakan F() macro untuk strings
Serial.println(F("This string goes to flash"));

// Gunakan appropriate data types
uint8_t smallNumber = 255;  // Bukan int

// Optimasi libraries
// Hapus include yang tidak perlu
// Gunakan library yang lebih efisien
```

### 🔍 Debugging

#### Enable Debug Output:
```cpp
#define DEBUG_MODE 1

#if DEBUG_MODE
  Serial.println("Debug message");
#endif
```

#### Serial Monitor untuk Debug:
```bash
# Monitor output saat development
# Check untuk memory leaks
# Verify OTA process
# Test error handling
```

### 📝 Documentation

#### Release Notes Template:
```markdown
# Release v1.0.0

## Features
- Initial OTA support
- WiFi connection monitoring
- GPIO status reporting

## Bug Fixes
- Fixed memory leak in data transmission
- Improved error handling

## Known Issues
- None

## Installation
1. Upload firmware via OTA Manager
2. Device will restart automatically
3. Verify version in dashboard
```

### 🎯 Quick Start Commands

#### Build dan Upload:
```bash
# Build firmware
./build_firmware.sh 1.0.0

# Upload ke OTA system
# Buka https://desa.orbitdev.id/ota
# Upload firmware.bin yang dihasilkan

# Test di ESP32
# Monitor serial output untuk update process
```

### 📞 Troubleshooting

#### Common Issues:
1. **Build Failed**: Check board configuration
2. **Upload Failed**: Verify file integrity
3. **OTA Failed**: Check WiFi connection
4. **Boot Loop**: Verify firmware compatibility

#### Solutions:
```bash
# Clean build
pio run --target clean

# Rebuild
pio run

# Check dependencies
pio platform install espressif32

# Update PlatformIO
pip install --upgrade platformio
```

### 🎉 Summary

Dengan guide ini, Anda bisa:
- Build firmware .bin dengan mudah
- Version control untuk production
- Automated build process
- Quality assurance testing
- Smooth OTA deployment

**Pilih metode yang paling sesuai dengan kebutuhan Anda!** 🚀