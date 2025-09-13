'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  ScissorsIcon, 
  TrashIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import CreateClipModal from './CreateClipModal'

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
}

interface VideoCardProps {
  video: Video
  onVideoUpdated: () => void
}

export default function VideoCard({ video, onVideoUpdated }: VideoCardProps) {
  const [isCreateClipModalOpen, setIsCreateClipModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video? This will also delete all associated clips.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete video')
      }

      toast.success('Video deleted successfully')
      onVideoUpdated()
    } catch (error) {
      toast.error('Failed to delete video')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateClip = () => {
    setIsCreateClipModalOpen(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="card overflow-hidden"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={() => window.open(video.url, '_blank')}
              className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2"
            >
              <PlayIcon className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {video.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <ClockIcon className="w-4 h-4 mr-1" />
            {format(new Date(video.createdAt), 'MMM d, yyyy')}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <ScissorsIcon className="w-4 h-4 mr-1" />
              {video.clips.length} clips
            </div>
            <div className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              {video.clips.filter(clip => clip.status === 'COMPLETED').length} ready
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleCreateClip}
              className="flex-1 btn-primary text-sm py-2"
            >
              <ScissorsIcon className="w-4 h-4 mr-1" />
              Create Clip
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create Clip Modal */}
      {isCreateClipModalOpen && (
        <CreateClipModal
          video={video}
          onClose={() => setIsCreateClipModalOpen(false)}
          onClipCreated={onVideoUpdated}
        />
      )}
    </>
  )
}
