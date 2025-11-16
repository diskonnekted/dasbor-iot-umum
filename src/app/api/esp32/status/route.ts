import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
      // Return demo data if no device found
      return NextResponse.json({
        id: 'ESP32-DEMO-001',
        connected: false,
        lastSeen: new Date().toISOString(),
        ip: '192.168.1.100',
        mac: '24:6F:28:AB:CD:EF',
        chipId: 'ESP32-DEMO-001',
        flashSize: 4194304, // 4MB
        freeHeap: 234567,
        cpuFreq: 240,
        sdkVersion: 'v4.4.1',
        coreVersion: '2.0.11',
        wifiRssi: -45,
        uptime: 3600,
        pins: generateDefaultPins()
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
    console.error('Error fetching ESP32 status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate default pins for demo
function generateDefaultPins() {
  const pins = []
  for (let i = 0; i <= 39; i++) {
    // Skip some pins that are not typically available on ESP32
    if ([6, 7, 8, 9, 10, 11].includes(i)) {
      continue
    }
    
    pins.push({
      number: i,
      available: ![1, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].includes(i),
      mode: 'INPUT',
      value: 0
    })
  }
  return pins
}