'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

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

interface SocialAccount {
  id: string
  platform: 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE_SHORTS'
  username: string
  isConnected: boolean
  lastUsed?: string
  createdAt: string
}

interface UploadModalProps {
  clip: Clip
  onClose: () => void
  onUploadStarted: () => void
}

export default function UploadModal({ clip, onClose, onUploadStarted }: UploadModalProps) {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)

  useEffect(() => {
    fetchSocialAccounts()
  }, [])

  const fetchSocialAccounts = async () => {
    try {
      const response = await fetch('/api/social-accounts')
      if (response.ok) {
        const data = await response.json()
        setSocialAccounts(data.accounts.filter((account: SocialAccount) => account.isConnected))
      }
    } catch (error) {
      console.error('Error fetching social accounts:', error)
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleUpload = async () => {
    if (selectedAccounts.length === 0) {
      toast.error('Please select at least one social media account')
      return
    }

    setIsLoading(true)
    
    try {
      const uploadPromises = selectedAccounts.map(accountId => 
        fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clipId: clip.id,
            socialAccountId: accountId,
            scheduledAt: scheduledAt || undefined,
          }),
        })
      )

      const responses = await Promise.all(uploadPromises)
      const results = await Promise.all(responses.map(r => r.json()))

      const successCount = results.filter(r => r.message).length
      const errorCount = results.length - successCount

      if (successCount > 0) {
        toast.success(`Upload started for ${successCount} platform(s)`)
        onUploadStarted()
        onClose()
      }

      if (errorCount > 0) {
        toast.error(`Failed to start upload for ${errorCount} platform(s)`)
      }
    } catch (error) {
      toast.error('Failed to start upload')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'TIKTOK':
        return '🎵'
      case 'INSTAGRAM':
        return '📷'
      case 'YOUTUBE_SHORTS':
        return '📺'
      default:
        return '📱'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'TIKTOK':
        return 'TikTok'
      case 'INSTAGRAM':
        return 'Instagram'
      case 'YOUTUBE_SHORTS':
        return 'YouTube Shorts'
      default:
        return platform
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'TIKTOK':
        return 'border-black'
      case 'INSTAGRAM':
        return 'border-purple-500'
      case 'YOUTUBE_SHORTS':
        return 'border-red-500'
      default:
        return 'border-gray-500'
    }
  }

  if (isLoadingAccounts) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Upload Clip</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Clip Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{clip.title}</h4>
            {clip.description && (
              <p className="text-sm text-gray-600 mb-2">{clip.description}</p>
            )}
            <p className="text-sm text-gray-500">
              Duration: {Math.floor(clip.duration / 60)}:{(clip.duration % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Social Media Accounts */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Select Platforms</h4>
            {socialAccounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No connected social media accounts</p>
                <p className="text-sm text-gray-500">
                  Connect your social media accounts first to upload clips.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {socialAccounts.map((account) => (
                  <label
                    key={account.id}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedAccounts.includes(account.id)
                        ? `${getPlatformColor(account.platform)} bg-gray-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => handleAccountToggle(account.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlatformIcon(account.platform)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getPlatformName(account.platform)}
                        </div>
                        <div className="text-sm text-gray-600">@{account.username}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Schedule Upload (Optional)</h4>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="input-field"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to upload immediately
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isLoading || selectedAccounts.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Starting Upload...' : 'Start Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
