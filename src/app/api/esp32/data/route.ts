import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// WebSocket IO instance (will be initialized when socket server starts)
let io: any = null

// Function to set IO instance (called from socket server)
export const setIOInstance = (ioInstance: any) => {
  io = ioInstance
}

// Generate default pin configuration for ESP32
const generateDefaultPins = (deviceId: string) => {
  const pins = []
  for (let i = 0; i <= 39; i++) {
    // Skip some pins that are not typically available on ESP32
    if ([6, 7, 8, 9, 10, 11].includes(i)) {
      continue
    }
    
    pins.push({
      deviceId,
      pinNumber: i,
      available: ![1, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].includes(i),
      mode: 'INPUT',
      value: 0
    })
  }
  return pins
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['chipId', 'mac', 'ip']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        )
      }
    }

    // Find or create ESP32 device
    let device = await db.eSP32Device.findUnique({
      where: { chipId: body.chipId }
    })

    if (!device) {
      // Create new device
      device = await db.eSP32Device.create({
        data: {
          chipId: body.chipId,
          macAddress: body.mac,
          name: body.name || `ESP32-${body.chipId}`,
          lastSeen: new Date(),
        }
      })

      // Initialize pins for new device
      const pins = generateDefaultPins(device.id)
      await db.eSP32Pin.createMany({
        data: pins
      })
    } else {
      // Update existing device
      device = await db.eSP32Device.update({
        where: { id: device.id },
        data: {
          macAddress: body.mac,
          lastSeen: new Date(),
          isActive: true
        }
      })
    }

    // Create data record
    const dataRecord = await db.eSP32Data.create({
      data: {
        deviceId: device.id,
        ip: body.ip,
        flashSize: body.flashSize || 0,
        freeHeap: body.freeHeap || 0,
        cpuFreq: body.cpuFreq || 0,
        sdkVersion: body.sdkVersion || '',
        coreVersion: body.coreVersion || '',
        wifiRssi: body.wifiRssi || 0,
        uptime: body.uptime || 0,
      }
    })

    // Update pin states if provided
    if (body.pins && Array.isArray(body.pins)) {
      for (const pin of body.pins) {
        await db.eSP32Pin.upsert({
          where: {
            deviceId_pinNumber: {
              deviceId: device.id,
              pinNumber: pin.number
            }
          },
          update: {
            mode: pin.mode || 'INPUT',
            value: pin.value || 0,
            available: pin.available !== undefined ? pin.available : true,
            timestamp: new Date()
          },
          create: {
            deviceId: device.id,
            pinNumber: pin.number,
            mode: pin.mode || 'INPUT',
            value: pin.value || 0,
            available: pin.available !== undefined ? pin.available : true,
          }
        })
      }
    }

    // Get updated device data with pins
    const updatedDevice = await db.eSP32Device.findUnique({
      where: { id: device.id },
      include: {
        pinStates: true,
        dataRecords: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    })

    // Format response data
    const responseData = {
      id: updatedDevice?.chipId || body.chipId,
      connected: true,
      lastSeen: updatedDevice?.lastSeen?.toISOString() || new Date().toISOString(),
      ip: body.ip,
      mac: body.mac,
      chipId: body.chipId,
      flashSize: body.flashSize || 0,
      freeHeap: body.freeHeap || 0,
      cpuFreq: body.cpuFreq || 0,
      sdkVersion: body.sdkVersion || '',
      coreVersion: body.coreVersion || '',
      wifiRssi: body.wifiRssi || 0,
      uptime: body.uptime || 0,
      pins: updatedDevice?.pinStates.map(pin => ({
        number: pin.pinNumber,
        available: pin.available,
        mode: pin.mode,
        value: pin.value
      })) || []
    }

    console.log('ESP32 Data Received:', {
      timestamp: new Date().toISOString(),
      chipId: body.chipId,
      ip: body.ip,
      connected: true
    })

    // Emit WebSocket event to all connected clients
    if (io) {
      io.to('esp32-monitor').emit('esp32-update', responseData)
      console.log('WebSocket event emitted for ESP32 update')
    }

    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing ESP32 data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get the most recently active device
    const device = await db.eSP32Device.findFirst({
      where: { isActive: true },
      orderBy: { lastSeen: 'desc' },
      include: {
        pinStates: true,
        dataRecords: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    })

    if (!device) {
      return NextResponse.json({
        id: 'esp32-default',
        connected: false,
        lastSeen: new Date().toISOString(),
        ip: '',
        mac: '',
        chipId: '',
        flashSize: 0,
        freeHeap: 0,
        cpuFreq: 0,
        sdkVersion: '',
        coreVersion: '',
        wifiRssi: 0,
        uptime: 0,
        pins: []
      })
    }

    // Check if device is still connected (last seen within 30 seconds)
    const lastSeenTime = device.lastSeen.getTime()
    const currentTime = new Date().getTime()
    const timeDiff = currentTime - lastSeenTime
    
    const connected = timeDiff <= 30000 // 30 seconds timeout

    // Get latest data record
    const latestData = device.dataRecords[0]

    const responseData = {
      id: device.chipId,
      connected,
      lastSeen: device.lastSeen.toISOString(),
      ip: latestData?.ip || '',
      mac: device.macAddress,
      chipId: device.chipId,
      flashSize: latestData?.flashSize || 0,
      freeHeap: latestData?.freeHeap || 0,
      cpuFreq: latestData?.cpuFreq || 0,
      sdkVersion: latestData?.sdkVersion || '',
      coreVersion: latestData?.coreVersion || '',
      wifiRssi: latestData?.wifiRssi || 0,
      uptime: latestData?.uptime || 0,
      pins: device.pinStates.map(pin => ({
        number: pin.pinNumber,
        available: pin.available,
        mode: pin.mode,
        value: pin.value
      }))
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching ESP32 data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}