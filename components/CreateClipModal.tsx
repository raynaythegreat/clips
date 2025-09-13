'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { analyzeVideoForViralMoments } from '@/lib/ai-service'

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
  duration?: number
  description?: string
  createdAt: string
  clips: any[]
}

interface CreateClipModalProps {
  video: Video
  onClose: () => void
  onClipCreated: () => void
}

export default function CreateClipModal({ video, onClose, onClipCreated }: CreateClipModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestedClips, setSuggestedClips] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ClipForm>({
    resolver: zodResolver(clipSchema),
  })

  const startTime = watch('startTime')
  const endTime = watch('endTime')

  useEffect(() => {
    if (startTime && endTime && startTime >= endTime) {
      setValue('endTime', startTime + 1)
    }
  }, [startTime, endTime, setValue])

  const handleAnalyzeVideo = async () => {
    if (!video.duration || !video.description) {
      toast.error('Video duration or description not available for analysis')
      return
    }

    setIsAnalyzing(true)
    try {
      const analysis = await analyzeVideoForViralMoments(
        video.title,
        video.description,
        video.duration
      )
      
      setSuggestedClips(analysis.viralMoments)
      setShowSuggestions(true)
      toast.success('AI analysis complete! Check the suggestions below.')
    } catch (error) {
      toast.error('Failed to analyze video. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUseSuggestion = (suggestion: any) => {
    setValue('title', suggestion.title)
    setValue('description', suggestion.description)
    setValue('startTime', suggestion.startTime)
    setValue('endTime', suggestion.endTime)
    setShowSuggestions(false)
  }

  const onSubmit = async (data: ClipForm) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/clips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video.id,
          ...data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create clip')
      }

      toast.success('Clip created successfully!')
      reset()
      onClipCreated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create clip')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Create New Clip</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Video Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{video.title}</h4>
            <p className="text-sm text-gray-600">
              Duration: {video.duration ? formatTime(video.duration) : 'Unknown'}
            </p>
          </div>

          {/* AI Analysis Button */}
          <div className="mb-6">
            <button
              onClick={handleAnalyzeVideo}
              disabled={isAnalyzing}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>{isAnalyzing ? 'Analyzing...' : 'AI Analyze for Viral Moments'}</span>
            </button>
          </div>

          {/* AI Suggestions */}
          {showSuggestions && suggestedClips.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">AI Suggestions</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {suggestedClips.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUseSuggestion(suggestion)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-sm text-gray-900">{suggestion.title}</h5>
                      <span className="text-xs text-gray-500">
                        {formatTime(suggestion.startTime)} - {formatTime(suggestion.endTime)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{suggestion.reason}</p>
                    <p className="text-xs text-gray-500">{suggestion.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Clip Title
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="Enter a catchy title for your clip"
                className="input-field"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Add a description for your clip"
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
                  max={video.duration || 999999}
                  placeholder="0"
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
                  max={video.duration || 999999}
                  placeholder="60"
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
                  {video.duration && endTime > video.duration && (
                    <span className="text-red-600 ml-2">(End time exceeds video duration)</span>
                  )}
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
                {isLoading ? 'Creating...' : 'Create Clip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
