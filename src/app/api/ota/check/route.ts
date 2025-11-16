import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chipId, currentVersion } = body
    
    if (!chipId) {
      return NextResponse.json(
        { error: 'ChipId is required' },
        { status: 400 }
      )
    }

    // Check for available updates
    const latestFirmware = await db.firmware.findFirst({
      where: {
        deviceId: chipId,
        isActive: true
      },
      orderBy: { uploadedAt: 'desc' }
    })

    if (!latestFirmware) {
      return NextResponse.json({
        success: true,
        hasUpdate: false,
        message: 'No updates available'
      })
    }

    // Compare versions
    const hasUpdate = currentVersion !== latestFirmware.version

    if (!hasUpdate) {
      return NextResponse.json({
        success: true,
        hasUpdate: false,
        message: 'Device is up to date'
      })
    }

    return NextResponse.json({
      success: true,
      hasUpdate: true,
      update: {
        version: latestFirmware.version,
        size: latestFirmware.size,
        uploadedAt: latestFirmware.uploadedAt,
        filename: latestFirmware.filename
      },
      firmwareUrl: `/api/ota/download/${latestFirmware.id}`
    })

  } catch (error) {
    console.error('Check update error:', error)
    return NextResponse.json(
      { error: 'Failed to check for updates' },
      { status: 500 }
    )
  }
}