# 🚨 500 Error Troubleshooting Guide

## 🔍 Quick Debug Commands (Jalankan di Server)

```bash
# 1. Check aplikasi status
pm2 status

# 2. Check aplikasi logs
pm2 logs dasbor-iot

# 3. Check database
ls -la db/custom.db

# 4. Test API endpoint
curl -X POST https://desa.orbitdev.id/api/esp32/status

# 5. Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 🛠️ Step-by-Step Fix

### Step 1: Restart Aplikasi dengan Debug

```bash
# Navigate ke project
cd ~/htdocs/desa.orbitdev.id/dasbor-iot-umum

# Stop existing process
pm2 stop dasbor-iot
pm2 delete dasbor-iot

# Clean install
rm -rf node_modules package-lock.json
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start dengan development mode untuk debugging
pm2 start npm --name "dasbor-iot" -- start

# Check logs
pm2 logs dasbor-iot --lines 50
```

### Step 2: Test API Manual

```bash
# Test status endpoint
curl -X GET https://desa.orbitdev.id/api/esp32/status

# Test data endpoint dengan sample data
curl -X POST https://desa.orbitdev.id/api/esp32/data \
  -H "Content-Type: application/json" \
  -d '{
    "chipId": "TEST-DEVICE",
    "mac": "AA:BB:CC:DD:EE:FF",
    "ip": "192.168.1.100",
    "freeHeap": 250000,
    "cpuFreq": 240
  }'
```

### Step 3: Check Database Permissions

```bash
# Check database file permissions
ls -la db/custom.db

# Fix permissions jika perlu
chmod 664 db/custom.db
chown www-data:www-data db/custom.db

# Test database connection
npx prisma db pull
```

### Step 4: Update Environment

```bash
# Check .env file
cat .env

# Update DATABASE_URL jika perlu
echo "DATABASE_URL=file:/home/orbitdev-desa/htdocs/desa.orbitdev.id/dasbor-iot-umum/db/custom.db" > .env
```

### Step 5: Alternative Setup dengan PM2 Config

```bash
# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'dasbor-iot',
    script: 'npm',
    args: 'start',
    cwd: '/home/orbitdev-desa/htdocs/desa.orbitdev.id/dasbor-iot-umum',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'file:/home/orbitdev-desa/htdocs/desa.orbitdev.id/dasbor-iot-umum/db/custom.db'
    },
    error_file: '/var/log/pm2/dasbor-iot-error.log',
    out_file: '/var/log/pm2/dasbor-iot-out.log',
    log_file: '/var/log/pm2/dasbor-iot-combined.log',
    time: true
  }]
};
EOF

# Start dengan config
pm2 start ecosystem.config.js

# Save PM2 setup
pm2 save
pm2 startup
```

## 📊 Expected Logs Output

Setelah update, Anda seharusnya melihat logs seperti:

```
📥 ESP32 Status Request received
🔍 Fetching most recently active device...
⚠️ No active device found, returning demo data
✅ Status response prepared
```

Dan saat ESP32 mengirim data:

```
📥 ESP32 Data Request received
📦 Request body: {
  "chipId": "ESP32-ABC123",
  "mac": "24:6F:28:AB:CD:EF",
  "ip": "192.168.1.100",
  ...
}
🔍 Looking for device with chipId: ESP32-ABC123
🆕 Creating new device...
✅ Device created successfully with ID: abc123
📌 Default pins created
📊 Creating data record...
✅ Data record created
📌 Updating pin states for 14 pins
✅ Pin states updated
🔍 Fetching updated device data...
✅ ESP32 Data processed successfully
📡 WebSocket event emitted for ESP32 update
```

## 🚨 Common Issues & Solutions

### Issue 1: Database Connection Failed
**Error:** `PrismaClientInitializationError`
**Solution:** 
```bash
npx prisma generate
npx prisma db push
```

### Issue 2: Permission Denied
**Error:** `EACCES: permission denied`
**Solution:**
```bash
sudo chown -R www-data:www-data /home/orbitdev-desa/htdocs/desa.orbitdev.id/dasbor-iot-umum
sudo chmod -R 755 /home/orbitdev-desa/htdocs/desa.orbitdev.id/dasbor-iot-umum
```

### Issue 3: Port Already in Use
**Error:** `EADDRINUSE: address already in use`
**Solution:**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Issue 4: Memory Issues
**Error:** `JavaScript heap out of memory`
**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
pm2 restart dasbor-iot
```

## 📞 Get Help

Jika masih error, jalankan ini dan share outputnya:

```bash
# Share hasilnya
pm2 status
pm2 logs dasbor-iot --lines 20
curl -I https://desa.orbitdev.id/api/esp32/status
ls -la db/
cat .env
```

## 🔄 Recovery Commands

```bash
# Full recovery
cd ~/htdocs/desa.orbitdev.id/dasbor-iot-umum
pm2 stop dasbor-iot
pm2 delete dasbor-iot
rm -rf node_modules package-lock.json .next
npm install
npm run build
pm2 start npm --name "dasbor-iot" -- start
pm2 logs dasbor-iot
```

**Setelah menjalankan commands di atas, ESP32 seharusnya bisa mengirim data dengan response 200!** 🎯