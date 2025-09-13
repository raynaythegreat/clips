import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { SocialMediaAutomation } from '@/lib/automation-service'
import { VideoProcessor } from '@/lib/video-processing'
import { z } from 'zod'
import path from 'path'
import fs from 'fs'

const uploadSchema = z.object({
  clipId: z.string(),
  socialAccountId: z.string(),
  scheduledAt: z.string().optional(),
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
    const { clipId, socialAccountId, scheduledAt } = uploadSchema.parse(body)

    // Verify clip and account belong to user
    const [clip, socialAccount] = await Promise.all([
      prisma.clip.findFirst({
        where: { id: clipId, userId: session.user.id },
        include: { video: true }
      }),
      prisma.socialAccount.findFirst({
        where: { id: socialAccountId, userId: session.user.id }
      })
    ])

    if (!clip) {
      return NextResponse.json(
        { error: 'Clip not found' },
        { status: 404 }
      )
    }

    if (!socialAccount) {
      return NextResponse.json(
        { error: 'Social account not found' },
        { status: 404 }
      )
    }

    if (clip.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Clip is not ready for upload' },
        { status: 400 }
      )
    }

    // Create post record
    const post = await prisma.post.create({
      data: {
        title: clip.title,
        description: clip.description || '',
        clipId,
        socialAccountId,
        userId: session.user.id,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'SCHEDULED' : 'PENDING'
      }
    })

    // If not scheduled, start upload immediately
    if (!scheduledAt) {
      // Start upload process in background
      processUpload(post.id, clip, socialAccount).catch(console.error)
    }

    return NextResponse.json(
      { message: 'Upload started successfully', post },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processUpload(
  postId: string,
  clip: any,
  socialAccount: any
): Promise<void> {
  const automation = new SocialMediaAutomation()
  const videoProcessor = new VideoProcessor()
  
  try {
    // Update post status to posting
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'POSTING' }
    })

    await automation.initialize()

    // Check if clip file exists
    const clipPath = path.join(process.cwd(), 'temp', `clip_${clip.id}.mp4`)
    
    if (!fs.existsSync(clipPath)) {
      throw new Error('Clip file not found. Please ensure the clip is processed first.')
    }

    // Optimize video for the specific platform
    const platformMap = {
      'TIKTOK': 'tiktok' as const,
      'INSTAGRAM': 'instagram' as const,
      'YOUTUBE_SHORTS': 'youtube' as const
    }

    const optimizedPath = await videoProcessor.optimizeForPlatform(
      clipPath,
      platformMap[socialAccount.platform],
      `${clip.id}_${socialAccount.platform}`
    )

    // Upload based on platform
    let result
    switch (socialAccount.platform) {
      case 'TIKTOK':
        result = await automation.uploadToTikTok(
          optimizedPath,
          clip.title,
          clip.description || '',
          {
            username: socialAccount.username,
            password: '', // In production, this should be encrypted
            platform: socialAccount.platform
          }
        )
        break
      case 'INSTAGRAM':
        result = await automation.uploadToInstagram(
          optimizedPath,
          clip.title,
          clip.description || '',
          {
            username: socialAccount.username,
            password: '', // In production, this should be encrypted
            platform: socialAccount.platform
          }
        )
        break
      case 'YOUTUBE_SHORTS':
        result = await automation.uploadToYouTubeShorts(
          optimizedPath,
          clip.title,
          clip.description || '',
          {
            username: socialAccount.username,
            password: '', // In production, this should be encrypted
            platform: socialAccount.platform
          }
        )
        break
      default:
        throw new Error('Unsupported platform')
    }

    // Update post with result
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: result.success ? 'POSTED' : 'FAILED',
        platformUrl: result.platformUrl,
        errorMessage: result.errorMessage,
        postedAt: result.success ? new Date() : null
      }
    })

    // Update social account last used
    await prisma.socialAccount.update({
      where: { id: socialAccount.id },
      data: { lastUsed: new Date() }
    })

    // Cleanup optimized file
    await videoProcessor.cleanup(optimizedPath)

  } catch (error) {
    // Update post with error
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  } finally {
    await automation.cleanup()
  }
}
