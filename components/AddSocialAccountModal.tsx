'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const accountSchema = z.object({
  platform: z.enum(['TIKTOK', 'INSTAGRAM', 'YOUTUBE_SHORTS'], {
    required_error: 'Please select a platform',
  }),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type AccountForm = z.infer<typeof accountSchema>

interface AddSocialAccountModalProps {
  onClose: () => void
  onAccountAdded: () => void
}

export default function AddSocialAccountModal({ onClose, onAccountAdded }: AddSocialAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
  })

  const onSubmit = async (data: AccountForm) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add account')
      }

      toast.success('Social media account added successfully!')
      reset()
      onAccountAdded()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add account')
    } finally {
      setIsLoading(false)
    }
  }

  const platforms = [
    { value: 'TIKTOK', label: 'TikTok', icon: '🎵', description: 'Short-form video content' },
    { value: 'INSTAGRAM', label: 'Instagram', icon: '📷', description: 'Photos and Reels' },
    { value: 'YOUTUBE_SHORTS', label: 'YouTube Shorts', icon: '📺', description: 'Short vertical videos' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Add Social Media Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="space-y-2">
              {platforms.map((platform) => (
                <label key={platform.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    {...register('platform')}
                    type="radio"
                    value={platform.value}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{platform.label}</div>
                      <div className="text-sm text-gray-600">{platform.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.platform && (
              <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              {...register('username')}
              type="text"
              placeholder="Enter your username"
              className="input-field"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              placeholder="Enter your password"
              className="input-field"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Your password is encrypted and stored securely. We use it only for automated posting.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We use headless browser automation to post your clips</li>
              <li>• Your credentials are encrypted and stored securely</li>
              <li>• You can remove your account at any time</li>
              <li>• We never share your login information</li>
            </ul>
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
              {isLoading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
