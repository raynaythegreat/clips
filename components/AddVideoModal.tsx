'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const videoSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  title: z.string().optional(),
})

type VideoForm = z.infer<typeof videoSchema>

interface AddVideoModalProps {
  onClose: () => void
  onVideoAdded: () => void
}

export default function AddVideoModal({ onClose, onVideoAdded }: AddVideoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VideoForm>({
    resolver: zodResolver(videoSchema),
  })

  const onSubmit = async (data: VideoForm) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add video')
      }

      toast.success('Video added successfully!')
      reset()
      onVideoAdded()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add video')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add New Video</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL
            </label>
            <input
              {...register('url')}
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Custom Title (Optional)
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="Leave empty to use video's original title"
              className="input-field"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
