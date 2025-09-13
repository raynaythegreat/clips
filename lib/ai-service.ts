import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface VideoAnalysis {
  viralMoments: Array<{
    startTime: number
    endTime: number
    reason: string
    title: string
    description: string
  }>
  overallTheme: string
  targetAudience: string
}

export async function analyzeVideoForViralMoments(
  videoTitle: string,
  videoDescription: string,
  videoDuration: number
): Promise<VideoAnalysis> {
  try {
    const prompt = `
    Analyze this video for viral moments that would work well on TikTok, Instagram Reels, and YouTube Shorts.
    
    Video Title: ${videoTitle}
    Video Description: ${videoDescription}
    Video Duration: ${videoDuration} seconds
    
    Please identify 3-5 moments that have the highest viral potential. For each moment, provide:
    1. Start time (in seconds)
    2. End time (in seconds) 
    3. Why this moment is viral-worthy
    4. A catchy title for the clip
    5. A description that would work well on social media
    
    Focus on:
    - Hook moments (first 3 seconds)
    - Emotional peaks
    - Surprising or unexpected content
    - Educational value
    - Entertainment value
    - Visual appeal
    
    Return the response as a JSON object with this structure:
    {
      "viralMoments": [
        {
          "startTime": number,
          "endTime": number,
          "reason": "string",
          "title": "string",
          "description": "string"
        }
      ],
      "overallTheme": "string",
      "targetAudience": "string"
    }
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert social media content strategist who specializes in identifying viral moments in videos. You understand what makes content perform well on TikTok, Instagram Reels, and YouTube Shorts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const analysis = JSON.parse(response) as VideoAnalysis
    
    // Validate and clean the data
    analysis.viralMoments = analysis.viralMoments.map(moment => ({
      ...moment,
      startTime: Math.max(0, moment.startTime),
      endTime: Math.min(videoDuration, moment.endTime),
    }))

    return analysis
  } catch (error) {
    console.error('Error analyzing video:', error)
    throw new Error('Failed to analyze video for viral moments')
  }
}

export async function generateClipTitle(originalTitle: string, clipDescription: string): Promise<string> {
  try {
    const prompt = `
    Generate a catchy, viral-worthy title for a social media clip based on this information:
    
    Original Video Title: ${originalTitle}
    Clip Description: ${clipDescription}
    
    The title should be:
    - 60 characters or less
    - Eye-catching and clickable
    - Optimized for TikTok, Instagram Reels, and YouTube Shorts
    - Include relevant keywords or hashtags if appropriate
    
    Return only the title, no additional text.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a viral social media content creator who writes engaging, clickable titles that perform well across all platforms."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 100,
    })

    return completion.choices[0]?.message?.content?.trim() || originalTitle
  } catch (error) {
    console.error('Error generating clip title:', error)
    return originalTitle
  }
}

export async function generateClipDescription(
  originalDescription: string,
  clipTitle: string,
  platform: 'tiktok' | 'instagram' | 'youtube'
): Promise<string> {
  try {
    const platformSpecific = {
      tiktok: 'TikTok (use trending hashtags, emojis, and engaging language)',
      instagram: 'Instagram Reels (use relevant hashtags, emojis, and call-to-actions)',
      youtube: 'YouTube Shorts (use SEO-friendly descriptions and relevant tags)'
    }

    const prompt = `
    Generate a platform-optimized description for this social media clip:
    
    Clip Title: ${clipTitle}
    Original Description: ${originalDescription}
    Platform: ${platformSpecific[platform]}
    
    The description should be:
    - Engaging and encourage interaction
    - Include relevant hashtags (3-5 for TikTok/Instagram, more for YouTube)
    - Include a call-to-action
    - Match the platform's style and character limits
    - Be authentic and not overly promotional
    
    Return only the description, no additional text.
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a social media expert who creates platform-specific content descriptions that drive engagement and reach.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return completion.choices[0]?.message?.content?.trim() || originalDescription
  } catch (error) {
    console.error('Error generating clip description:', error)
    return originalDescription
  }
}
