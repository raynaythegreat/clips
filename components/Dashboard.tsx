'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">ViralClips</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}!
          </h2>
          <p className="text-gray-600">
            Create viral clips from your videos and grow your social media presence.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <VideoCameraIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <ScissorsIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clips</p>
                <p className="text-2xl font-bold text-gray-900">{clips.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <PlayIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clips.filter(clip => clip.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'videos'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Videos ({videos.length})
              </button>
              <button
                onClick={() => setActiveTab('clips')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clips'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Clips ({clips.length})
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'accounts'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <VideoCard video={video} onVideoUpdated={fetchVideos} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Your Clips</h3>
            
            {clips.length === 0 ? (
              <div className="text-center py-12">
                <ScissorsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clips yet</h3>
                <p className="text-gray-600 mb-4">Create clips from your videos to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clips.map((clip, index) => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ClipCard clip={clip} onClipUpdated={fetchClips} />
                  </motion.div>
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
