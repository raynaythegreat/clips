'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const clipSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.number().min(0, 'Start time must be 0 or greater'),
  endTime: z.number().min(1, 'End time must be greater than start time'),
})

type ClipForm = z.infer<typeof clipSchema>

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

interface EditClipModalProps {
  clip: Clip
  onClose: () => void
  onClipUpdated: () => void
}

export default function EditClipModal({ clip, onClose, onClipUpdated }: EditClipModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ClipForm>({
    resolver: zodResolver(clipSchema),
    defaultValues: {
      title: clip.title,
      description: clip.description || '',
      startTime: clip.startTime,
      endTime: clip.endTime,
    }
  })

  const startTime = watch('startTime')
  const endTime = watch('endTime')

  const onSubmit = async (data: ClipForm) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/clips/${clip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update clip')
      }

      toast.success('Clip updated successfully!')
      onClipUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update clip')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit Clip</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Clip Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="input-field"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time (seconds)
              </label>
              <input
                {...register('startTime', { valueAsNumber: true })}
                type="number"
                min="0"
                className="input-field"
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time (seconds)
              </label>
              <input
                {...register('endTime', { valueAsNumber: true })}
                type="number"
                min="1"
                className="input-field"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Duration Preview */}
          {startTime && endTime && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Duration:</strong> {endTime - startTime} seconds
              </p>
            </div>
          )}

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
              {isLoading ? 'Updating...' : 'Update Clip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
