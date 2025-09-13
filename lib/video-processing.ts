import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

export interface VideoInfo {
  title: string
  description: string
  duration: number
  thumbnail: string
  url: string
}

export interface ClipOptions {
  startTime: number
  endTime: number
  title: string
  description?: string
}

export class VideoProcessor {
  private tempDir: string

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp')
    this.ensureTempDir()
  }

  private async ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      await mkdir(this.tempDir, { recursive: true })
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const videoInfo = await ytdl.getInfo(url)
      const videoDetails = videoInfo.videoDetails

      return {
        title: videoDetails.title,
        description: videoDetails.description,
        duration: parseInt(videoDetails.lengthSeconds),
        thumbnail: videoDetails.thumbnails[0]?.url || '',
        url: url
      }
    } catch (error) {
      throw new Error(`Failed to get video info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async downloadVideo(url: string, videoId: string): Promise<string> {
    try {
      const outputPath = path.join(this.tempDir, `${videoId}.mp4`)
      
      return new Promise((resolve, reject) => {
        const stream = ytdl(url, {
          quality: 'highest',
          filter: 'audioandvideo'
        })

        stream.pipe(fs.createWriteStream(outputPath))
        
        stream.on('end', () => {
          resolve(outputPath)
        })
        
        stream.on('error', (error) => {
          reject(new Error(`Download failed: ${error.message}`))
        })
      })
    } catch (error) {
      throw new Error(`Failed to download video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createClip(
    videoPath: string,
    clipOptions: ClipOptions,
    clipId: string
  ): Promise<string> {
    try {
      const outputPath = path.join(this.tempDir, `clip_${clipId}.mp4`)
      
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .seekInput(clipOptions.startTime)
          .duration(clipOptions.endTime - clipOptions.startTime)
          .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            '-preset fast',
            '-crf 23',
            '-movflags +faststart'
          ])
          .output(outputPath)
          .on('end', () => {
            resolve(outputPath)
          })
          .on('error', (error) => {
            reject(new Error(`Clip creation failed: ${error.message}`))
          })
          .run()
      })
    } catch (error) {
      throw new Error(`Failed to create clip: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createThumbnail(videoPath: string, clipId: string): Promise<string> {
    try {
      const thumbnailPath = path.join(this.tempDir, `thumb_${clipId}.jpg`)
      
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: ['10%'],
            filename: `thumb_${clipId}.jpg`,
            folder: this.tempDir,
            size: '320x240'
          })
          .on('end', () => {
            resolve(thumbnailPath)
          })
          .on('error', (error) => {
            reject(new Error(`Thumbnail creation failed: ${error.message}`))
          })
      })
    } catch (error) {
      throw new Error(`Failed to create thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async optimizeForPlatform(
    clipPath: string,
    platform: 'tiktok' | 'instagram' | 'youtube',
    clipId: string
  ): Promise<string> {
    try {
      const outputPath = path.join(this.tempDir, `optimized_${platform}_${clipId}.mp4`)
      
      let outputOptions: string[] = []
      
      switch (platform) {
        case 'tiktok':
          outputOptions = [
            '-c:v libx264',
            '-c:a aac',
            '-s 1080x1920', // Vertical format
            '-aspect 9:16',
            '-preset fast',
            '-crf 23',
            '-movflags +faststart'
          ]
          break
        case 'instagram':
          outputOptions = [
            '-c:v libx264',
            '-c:a aac',
            '-s 1080x1080', // Square format
            '-aspect 1:1',
            '-preset fast',
            '-crf 23',
            '-movflags +faststart'
          ]
          break
        case 'youtube':
          outputOptions = [
            '-c:v libx264',
            '-c:a aac',
            '-s 1080x1920', // Vertical format for Shorts
            '-aspect 9:16',
            '-preset fast',
            '-crf 23',
            '-movflags +faststart'
          ]
          break
      }
      
      return new Promise((resolve, reject) => {
        ffmpeg(clipPath)
          .outputOptions(outputOptions)
          .output(outputPath)
          .on('end', () => {
            resolve(outputPath)
          })
          .on('error', (error) => {
            reject(new Error(`Platform optimization failed: ${error.message}`))
          })
          .run()
      })
    } catch (error) {
      throw new Error(`Failed to optimize for platform: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async cleanup(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  async cleanupAll(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tempDir)
      for (const file of files) {
        const filePath = path.join(this.tempDir, file)
        fs.unlinkSync(filePath)
      }
    } catch (error) {
      console.error('Cleanup all failed:', error)
    }
  }
}
