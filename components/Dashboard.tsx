'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  VideoCameraIcon, 
  ScissorsIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import AddVideoModal from './AddVideoModal'
import VideoCard from './VideoCard'
import ClipCard from './ClipCard'
import SocialAccountsManager from './SocialAccountsManager'

interface Video {
  id: string
  title: string
  url: string
  thumbnail?: string
  duration?: number
  description?: string
  createdAt: string
  clips: Clip[]
}

interface Clip {
  id: string
  title: string
  description?: string
  startTime: number
  endTime: number
  duration: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  video: Video
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [clips, setClips] = useState<Clip[]>([])
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'videos' | 'clips' | 'accounts'>('videos')

  useEffect(() => {
    fetchVideos()
    fetchClips()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const fetchClips = async () => {
    try {
      const response = await fetch('/api/clips')
      if (response.ok) {
        const data = await response.json()
        setClips(data.clips)
      }
    } catch (error) {
      console.error('Error fetching clips:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVideo = () => {
    setIsAddVideoModalOpen(true)
  }

  const handleVideoAdded = () => {
    fetchVideos()
    setIsAddVideoModalOpen(false)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">ViralClips</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session?.user?.name}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-black"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}!
          </h2>
          <p className="text-gray-600">
            Create viral clips from your videos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{videos.length}</p>
            <p className="text-sm text-gray-600">Videos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{clips.length}</p>
            <p className="text-sm text-gray-600">Clips</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {clips.filter(clip => clip.status === 'COMPLETED').length}
            </p>
            <p className="text-sm text-gray-600">Ready</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-2 border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Videos ({videos.length})
              </button>
              <button
                onClick={() => setActiveTab('clips')}
                className={`py-2 border-b-2 font-medium text-sm ${
                  activeTab === 'clips'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Clips ({clips.length})
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`py-2 border-b-2 font-medium text-sm ${
                  activeTab === 'accounts'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Social Accounts
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'videos' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Your Videos</h3>
              <button
                onClick={handleAddVideo}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add Video</span>
              </button>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
                <p className="text-gray-600 mb-4">Add your first video to start creating viral clips.</p>
                <button
                  onClick={handleAddVideo}
                  className="btn-primary"
                >
                  Add Your First Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} onVideoUpdated={fetchVideos} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Your Clips</h3>
            
            {clips.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clips yet</h3>
                <p className="text-gray-600 mb-4">Create clips from your videos to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clips.map((clip) => (
                  <ClipCard key={clip.id} clip={clip} onClipUpdated={fetchClips} />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'accounts' ? (
          <SocialAccountsManager onAccountAdded={fetchVideos} />
        ) : null}
      </div>

      {/* Add Video Modal */}
      {isAddVideoModalOpen && (
        <AddVideoModal
          onClose={() => setIsAddVideoModalOpen(false)}
          onVideoAdded={handleVideoAdded}
        />
      )}
    </div>
  )
}
