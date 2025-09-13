'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">ViralClips</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-600 hover:text-black">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Turn Any Video Into Viral Clips
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Paste any YouTube URL (channel or video) and our AI will create viral clips 
            optimized for TikTok, Instagram, and YouTube Shorts.
          </p>

          <div className="max-w-md mx-auto mb-8">
            <div className="flex">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-l focus:outline-none focus:border-black"
              />
              <button className="btn-primary rounded-l-none">
                Create Clips
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Works with YouTube videos and channels
            </p>
          </div>

          <Link href="/auth/signup" className="text-gray-600 hover:text-black">
            Or sign up to save your clips
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              1. Add Video URL
            </h3>
            <p className="text-gray-600">
              Paste any YouTube video URL and our AI will analyze it for viral potential.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              2. AI Analysis
            </h3>
            <p className="text-gray-600">
              Our AI identifies the most engaging moments and creates optimized clips.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              3. Export & Share
            </h3>
            <p className="text-gray-600">
              Download clips or automatically post to TikTok, Instagram, and YouTube.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © 2024 ViralClips. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
