#!/bin/bash

# ESP32 Monitor Dashboard - Server Update Script
# Update sistem di server hosting dengan semua fitur terbaru

echo "🚀 ESP32 Monitor Dashboard - Server Update Script"
echo "=================================================="

# Configuration
PROJECT_DIR="/home/orbitdev-desa/htdocs/desa.orbitdev.id/dasbor-iot-umum"
GITHUB_REPO="https://github.com/diskonnekted/dasbor-iot-umum.git"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to backup current version
backup_current() {
    print_info "Creating backup of current version..."
    
    BACKUP_DIR="${PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup important files
    cp -r "${PROJECT_DIR}/db" "$BACKUP_DIR/" 2>/dev/null || true
    cp "${PROJECT_DIR}/.env" "$BACKUP_DIR/" 2>/dev/null || true
    cp -r "${PROJECT_DIR}/.next" "$BACKUP_DIR/" 2>/dev/null || true
    
    print_status "Backup created at: $BACKUP_DIR"
}

# Function to update from GitHub
update_from_github() {
    print_info "Updating from GitHub..."
    
    cd "$PROJECT_DIR"
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not a git repository. Initializing..."
        git init
        git remote add origin "$GITHUB_REPO"
    fi
    
    # Pull latest changes
    if git pull origin master; then
        print_status "Successfully pulled latest changes"
    else
        print_error "Failed to pull from GitHub"
        return 1
    fi
}

# Function to update database
update_database() {
    print_info "Updating database schema..."
    
    cd "$PROJECT_DIR"
    
    # Generate Prisma client
    if npx prisma generate; then
        print_status "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        return 1
    fi
    
    # Push schema changes
    if npx prisma db push; then
        print_status "Database schema updated"
    else
        print_error "Failed to update database schema"
        return 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing/updating dependencies..."
    
    cd "$PROJECT_DIR"
    
    # Check if node_modules exists and is recent
    if [ -d "node_modules" ]; then
        NODE_MODULES_AGE=$(find node_modules -type f -printf '%T@' | sort -n | tail -1 | cut -d@ -f1)
        CURRENT_TIME=$(date +%s)
        AGE_DIFF=$((CURRENT_TIME - NODE_MODULES_AGE))
        
        # If node_modules is older than 7 days, reinstall
        if [ $AGE_DIFF -gt 604800 ]; then
            print_warning "node_modules is old, reinstalling..."
            rm -rf node_modules package-lock.json
        fi
    fi
    
    # Install dependencies
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        return 1
    fi
}

# Function to build application
build_application() {
    print_info "Building application..."
    
    cd "$PROJECT_DIR"
    
    # Build for production
    if npm run build; then
        print_status "Application built successfully"
    else
        print_error "Failed to build application"
        return 1
    fi
}

# Function to restart application
restart_application() {
    print_info "Restarting application..."
    
    cd "$PROJECT_DIR"
    
    # Check if PM2 is installed
    if command_exists pm2; then
        # Restart existing process
        if pm2 list | grep -q "dasbor-iot"; then
            if pm2 restart dasbor-iot; then
                print_status "Application restarted with PM2"
            else
                print_error "Failed to restart application with PM2"
                return 1
            fi
        else
            # Start new process
            if pm2 start npm --name "dasbor-iot" -- start; then
                print_status "Application started with PM2"
            else
                print_error "Failed to start application with PM2"
                return 1
            fi
        fi
        
        # Save PM2 configuration
        pm2 save
        pm2 startup
        
    else
        print_error "PM2 is not installed. Please install PM2 first."
        print_info "Install PM2: npm install -g pm2"
        return 1
    fi
}

# Function to create firmware directory
create_firmware_directory() {
    print_info "Creating firmware directory..."
    
    cd "$PROJECT_DIR"
    
    # Create firmware directory
    if [ ! -d "firmware" ]; then
        mkdir -p firmware
        chmod 755 firmware
        print_status "Firmware directory created"
    else
        print_status "Firmware directory already exists"
    fi
}

# Function to verify installation
verify_installation() {
    print_info "Verifying installation..."
    
    cd "$PROJECT_DIR"
    
    # Check PM2 status
    if pm2 list | grep -q "dasbor-iot.*online"; then
        print_status "Application is running"
    else
        print_error "Application is not running properly"
        pm2 logs dasbor-iot --lines 10
        return 1
    fi
    
    # Check main dashboard
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        print_status "Main dashboard is accessible"
    else
        print_error "Main dashboard is not accessible"
        return 1
    fi
    
    # Check OTA endpoint
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/ota/firmware | grep -q "200"; then
        print_status "OTA endpoint is accessible"
    else
        print_error "OTA endpoint is not accessible"
        return 1
    fi
}

# Function to show logs
show_logs() {
    print_info "Showing recent logs..."
    
    cd "$PROJECT_DIR"
    
    if command_exists pm2; then
        pm2 logs dasbor-iot --lines 20
    else
        print_error "PM2 is not available"
    fi
}

# Function to show status
show_status() {
    print_info "Current status:"
    
    cd "$PROJECT_DIR"
    
    echo ""
    echo "📁 Project Directory: $PROJECT_DIR"
    echo "📋 Git Status:"
    git status --porcelain | head -5
    echo ""
    echo "🔄 PM2 Status:"
    pm2 list | grep dasbor-iot
    echo ""
    echo "🌐 Application Health:"
    echo "  Main Dashboard: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "Failed")"
    echo "  OTA Endpoint: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/ota/firmware 2>/dev/null || echo "Failed")"
    echo ""
}

# Main execution
main() {
    echo "Starting update process..."
    echo "Project Directory: $PROJECT_DIR"
    echo ""
    
    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Project directory does not exist: $PROJECT_DIR"
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-all}" in
        "backup")
            backup_current
            ;;
        "update")
            update_from_github
            ;;
        "database")
            update_database
            ;;
        "deps")
            install_dependencies
            ;;
        "build")
            build_application
            ;;
        "restart")
            restart_application
            ;;
        "firmware")
            create_firmware_directory
            ;;
        "verify")
            verify_installation
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "all")
            backup_current
            update_from_github
            update_database
            install_dependencies
            build_application
            create_firmware_directory
            restart_application
            verify_installation
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  all       - Complete update process (default)"
            echo "  backup    - Backup current version"
            echo "  update    - Update from GitHub"
            echo "  database  - Update database schema"
            echo "  deps      - Install/update dependencies"
            echo "  build     - Build application"
            echo "  restart   - Restart application"
            echo "  firmware  - Create firmware directory"
            echo "  verify    - Verify installation"
            echo "  logs      - Show application logs"
            echo "  status    - Show current status"
            echo "  help      - Show this help"
            exit 0
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' untuk available commands"
            exit 1
            ;;
    esac
    
    echo ""
    print_status "Update process completed!"
    echo ""
    echo "🌐 Access Points:"
    echo "  Main Dashboard: https://desa.orbitdev.id/"
    echo "  OTA Manager: https://desa.orbitdev.id/ota"
    echo ""
}

# Run main function
main "$@"