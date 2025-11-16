import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('firmware') as File
    const chipId = formData.get('chipId') as string
    const version = formData.get('version') as string
    
    if (!file || !chipId) {
      return NextResponse.json(
        { error: 'Firmware file and chipId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.bin')) {
      return NextResponse.json(
        { error: 'Only .bin files are allowed' },
        { status: 400 }
      )
    }

    // Create firmware directory if not exists
    const firmwareDir = join(process.cwd(), 'firmware')
    try {
      await mkdir(firmwareDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    // Generate filename with timestamp and version
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${chipId}_${version || timestamp}.bin`
    const filepath = join(firmwareDir, filename)

    // Save firmware file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update firmware info in database
    await db.firmware.create({
      data: {
        deviceId: chipId,
        filename,
        version: version || timestamp,
        filepath,
        size: buffer.length,
        uploadedAt: new Date(),
        isActive: false
      }
    })

    console.log('Firmware uploaded:', {
      chipId,
      filename,
      size: buffer.length,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Firmware uploaded successfully',
      filename,
      size: buffer.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Firmware upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload firmware' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get available firmware versions
    const firmwareList = await db.firmware.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      success: true,
      firmware: firmwareList.map(fw => ({
        id: fw.id,
        deviceId: fw.deviceId,
        filename: fw.version,
        version: fw.version,
        size: fw.size,
        uploadedAt: fw.uploadedAt,
        isActive: fw.isActive
      }))
    })

  } catch (error) {
    console.error('Get firmware list error:', error)
    return NextResponse.json(
      { error: 'Failed to get firmware list' },
      { status: 500 }
    )
  }
}