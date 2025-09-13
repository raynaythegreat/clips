import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'

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

    const videoId = params.id

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

    // Delete video (clips will be deleted automatically due to cascade)
    await prisma.video.delete({
      where: { id: videoId }
    })

    return NextResponse.json(
      { message: 'Video deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Video deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
