import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { VideoProcessor } from '@/lib/video-processing'
import { z } from 'zod'

const videoSchema = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().optional(),
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
    const { url, title } = videoSchema.parse(body)

    // Initialize video processor
    const videoProcessor = new VideoProcessor()

    // Get video info
    const videoInfo = await videoProcessor.getVideoInfo(url)

    // Check if video already exists
    const existingVideo = await prisma.video.findUnique({
      where: { url }
    })

    if (existingVideo) {
      return NextResponse.json(
        { error: 'Video already exists' },
        { status: 400 }
      )
    }

    // Create video record
    const video = await prisma.video.create({
      data: {
        title: title || videoInfo.title,
        url,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.duration,
        description: videoInfo.description,
        userId: session.user.id,
      }
    })

    return NextResponse.json(
      { message: 'Video added successfully', video },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Video creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const videos = await prisma.video.findMany({
      where: { userId: session.user.id },
      include: {
        clips: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Videos fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
