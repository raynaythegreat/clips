import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { VideoProcessor } from '@/lib/video-processing'
import { z } from 'zod'

const processClipSchema = z.object({
  clipId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { clipId } = processClipSchema.parse(body)

    // Get clip with video info
    const clip = await prisma.clip.findFirst({
      where: {
        id: clipId,
        userId: session.user.id
      },
      include: {
        video: true
      }
    })

    if (!clip) {
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      )
    }

    if (clip.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Clip is already processed or processing' },
        { status: 400 }
      )
    }

    // Update status to processing
    await prisma.clip.update({
      where: { id: clipId },
      data: { status: 'PROCESSING' }
    })

    // Start processing in background
    processClipInBackground(clip).catch(console.error)

    return NextResponse.json(
      { message: 'Clip processing started' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Clip processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processClipInBackground(clip: any) {
  const videoProcessor = new VideoProcessor()
  let videoPath: string | null = null
  let clipPath: string | null = null

  try {
    // Download video
    videoPath = await videoProcessor.downloadVideo(clip.video.url, clip.video.id)
    
    // Create clip
    clipPath = await videoProcessor.createClip(videoPath, {
      startTime: clip.startTime,
      endTime: clip.endTime,
      title: clip.title,
      description: clip.description || ''
    }, clip.id)

    // Create thumbnail
    const thumbnailPath = await videoProcessor.createThumbnail(clipPath, clip.id)

    // Update clip status to completed
    await prisma.clip.update({
      where: { id: clip.id },
      data: { 
        status: 'COMPLETED'
      }
    })

    console.log(`Clip ${clip.id} processed successfully`)

  } catch (error) {
    // Update clip status to failed
    await prisma.clip.update({
      where: { id: clip.id },
      data: { 
        status: 'FAILED'
      }
    })

    console.error(`Clip ${clip.id} processing failed:`, error)
  } finally {
    // Cleanup temporary files
    if (videoPath) {
      await videoProcessor.cleanup(videoPath)
    }
    if (clipPath) {
      await videoProcessor.cleanup(clipPath)
    }
  }
}
