#!/bin/bash

# ESP32 Firmware Build Script
# Otomatisasi proses build untuk OTA update

# Configuration
PROJECT_NAME="esp32-monitor"
BOARD="esp32dev"
OUTPUT_DIR="./firmware"
ARDUINO_CLI="/usr/bin/arduino-cli"

echo "🚀 ESP32 Firmware Build Script"
echo "================================"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to build with Arduino CLI
build_with_arduino() {
    echo "📦 Building with Arduino CLI..."
    
    # Sketch path
    SKETCH_PATH="./esp32_monitor_dashboard/esp32_monitor_dashboard.ino"
    
    # Build command
    $ARDUINO_CLI compile \
        --fqbn esp32:esp32:esp32 \
        --output-dir "$OUTPUT_DIR" \
        "$SKETCH_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ Arduino build successful!"
        return 0
    else
        echo "❌ Arduino build failed!"
        return 1
    fi
}

# Function to build with PlatformIO
build_with_platformio() {
    echo "📦 Building with PlatformIO..."
    
    # Check if PlatformIO is installed
    if ! command -v pio &> /dev/null; then
        echo "❌ PlatformIO not found. Installing..."
        pip install platformio
    fi
    
    # Build command
    pio run --environment esp32dev
    
    if [ $? -eq 0 ]; then
        echo "✅ PlatformIO build successful!"
        
        # Copy firmware to output directory
        cp .pio/build/esp32dev/firmware.bin "$OUTPUT_DIR/${PROJECT_NAME}.bin"
        return 0
    else
        echo "❌ PlatformIO build failed!"
        return 1
    fi
}

# Function to create versioned firmware
create_versioned_firmware() {
    local version=$1
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local filename="${PROJECT_NAME}_v${version}_${timestamp}.bin"
    
    echo "📝 Creating versioned firmware: $filename"
    
    if [ -f "$OUTPUT_DIR/firmware.bin" ]; then
        cp "$OUTPUT_DIR/firmware.bin" "$OUTPUT_DIR/$filename"
        echo "✅ Firmware created: $OUTPUT_DIR/$filename"
        
        # Create checksum
        sha256sum "$OUTPUT_DIR/$filename" > "$OUTPUT_DIR/$filename.sha256"
        echo "🔐 Checksum created: $OUTPUT_DIR/$filename.sha256"
        
        return 0
    else
        echo "❌ Source firmware.bin not found!"
        return 1
    fi
}

# Function to generate build info
generate_build_info() {
    local version=$1
    local timestamp=$(date -Iseconds)
    local filename="${PROJECT_NAME}_v${version}_$(date +"%Y%m%d_%H%M%S").bin"
    
    echo "📋 Generating build info..."
    
    cat > "$OUTPUT_DIR/build_info.json" << EOF
{
    "project": "$PROJECT_NAME",
    "version": "$version",
    "filename": "$filename",
    "build_time": "$timestamp",
    "build_type": "ota",
    "target": "ESP32",
    "checksum": "$(sha256sum "$OUTPUT_DIR/$filename" | cut -d' ' -f1)"
}
EOF
    
    echo "✅ Build info created: $OUTPUT_DIR/build_info.json"
}

# Main execution
main() {
    local version=${1:-"1.0.0"}
    
    echo "🔧 Building version: $version"
    echo "📁 Output directory: $OUTPUT_DIR"
    echo ""
    
    # Try Arduino CLI first
    if command -v $ARDUINO_CLI &> /dev/null; then
        if build_with_arduino; then
            create_versioned_firmware "$version"
            generate_build_info "$version"
            exit 0
        fi
    fi
    
    # Fallback to PlatformIO
    if build_with_platformio; then
        create_versioned_firmware "$version"
        generate_build_info "$version"
        exit 0
    fi
    
    echo "❌ All build methods failed!"
    exit 1
}

# Help function
show_help() {
    echo "Usage: $0 [version]"
    echo ""
    echo "Examples:"
    echo "  $0 1.0.0    # Build version 1.0.0"
    echo "  $0 1.1.0    # Build version 1.1.0"
    echo ""
    echo "Requirements:"
    echo "  - Arduino CLI or PlatformIO"
    echo "  - ESP32 board support"
}

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"

echo ""
echo "🎉 Build process completed!"
echo "📁 Firmware files in: $OUTPUT_DIR"
echo "📋 Build info: $OUTPUT_DIR/build_info.json"
echo "================================"