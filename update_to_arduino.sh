#!/bin/bash

# ESP32 Monitor Dashboard - Arduino IDE Update Script
# Script lengkap untuk update semua file ke Arduino IDE

echo "🔧 ESP32 Monitor Dashboard - Arduino IDE Update Script"
echo "=========================================================="

# Configuration
PROJECT_NAME="ESP32-Monitor-Dashboard"
ARDUINO_PROJECT_DIR="$HOME/Arduino/$PROJECT_NAME"
GITHUB_REPO="https://github.com/diskonnekted/dasbor-iot-umum.git"
TEMP_DIR="/tmp/esp32_arduino_update"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_header() {
    echo -e "${BLUE}🔧 $1${NC}"
}

# Function to check if Arduino IDE is installed
check_arduino_ide() {
    print_info "Checking Arduino IDE installation..."
    
    # Check for Arduino IDE in common locations
    ARDUINO_PATHS=(
        "$HOME/.local/share/arduino15"
        "$HOME/.arduino15"
        "$HOME/AppData/Local/Arduino15"
        "/Applications/Arduino.app"
        "/usr/bin/arduino"
    )
    
    for path in "${ARDUINO_PATHS[@]}"; do
        if [ -d "$path" ]; then
            ARDUINO_PATH="$path"
            print_status "Arduino IDE found at: $ARDUINO_PATH"
            return 0
        fi
    done
    
    print_warning "Arduino IDE not found in standard locations"
    print_info "Please install Arduino IDE first:"
    print_info "https://www.arduino.cc/en/software"
    return 1
}

# Function to backup existing Arduino project
backup_existing_project() {
    print_info "Checking for existing Arduino project..."
    
    if [ -d "$ARDUINO_PROJECT_DIR" ]; then
        BACKUP_DIR="${ARDUINO_PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        print_warning "Existing project found, backing up to: $BACKUP_DIR"
        cp -r "$ARDUINO_PROJECT_DIR" "$BACKUP_DIR"
        print_status "Backup completed"
    else
        print_status "No existing project found"
    fi
}

# Function to clone from GitHub
clone_from_github() {
    print_info "Cloning latest files from GitHub..."
    
    # Clean temp directory
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"
    
    # Clone repository
    if git clone "$GITHUB_REPO" "$TEMP_DIR"; then
        print_status "Successfully cloned from GitHub"
    else
        print_error "Failed to clone from GitHub"
        return 1
    fi
}

# Function to prepare Arduino project structure
prepare_arduino_project() {
    print_info "Preparing Arduino project structure..."
    
    # Create Arduino project directory
    mkdir -p "$ARDUINO_PROJECT_DIR"
    
    # Copy ESP32 OTA script
    if [ -f "$TEMP_DIR/esp32_monitor_dashboard/esp32_ota_update.ino" ]; then
        cp "$TEMP_DIR/esp32_monitor_dashboard/esp32_ota_update.ino" "$ARDUINO_PROJECT_DIR/"
        print_status "ESP32 OTA script copied"
    else
        print_error "ESP32 OTA script not found"
        return 1
    fi
    
    # Copy regular ESP32 monitoring script
    if [ -f "$TEMP_DIR/esp32_monitor_dashboard/esp32_monitor_dashboard.ino" ]; then
        cp "$TEMP_DIR/esp32_monitor_dashboard/esp32_monitor_dashboard.ino" "$ARDUINO_PROJECT_DIR/"
        print_status "ESP32 monitoring script copied"
    else
        print_error "ESP32 monitoring script not found"
        return 1
    fi
    
    # Copy build script
    if [ -f "$TEMP_DIR/build_firmware.sh" ]; then
        cp "$TEMP_DIR/build_firmware.sh" "$ARDUINO_PROJECT_DIR/"
        chmod +x "$ARDUINO_PROJECT_DIR/build_firmware.sh"
        print_status "Build script copied and made executable"
    fi
    
    # Copy documentation
    if [ -f "$TEMP_DIR/FIRMWARE_BUILD_GUIDE.md" ]; then
        cp "$TEMP_DIR/FIRMWARE_BUILD_GUIDE.md" "$ARDUINO_PROJECT_DIR/"
        print_status "Firmware build guide copied"
    fi
    
    if [ -f "$TEMP_DIR/OTA_SYSTEM_GUIDE.md" ]; then
        cp "$TEMP_DIR/OTA_SYSTEM_GUIDE.md" "$ARDUINO_PROJECT_DIR/"
        print_status "OTA system guide copied"
    fi
}

# Function to create Arduino project files
create_arduino_files() {
    print_info "Creating Arduino project files..."
    
    # Create project structure
    mkdir -p "$ARDUINO_PROJECT_DIR/lib"
    mkdir -p "$ARDUINO_PROJECT_DIR/src"
    
    # Create library.properties
    cat > "$ARDUINO_PROJECT_DIR/library.properties" << EOF
name=$PROJECT_NAME
version=1.0.0
author=Z.ai Code Assistant
maintainer=Z.ai Code Assistant
sentence=ESP32 Monitor Dashboard with OTA support.
paragraph=Complete ESP32 monitoring system with real-time dashboard, OTA updates, and firmware management.
category=Device Control
url=https://github.com/diskonnekted/dasbor-iot-umum
architectures=esp32
depends=ArduinoJson@^6.19.2
EOF
    
    # Create platformio.ini (optional)
    cat > "$ARDUINO_PROJECT_DIR/platformio.ini" << EOF
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
upload_speed = 921600
build_flags = 
    -DCORE_DEBUG_LEVEL=3
    -DCORE_DEBUG_VIA_SERIAL=1
lib_deps = 
    bblanchon/ArduinoJson@^6.19.2
EOF
    
    # Create README for Arduino project
    cat > "$ARDUINO_PROJECT_DIR/README.md" << EOF
# $PROJECT_NAME

ESP32 Monitor Dashboard with OTA support for Arduino IDE.

## Files

### ESP32 Scripts
- \`esp32_ota_update.ino\` - OTA update script (recommended)
- \`esp32_monitor_dashboard.ino\` - Regular monitoring script

### Build Tools
- \`build_firmware.sh\` - Automated firmware build script
- \`platformio.ini\` - PlatformIO configuration

### Documentation
- \`FIRMWARE_BUILD_GUIDE.md\` - Complete build guide
- \`OTA_SYSTEM_GUIDE.md\` - OTA system documentation

## Setup

### 1. Install Arduino IDE
Download from: https://www.arduino.cc/en/software

### 2. Install ESP32 Board Support
1. Open Arduino IDE
2. Go to File → Preferences
3. Add this URL to "Additional Boards Manager URLs":
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
4. Click OK
5. Go to Tools → Board → Boards Manager
6. Search for "ESP32" and install "ESP32 by Espressif Systems"

### 3. Install Libraries
1. Go to Tools → Manage Libraries
2. Search for and install "ArduinoJson" by Benoit Blanchon (version 6.19.2 or later)

### 4. Configure WiFi
Edit the following lines in the .ino files:

\`\`\`cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://desa.orbitdev.id";
const char* currentVersion = "1.0.0";
\`\`\`

### 5. Upload to ESP32
1. Connect ESP32 to computer
2. Select Board: Tools → Board → ESP32 Arduino → ESP32 Dev Module
3. Select Port: Tools → Port → (select your ESP32 port)
4. Upload the script

### 6. Monitor
Open Serial Monitor (Tools → Serial Monitor) with baud rate 115200

## Features

### OTA Update Script
- Automatic update checking every 60 seconds
- Safe firmware download and installation
- Progress indicators via LED and serial output
- Error handling and recovery
- Version management

### Monitoring Script
- Real-time data transmission to dashboard
- GPIO pin status monitoring
- WiFi connection monitoring
- Device specifications reporting

## Web Dashboard

Access your ESP32 dashboard at: https://desa.orbitdev.id/

## Support

For issues and questions:
- Check the documentation files
- Monitor serial output
- Verify network connectivity
- Check web dashboard status

## Build Scripts

Use the included build scripts for automated firmware generation:

\`\`\`bash
# Build firmware
./build_firmware.sh 1.1.0

# Use PlatformIO
pio run
\`\`\`
EOF
    
    print_status "Arduino project files created"
}

# Function to create launch scripts
create_launch_scripts() {
    print_info "Creating launch scripts..."
    
    # Create Arduino IDE launch script
    cat > "$ARDUINO_PROJECT_DIR/launch_arduino.sh" << EOF
#!/bin/bash

# Launch Arduino IDE with this project
echo "🔧 Launching Arduino IDE with $PROJECT_NAME..."

# Detect OS and launch Arduino IDE
if [[ "\$OSTYPE" == "linux-gnu"* ]]; then
    arduino "\$(pwd)" 2>/dev/null || arduino
elif [[ "\$OSTYPE" == "darwin"* ]]; then
    open -a Arduino "\$(pwd)" 2>/dev/null || open -a /Applications/Arduino.app "\$(pwd)"
elif [[ "\$OSTYPE" == "msys" ]] || [[ "\$OSTYPE" == "cygwin" ]]; then
    start arduino "\$(pwd)" 2>/dev/null || arduino
else
    echo "Unsupported OS. Please open Arduino IDE manually."
    echo "Project location: \$(pwd)"
fi
EOF
    
    chmod +x "$ARDUINO_PROJECT_DIR/launch_arduino.sh"
    print_status "Arduino IDE launch script created"
    
    # Create VS Code launch script (if VS Code is preferred)
    cat > "$ARDUINO_PROJECT_DIR/launch_vscode.sh" << EOF
#!/bin/bash

# Launch VS Code with this project
echo "💻 Launching VS Code with $PROJECT_NAME..."

# Check if VS Code is installed
if command -v code &> /dev/null; then
    code "\$(pwd)"
else
    echo "VS Code not found. Please install VS Code."
    echo "Download from: https://code.visualstudio.com/"
fi
EOF
    
    chmod +x "$ARDUINO_PROJECT_DIR/launch_vscode.sh"
    print_status "VS Code launch script created"
}

# Function to create quick setup guide
create_setup_guide() {
    print_info "Creating quick setup guide..."
    
    cat > "$ARDUINO_PROJECT_DIR/QUICK_SETUP.md" << EOF
# Quick Setup Guide for $PROJECT_NAME

## 🚀 Step 1: Install Arduino IDE

### Windows
1. Download from: https://www.arduino.cc/en/software
2. Run installer
3. Follow installation instructions

### macOS
1. Download from: https://www.arduino.cc/en/software
2. Open .dmg file
3. Drag Arduino to Applications

### Linux
1. Ubuntu/Debian: \`sudo apt install arduino\`
2. Fedora: \`sudo dnf install arduino\`
3. Arch: \`sudo pacman -S arduino\`

## 🔧 Step 2: Install ESP32 Board Support

1. Open Arduino IDE
2. Go to File → Preferences
3. Add this URL to "Additional Boards Manager URLs":
   \`\`\`https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json\`\`\`
4. Click OK
5. Go to Tools → Board → Boards Manager
6. Search for "ESP32"
7. Install "ESP32 by Espressif Systems"

## 📦 Step 3: Install Required Libraries

1. Go to Tools → Manage Libraries
2. Search for and install:
   - \`ArduinoJson\` by Benoit Blanchon (version 6.19.2 or later)

## 📱 Step 4: Configure WiFi

Edit the following lines in the .ino files:

\`\`\`cpp
const char* ssid = "TOTOLINK_N200RE";     // Your WiFi SSID
const char* password = "";                 // Your WiFi password
const char* serverUrl = "https://desa.orbitdev.id"; // Server URL
const char* currentVersion = "1.0.0";       // Current version
\`\`\`

## 🔌 Step 5: Open Project

### Option 1: Use Launch Scripts
\`\`\`bash
./launch_arduino.sh    # Launch Arduino IDE
./launch_vscode.sh    # Launch VS Code
\`\`\`

### Option 2: Manual Open
1. Open Arduino IDE
2. Go to File → Open
3. Navigate to: \`$ARDUINO_PROJECT_DIR\`
4. Select project

## ⚙ Step 6: Configure Arduino IDE

1. Select Board: Tools → Board → ESP32 Arduino → ESP32 Dev Module
2. Select Port: Tools → Port → (select your ESP32 port)
3. Set Upload Speed: Tools → Upload Speed → 921600

## 🔌 Step 7: Upload to ESP32

1. Connect ESP32 to computer via USB
2. Select the correct .ino file:
   - \`esp32_ota_update.ino\` (for OTA updates)
   - \`esp32_monitor_dashboard.ino\` (for regular monitoring)
3. Click Upload button

## 📊 Step 8: Monitor

1. Open Serial Monitor (Tools → Serial Monitor)
2. Set baud rate to 115200
3. Monitor ESP32 output
4. Open web dashboard: https://desa.orbitdev.id/

## 🚀 Step 9: Test OTA Updates

1. Build new firmware using included scripts
2. Upload firmware to web interface: https://desa.orbitdev.id/ota
3. ESP32 will automatically detect and install updates

## 📋 Project Files

- \`esp32_ota_update.ino\` - Automatic OTA update script
- \`esp32_monitor_dashboard.ino\` - Regular monitoring script
- \`build_firmware.sh\` - Automated build script
- \`QUICK_SETUP.md\` - This setup guide
- \`README.md\` - Complete project documentation

## 🆘 Support

For issues:
1. Check serial monitor output
2. Verify WiFi credentials
3. Ensure ESP32 board is selected
4. Check library installation
5. Verify network connectivity

## 🌐 Web Dashboard

Access your ESP32 dashboard at: https://desa.orbitdev.id/
EOF
    
    print_status "Quick setup guide created"
}

# Function to show project summary
show_project_summary() {
    print_info "Project Summary:"
    echo ""
    echo "📁 Project Location: $ARDUINO_PROJECT_DIR"
    echo "📁 Project Name: $PROJECT_NAME"
    echo "📁 Files Copied:"
    echo "  - esp32_ota_update.ino (OTA script)"
    echo "  - esp32_monitor_dashboard.ino (Monitoring script)"
    echo "  - build_firmware.sh (Build script)"
    echo "  - platformio.ini (PlatformIO config)"
    echo "  - library.properties (Arduino library config)"
    echo "  - README.md (Project documentation)"
    echo "  - QUICK_SETUP.md (Setup guide)"
    echo "  - OTA_SYSTEM_GUIDE.md (OTA documentation)"
    echo "  - FIRMWARE_BUILD_GUIDE.md (Build guide)"
    echo "  - launch_arduino.sh (Arduino IDE launcher)"
    echo "  - launch_vscode.sh (VS Code launcher)"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Run: ./launch_arduino.sh"
    echo "  2. Install ESP32 board support"
    echo "  3. Install ArduinoJson library"
    echo "  4. Configure WiFi settings"
    echo "  5. Upload to ESP32"
    echo "  6. Monitor via Serial Monitor"
    echo ""
    echo "🌐 Web Dashboard: https://desa.orbitdev.id/"
    echo ""
}

# Function to cleanup temp files
cleanup_temp() {
    print_info "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
    print_status "Temporary files cleaned up"
}

# Main execution
main() {
    echo "Starting Arduino IDE update process..."
    echo ""
    
    # Check if running with help
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --clean       Clean temporary files only"
        echo "  --backup-only  Only backup existing project"
        echo ""
        echo "This script will:"
        echo "  1. Check Arduino IDE installation"
        echo "  2. Backup existing Arduino project"
        echo "  3. Clone latest files from GitHub"
        echo "  4. Prepare Arduino project structure"
        echo "  5. Create launch scripts"
        echo "  6. Create setup documentation"
        echo "  7. Show project summary"
        exit 0
    fi
    
    # Clean only option
    if [ "$1" = "--clean" ]; then
        cleanup_temp
        exit 0
    fi
    
    # Backup only option
    if [ "$1" = "--backup-only" ]; then
        backup_existing_project
        exit 0
    fi
    
    # Execute main workflow
    check_arduino_ide || exit 1
    backup_existing_project
    clone_from_github || exit 1
    prepare_arduino_project || exit 1
    create_arduino_files
    create_launch_scripts
    create_setup_guide
    show_project_summary
    cleanup_temp
    
    echo ""
    print_status "Arduino IDE update completed successfully!"
    echo ""
    echo "🚀 Ready to start developing!"
    echo ""
    echo "📁 Project Location: $ARDUINO_PROJECT_DIR"
    echo "🔧 Quick Start: ./launch_arduino.sh"
    echo "🌐 Web Dashboard: https://desa.orbitdev.id/"
    echo ""
}

# Run main function
main "$@"