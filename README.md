# Viral Clips Generator

An AI-powered web application that automatically generates viral clips from YouTube videos, optimized for TikTok, Instagram Reels, and YouTube Shorts.

## Features

- 🔐 **User Authentication**: Secure email/password authentication with NextAuth.js
- 🎥 **Video Processing**: Add YouTube videos by URL for clip generation
- 🤖 **AI Analysis**: OpenAI-powered analysis to identify viral moments
- ✂️ **Clip Creation**: Create and edit clips with custom timing
- 📱 **Social Media Ready**: Optimized for TikTok, Instagram, and YouTube Shorts
- 🎨 **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- 📊 **Dashboard**: Track your videos and clips with detailed analytics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4 for viral moment analysis
- **Video Processing**: ytdl-core for YouTube video metadata
- **UI Components**: Headless UI, Heroicons, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/raynaythegreat/clips.git
   cd clips
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   
   # App
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Create an Account
- Sign up with your email and password
- You'll be redirected to the dashboard

### 2. Add Videos
- Click "Add Video" on the dashboard
- Paste a YouTube video URL
- The app will automatically fetch video metadata

### 3. Generate Clips
- Click "Create Clip" on any video
- Use AI analysis to find viral moments automatically
- Or manually set start/end times for custom clips
- Add titles and descriptions optimized for social media

### 4. Review and Export
- View all your clips in the dashboard
- Edit clip details as needed
- Download clips when ready (coming soon)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in user

### Videos
- `GET /api/videos` - Get user's videos
- `POST /api/videos` - Add new video
- `DELETE /api/videos/[id]` - Delete video

### Clips
- `GET /api/clips` - Get user's clips
- `POST /api/clips` - Create new clip
- `PUT /api/clips/[id]` - Update clip
- `DELETE /api/clips/[id]` - Delete clip

## AI Features

The app uses OpenAI's GPT-4 to analyze videos and identify viral moments based on:

- **Hook moments** (first 3 seconds)
- **Emotional peaks**
- **Surprising content**
- **Educational value**
- **Entertainment value**
- **Visual appeal**

## Database Schema

### Users
- Authentication and profile information
- One-to-many relationship with videos

### Videos
- YouTube video metadata
- User ownership
- One-to-many relationship with clips

### Clips
- Clip timing and metadata
- Status tracking (pending, processing, completed, failed)
- User and video relationships

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

### Environment Variables for Production

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
OPENAI_API_KEY="your-openai-api-key"
NODE_ENV="production"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Video download and processing
- [ ] Automatic clip generation with FFmpeg
- [ ] Social media platform integration
- [ ] Advanced AI analysis with video understanding
- [ ] Batch processing
- [ ] Analytics and performance tracking
- [ ] Team collaboration features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using Next.js and OpenAI
