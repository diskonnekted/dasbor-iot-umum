import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const firmwareId = params.id
    
    // Get firmware info from database
    const firmware = await db.firmware.findUnique({
      where: { id: firmwareId }
    })

    if (!firmware) {
      return NextResponse.json(
        { error: 'Firmware not found' },
        { status: 404 }
      )
    }

    // Read firmware file
    const firmwarePath = join(process.cwd(), 'firmware', firmware.filename)
    const firmwareBuffer = await readFile(firmwarePath)

    // Return firmware file as binary
    return new NextResponse(firmwareBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${firmware.filename}"`,
        'Content-Length': firmwareBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Download firmware error:', error)
    return NextResponse.json(
      { error: 'Failed to download firmware' },
      { status: 500 }
    )
  }
}