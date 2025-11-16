# ESP32 Monitor Dashboard

A comprehensive real-time monitoring system for ESP32 devices with web-based dashboard, database persistence, and WebSocket support.

## Features

- Real-time ESP32 monitoring and data visualization
- WebSocket support for instant updates
- Database persistence with Prisma ORM
- RESTful API endpoints for data management
- Responsive web interface
- GPIO pin status monitoring
- WiFi connection status tracking
- Device specifications display
- Automatic reconnection handling

## Architecture

### Frontend
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui component library
- Real-time updates via WebSocket

### Backend
- Node.js API routes
- Prisma ORM with SQLite database
- WebSocket integration with Socket.io
- RESTful API design
- Comprehensive error handling

### Database Schema
- ESP32 Device management
- Historical data storage
- GPIO pin state tracking
- Device metadata storage

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- ESP32 development board
- Arduino IDE

### Installation

1. Clone the repository
```bash
git clone https://github.com/diskonnekted/dasbor-iot-umum.git
cd dasbor-iot-umum
```

2. Install dependencies
```bash
npm install
```

3. Setup database
```bash
npx prisma generate
npx prisma db push
```

4. Configure environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the application
```bash
npm run dev
```

6. Open your browser
```
http://localhost:3000
```

## ESP32 Setup

### Hardware Requirements
- ESP32 development board
- WiFi access point connection
- USB cable for programming

### Software Setup

1. Install Arduino IDE
2. Add ESP32 board support
3. Install required libraries:
   - WiFi
   - HTTPClient
   - ArduinoJson

### Upload the Script

1. Open `esp32_monitor_dashboard/esp32_monitor_dashboard.ino`
2. Configure WiFi settings:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-domain.com/api/esp32/data";
```

3. Upload to ESP32
4. Monitor Serial Output (115200 baud rate)

## API Documentation

### Endpoints

#### POST /api/esp32/data
Receives data from ESP32 devices.

**Request Body:**
```json
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
      "mode": "OUTPUT",
      "value": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data received successfully",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### GET /api/esp32/status
Retrieves the latest ESP32 device status.

**Response:**
```json
{
  "id": "ESP32-001",
  "connected": true,
  "lastSeen": "2024-01-01T12:00:00.000Z",
  "ip": "192.168.1.100",
  "mac": "24:6F:28:AB:CD:EF",
  "chipId": "ESP32-001",
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
      "mode": "OUTPUT",
      "value": 1
    }
  ]
}
```

## Database Schema

### ESP32Device
Stores device information and metadata.

- `id`: Primary key
- `chipId`: Unique device identifier
- `macAddress`: MAC address
- `name`: Device name
- `isActive`: Device status
- `lastSeen`: Last connection timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### ESP32Data
Stores historical device data.

- `id`: Primary key
- `deviceId`: Foreign key to ESP32Device
- `ip`: IP address
- `flashSize`: Flash memory size
- `freeHeap`: Available heap memory
- `cpuFreq`: CPU frequency
- `sdkVersion`: SDK version
- `coreVersion`: Core version
- `wifiRssi`: WiFi signal strength
- `uptime`: Device uptime
- `timestamp`: Data timestamp

### ESP32Pin
Stores GPIO pin information.

- `id`: Primary key
- `deviceId`: Foreign key to ESP32Device
- `pinNumber`: GPIO pin number
- `mode`: Pin mode (INPUT/OUTPUT)
- `value`: Pin value
- `available`: Pin availability
- `timestamp`: Last update timestamp

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=file:./db/custom.db

# Application
NODE_ENV=production
PORT=3000

# WebSocket (optional)
WEBSOCKET_PORT=3001
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Deployment

### Production Deployment

1. Build the application
```bash
npm run build
```

2. Setup process manager
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

3. Configure reverse proxy
- Setup Nginx or Apache
- Configure SSL certificates
- Set up domain and DNS

4. Monitor the application
```bash
pm2 status
pm2 logs
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./db/custom.db
    volumes:
      - ./db:/app/db
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

#### WebSocket Connection Issues
```bash
# Check WebSocket server status
pm2 logs websocket-server

# Verify port availability
netstat -tlnp | grep :3001
```

#### ESP32 Connection Problems
- Verify WiFi credentials
- Check server accessibility
- Monitor serial output
- Validate JSON payload format

#### Performance Issues
```bash
# Monitor memory usage
pm2 monit

# Check application logs
pm2 logs app

# Optimize database queries
npx prisma studio
```

### Debug Mode

Enable debug logging:
```bash
export DEBUG=*
npm run dev
```

## Development

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── esp32/
│   │       ├── data/
│   │       └── status/
│   └── page.tsx
├── lib/
│   ├── db.ts
│   └── socket.ts
└── components/
    └── ui/
```

### Adding New Features

1. Create API endpoint in `src/app/api/`
2. Update database schema in `prisma/schema.prisma`
3. Add UI components in `src/components/`
4. Update dashboard in `src/app/page.tsx`

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Update documentation

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## Changelog

### v1.0.0
- Initial release
- Real-time ESP32 monitoring
- Database persistence
- WebSocket support
- Responsive dashboard
- API endpoints
- ESP32 Arduino script

## Acknowledgments

- Next.js framework
- Prisma ORM
- shadcn/ui components
- Arduino ESP32 core
- Socket.io for real-time communication