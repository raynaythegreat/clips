import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { VideoProcessor } from '@/lib/video-processing'
import path from 'path'
import fs from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clipId = params.id

    // Verify clip belongs to user and is completed
    const clip = await prisma.clip.findFirst({
      where: {
        id: clipId,
        userId: session.user.id,
        status: 'COMPLETED'
      }
    })

    if (!clip) {
      return NextResponse.json(
        { error: 'Clip not found or not ready' },
        { status: 404 }
      )
    }

    // Check if clip file exists
    const clipPath = path.join(process.cwd(), 'temp', `clip_${clipId}.mp4`)
    
    if (!fs.existsSync(clipPath)) {
      return NextResponse.json(
        { error: 'Clip file not found' },
        { status: 404 }
      )
    }

    // Get file stats
    const stats = fs.statSync(clipPath)
    const fileSize = stats.size

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'video/mp4')
    headers.set('Content-Length', fileSize.toString())
    headers.set('Content-Disposition', `attachment; filename="${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4"`)
    headers.set('Cache-Control', 'no-cache')

    // Read and return file
    const fileBuffer = fs.readFileSync(clipPath)
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
