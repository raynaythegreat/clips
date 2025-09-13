import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import ytdl from 'ytdl-core'

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

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    // Get video info
    const videoInfo = await ytdl.getInfo(url)
    const videoDetails = videoInfo.videoDetails

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
        title: title || videoDetails.title,
        url,
        thumbnail: videoDetails.thumbnails[0]?.url,
        duration: parseInt(videoDetails.lengthSeconds),
        description: videoDetails.description,
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
