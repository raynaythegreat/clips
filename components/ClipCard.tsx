'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  PencilIcon, 
  TrashIcon,
  DownloadIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import EditClipModal from './EditClipModal'

interface Video {
  id: string
  title: string
  url: string
  thumbnail?: string
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

interface ClipCardProps {
  clip: Clip
  onClipUpdated: () => void
}

export default function ClipCard({ clip, onClipUpdated }: ClipCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusIcon = () => {
    switch (clip.status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'PROCESSING':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
      case 'FAILED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (clip.status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this clip?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete clip')
      }

      toast.success('Clip deleted successfully')
      onClipUpdated()
    } catch (error) {
      toast.error('Failed to delete clip')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = () => {
    // TODO: Implement download functionality
    toast.success('Download feature coming soon!')
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        className="card overflow-hidden"
      >
        {/* Video thumbnail with clip overlay */}
        <div className="relative aspect-video bg-gray-200">
          {clip.video.thumbnail ? (
            <img
              src={clip.video.thumbnail}
              alt={clip.video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Clip time range overlay */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
          </div>

          {/* Status badge */}
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-1 capitalize">{clip.status.toLowerCase()}</span>
            </span>
          </div>

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={() => window.open(clip.video.url, '_blank')}
              className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2"
            >
              <PlayIcon className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {clip.title}
          </h3>
          
          {clip.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {clip.description}
            </p>
          )}

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <ClockIcon className="w-4 h-4 mr-1" />
            {format(new Date(clip.createdAt), 'MMM d, yyyy')}
          </div>

          {/* Duration */}
          <div className="text-sm text-gray-600 mb-4">
            Duration: {formatTime(clip.duration)}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {clip.status === 'COMPLETED' && (
              <button
                onClick={handleDownload}
                className="flex-1 btn-primary text-sm py-2"
              >
                <DownloadIcon className="w-4 h-4 mr-1" />
                Download
              </button>
            )}
            
            <button
              onClick={handleEdit}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <PencilIcon className="w-4 h-4" />
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

      {/* Edit Clip Modal */}
      {isEditModalOpen && (
        <EditClipModal
          clip={clip}
          onClose={() => setIsEditModalOpen(false)}
          onClipUpdated={onClipUpdated}
        />
      )}
    </>
  )
}
