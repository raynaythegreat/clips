import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const clipSchema = z.object({
  videoId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.number().min(0),
  endTime: z.number().min(1),
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
    const { videoId, title, description, startTime, endTime } = clipSchema.parse(body)

    // Verify video belongs to user
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        userId: session.user.id
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Create clip
    const clip = await prisma.clip.create({
      data: {
        title,
        description,
        startTime,
        endTime,
        duration: endTime - startTime,
        videoId,
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json(
      { message: 'Clip created successfully', clip },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Clip creation error:', error)
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

    const clips = await prisma.clip.findMany({
      where: { userId: session.user.id },
      include: {
        video: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ clips })
  } catch (error) {
    console.error('Clips fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
