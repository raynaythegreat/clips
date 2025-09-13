import puppeteer, { Browser, Page } from 'puppeteer'
import { Platform } from '@prisma/client'

export interface UploadResult {
  success: boolean
  platformUrl?: string
  errorMessage?: string
}

export interface SocialMediaCredentials {
  username: string
  password: string
  platform: Platform
}

export class SocialMediaAutomation {
  private browser: Browser | null = null
  private page: Page | null = null

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    this.page = await this.browser.newPage()
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Set viewport
    await this.page.setViewport({ width: 1366, height: 768 })
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }

  async uploadToTikTok(
    videoPath: string,
    title: string,
    description: string,
    credentials: SocialMediaCredentials
  ): Promise<UploadResult> {
    try {
      if (!this.page) throw new Error('Browser not initialized')

      // Navigate to TikTok upload page
      await this.page.goto('https://www.tiktok.com/upload', { waitUntil: 'networkidle2' })

      // Login if needed
      await this.loginToTikTok(credentials)

      // Wait for upload button and upload video
      await this.page.waitForSelector('input[type="file"]', { timeout: 10000 })
      const fileInput = await this.page.$('input[type="file"]')
      
      if (!fileInput) {
        throw new Error('File input not found')
      }

      await fileInput.uploadFile(videoPath)

      // Wait for upload to complete
      await this.page.waitForSelector('[data-e2e="video-upload"]', { timeout: 60000 })

      // Fill in title and description
      await this.page.waitForSelector('[data-e2e="video-title"]', { timeout: 10000 })
      await this.page.type('[data-e2e="video-title"]', title)

      if (description) {
        await this.page.waitForSelector('[data-e2e="video-desc"]', { timeout: 5000 })
        await this.page.type('[data-e2e="video-desc"]', description)
      }

      // Publish the video
      await this.page.waitForSelector('[data-e2e="publish-button"]', { timeout: 10000 })
      await this.page.click('[data-e2e="publish-button"]')

      // Wait for success and get URL
      await this.page.waitForSelector('[data-e2e="video-published"]', { timeout: 30000 })
      
      // Try to get the video URL
      const videoUrl = await this.page.evaluate(() => {
        const urlElement = document.querySelector('[data-e2e="video-published"] a')
        return urlElement ? urlElement.getAttribute('href') : null
      })

      return {
        success: true,
        platformUrl: videoUrl || 'https://www.tiktok.com'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async uploadToInstagram(
    videoPath: string,
    title: string,
    description: string,
    credentials: SocialMediaCredentials
  ): Promise<UploadResult> {
    try {
      if (!this.page) throw new Error('Browser not initialized')

      // Navigate to Instagram
      await this.page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' })

      // Login if needed
      await this.loginToInstagram(credentials)

      // Navigate to create post
      await this.page.goto('https://www.instagram.com/create', { waitUntil: 'networkidle2' })

      // Upload video
      await this.page.waitForSelector('input[type="file"]', { timeout: 10000 })
      const fileInput = await this.page.$('input[type="file"]')
      
      if (!fileInput) {
        throw new Error('File input not found')
      }

      await fileInput.uploadFile(videoPath)

      // Wait for upload and processing
      await this.page.waitForSelector('[data-testid="create-post-next-button"]', { timeout: 60000 })

      // Add caption
      await this.page.waitForSelector('[data-testid="create-post-caption"]', { timeout: 10000 })
      await this.page.type('[data-testid="create-post-caption"]', `${title}\n\n${description}`)

      // Share the post
      await this.page.waitForSelector('[data-testid="create-post-share-button"]', { timeout: 10000 })
      await this.page.click('[data-testid="create-post-share-button"]')

      // Wait for success
      await this.page.waitForSelector('[data-testid="create-post-success"]', { timeout: 30000 })

      return {
        success: true,
        platformUrl: 'https://www.instagram.com'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async uploadToYouTubeShorts(
    videoPath: string,
    title: string,
    description: string,
    credentials: SocialMediaCredentials
  ): Promise<UploadResult> {
    try {
      if (!this.page) throw new Error('Browser not initialized')

      // Navigate to YouTube Studio
      await this.page.goto('https://studio.youtube.com', { waitUntil: 'networkidle2' })

      // Login if needed
      await this.loginToYouTube(credentials)

      // Navigate to upload
      await this.page.goto('https://studio.youtube.com/channel/me', { waitUntil: 'networkidle2' })
      await this.page.click('[aria-label="Create"]')
      await this.page.click('[aria-label="Upload videos"]')

      // Upload video
      await this.page.waitForSelector('input[type="file"]', { timeout: 10000 })
      const fileInput = await this.page.$('input[type="file"]')
      
      if (!fileInput) {
        throw new Error('File input not found')
      }

      await fileInput.uploadFile(videoPath)

      // Fill in details
      await this.page.waitForSelector('#textbox', { timeout: 60000 })
      await this.page.type('#textbox', title)

      // Add description
      await this.page.waitForSelector('#description-textbox', { timeout: 10000 })
      await this.page.type('#description-textbox', description)

      // Set as Short
      await this.page.waitForSelector('[aria-label="Shorts"]', { timeout: 10000 })
      await this.page.click('[aria-label="Shorts"]')

      // Publish
      await this.page.waitForSelector('[aria-label="Publish"]', { timeout: 10000 })
      await this.page.click('[aria-label="Publish"]')

      // Wait for success
      await this.page.waitForSelector('[aria-label="Video published"]', { timeout: 30000 })

      return {
        success: true,
        platformUrl: 'https://www.youtube.com/shorts'
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async loginToTikTok(credentials: SocialMediaCredentials): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    // Check if already logged in
    const isLoggedIn = await this.page.evaluate(() => {
      return document.querySelector('[data-e2e="user-avatar"]') !== null
    })

    if (isLoggedIn) return

    // Navigate to login
    await this.page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle2' })

    // Fill login form
    await this.page.waitForSelector('input[name="username"]', { timeout: 10000 })
    await this.page.type('input[name="username"]', credentials.username)
    await this.page.type('input[name="password"]', credentials.password)

    // Submit login
    await this.page.click('button[type="submit"]')

    // Wait for redirect
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
  }

  private async loginToInstagram(credentials: SocialMediaCredentials): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    // Check if already logged in
    const isLoggedIn = await this.page.evaluate(() => {
      return document.querySelector('[data-testid="user-avatar"]') !== null
    })

    if (isLoggedIn) return

    // Fill login form
    await this.page.waitForSelector('input[name="username"]', { timeout: 10000 })
    await this.page.type('input[name="username"]', credentials.username)
    await this.page.type('input[name="password"]', credentials.password)

    // Submit login
    await this.page.click('button[type="submit"]')

    // Wait for redirect
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
  }

  private async loginToYouTube(credentials: SocialMediaCredentials): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    // Check if already logged in
    const isLoggedIn = await this.page.evaluate(() => {
      return document.querySelector('[data-testid="user-avatar"]') !== null
    })

    if (isLoggedIn) return

    // Click sign in
    await this.page.click('[aria-label="Sign in"]')

    // Fill login form
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 })
    await this.page.type('input[type="email"]', credentials.username)
    await this.page.click('#identifierNext')

    await this.page.waitForSelector('input[type="password"]', { timeout: 10000 })
    await this.page.type('input[type="password"]', credentials.password)
    await this.page.click('#passwordNext')

    // Wait for redirect
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' })
  }
}
