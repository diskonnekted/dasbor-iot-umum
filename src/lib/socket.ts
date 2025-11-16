import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export const config = {
  api: {
    bodyParser: false
  }
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    // Handle WebSocket connections
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join ESP32 monitoring room
      socket.join('esp32-monitor')

      // Handle client disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })

      // Handle ESP32 data updates
      socket.on('esp32-data', (data) => {
        console.log('ESP32 data received:', data)
        // Broadcast to all clients in the monitoring room
        socket.to('esp32-monitor').emit('esp32-update', data)
      })
    })

    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler