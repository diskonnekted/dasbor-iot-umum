# 🔄 Panduan Update Source Code Server ke GitHub

## 🚀 Cara 1: Direct dari Server (Rekomendasi)

### Langkah 1: SSH ke Server
```bash
ssh user@your-server-ip
```

### Langkah 2: Navigasi ke Project Directory
```bash
cd /path/to/your/dasbor-iot-umum
```

### Langkah 3: Add, Commit, dan Push
```bash
# Tambahkan semua perubahan
git add .

# Commit dengan pesan yang jelas
git commit -m "fix: perbaikan dari server production"

# Push ke GitHub
git push origin master
```

## 📁 Cara 2: Download dari Server lalu Upload

### Di Server:
```bash
# Zip project
cd /path/to/project
tar -czf dasbor-iot-umum.tar.gz .

# Download ke local
scp user@server:/path/to/dasbor-iot-umum.tar.gz .
```

### Di Local:
```bash
# Extract
tar -xzf dasbor-iot-umum.tar.gz
cd dasbor-iot-umum

# Push ke GitHub
git add .
git commit -m "update from server"
git push origin master
```

## 🌐 Cara 3: Setup Auto-Deploy dengan Webhook

### 1. Buat Webhook Server
Simpan file `webhook-server.js` di server:

```javascript
const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

const GITHUB_SECRET = 'your-webhook-secret';

app.use(express.json());

function verifySignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    const hash = crypto.createHmac('sha256', GITHUB_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    if (`sha256=${hash}` !== signature) {
        return res.status(401).send('Unauthorized');
    }
    next();
}

app.post('/webhook', verifySignature, (req, res) => {
    const event = req.headers['x-github-event'];
    
    if (event === 'push') {
        console.log('📥 New push detected, starting deployment...');
        
        exec('/path/to/your/deploy.sh', (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Deployment failed: ${error}`);
                return res.status(500).send('Deployment failed');
            }
            
            console.log(`✅ Deployment successful: ${stdout}`);
            res.status(200).send('Deployment successful');
        });
    } else {
        res.status(200).send('Event ignored');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on port ${PORT}`);
});
```

### 2. Buat Deploy Script
Simpan file `deploy.sh` di server:

```bash
#!/bin/bash

echo "🚀 Starting deployment process..."

cd /path/to/your/dasbor-iot-umum

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin master

# Install dependencies if needed
if git diff --name-only HEAD~1 HEAD | grep "package.json"; then
    echo "📦 Installing new dependencies..."
    npm install
fi

# Update database if schema changed
if git diff --name-only HEAD~1 HEAD | grep "prisma/schema.prisma"; then
    echo "🗄️ Updating database schema..."
    npm run db:push
fi

# Build application
echo "🔨 Building application..."
npm run build

# Restart application
echo "🔄 Restarting application..."
pm2 restart dasbor-iot

echo "✅ Deployment completed successfully!"
```

### 3. Setup Webhook di GitHub

1. Buka repository GitHub Anda
2. Settings → Webhooks → Add webhook
3. Payload URL: `http://your-server-ip:3001/webhook`
4. Content type: `application/json`
5. Secret: Buat secret token yang aman
6. Events: Pilih "Just the push event"
7. Add webhook

### 4. Install Dependencies di Server
```bash
npm install express crypto
```

### 5. Jalankan Webhook Server
```bash
node webhook-server.js

# Atau dengan PM2 untuk production
pm2 start webhook-server.js --name webhook-server
```

## 🔧 Cara 4: Menggunakan GitHub CLI

### Install GitHub CLI
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh

# Login ke GitHub
gh auth login
```

### Update dari Server
```bash
cd /path/to/project
git add .
git commit -m "update from server"
git push origin master
```

## 📋 Cara 5: Manual Sync

### Jika Server dan Local Berbeda:

1. **Di Server:**
```bash
git add .
git commit -m "server update"
git push origin master
```

2. **Di Local:**
```bash
git pull origin master
# Lakukan perubahan jika perlu
git add .
git commit -m "local update"
git push origin master
```

3. **Di Server lagi:**
```bash
git pull origin master
```

## 🛠️ Troubleshooting

### Git Push Failed:
```bash
# Force push jika conflict
git push origin master --force-with-lease
```

### Permission Denied:
```bash
# Check git remote
git remote -v

# Update remote dengan token
git remote set-url origin https://<YOUR_TOKEN>@github.com/diskonnekted/dasbor-iot-umum.git
```

### Merge Conflicts:
```bash
# Stash local changes
git stash

# Pull latest
git pull origin master

# Apply stashed changes
git stash pop

# Resolve conflicts manually
git add .
git commit -m "resolve merge conflicts"
git push origin master
```

## 🎯 Rekomendasi

**Untuk production setup:**
1. Gunakan **Cara 1** untuk update manual
2. Setup **Cara 3** untuk auto-deploy
3. Gunakan **PM2** untuk process management
4. Setup **backup** sebelum deployment

**Untuk development:**
1. Gunakan **Cara 4** dengan GitHub CLI
2. Setup **branching strategy** (dev/staging/master)
3. Gunakan **pull requests** untuk review

## 📝 Quick Start Commands

### Update dari Server (Cara Paling Mudah):
```bash
# Di server
cd /path/to/dasbor-iot-umum
git add .
git commit -m "update from server"
git push origin master
```

### Setup Auto-Deploy:
```bash
# Install dependencies
npm install express crypto

# Start webhook server
pm2 start webhook-server.js --name webhook

# Setup webhook di GitHub repo settings
```

Pilih cara yang paling sesuai dengan kebutuhan dan infrastruktur Anda!