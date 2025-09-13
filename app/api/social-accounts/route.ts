import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAccountSchema = z.object({
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE_SHORTS']),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
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
    const { platform, username, password } = createAccountSchema.parse(body)

    // Check if account already exists for this platform
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: session.user.id,
        platform: platform as any,
      }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account already exists for this platform' },
        { status: 400 }
      )
    }

    // Create social account
    const socialAccount = await prisma.socialAccount.create({
      data: {
        platform: platform as any,
        username,
        userId: session.user.id,
        isConnected: true, // Will be verified during first upload
      }
    })

    return NextResponse.json(
      { message: 'Social account added successfully', account: socialAccount },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Social account creation error:', error)
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

    const accounts = await prisma.socialAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Social accounts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
