import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateClipSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.number().min(0, 'Start time must be 0 or greater'),
  endTime: z.number().min(1, 'End time must be greater than start time'),
})

export async function PUT(
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
    const body = await request.json()
    const { title, description, startTime, endTime } = updateClipSchema.parse(body)

    // Verify clip belongs to user
    const clip = await prisma.clip.findFirst({
      where: {
        id: clipId,
        userId: session.user.id
      }
    })

    if (!clip) {
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      )
    }

    // Update clip
    const updatedClip = await prisma.clip.update({
      where: { id: clipId },
      data: {
        title,
        description,
        startTime,
        endTime,
        duration: endTime - startTime,
      }
    })

    return NextResponse.json(
      { message: 'Clip updated successfully', clip: updatedClip },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Clip update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verify clip belongs to user
    const clip = await prisma.clip.findFirst({
      where: {
        id: clipId,
        userId: session.user.id
      }
    })

    if (!clip) {
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      )
    }

    // Delete clip
    await prisma.clip.delete({
      where: { id: clipId }
    })

    return NextResponse.json(
      { message: 'Clip deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Clip deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
