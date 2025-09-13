'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import AddSocialAccountModal from './AddSocialAccountModal'

interface SocialAccount {
  id: string
  platform: 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE_SHORTS'
  username: string
  isConnected: boolean
  lastUsed?: string
  createdAt: string
}

interface SocialAccountsManagerProps {
  onAccountAdded: () => void
}

export default function SocialAccountsManager({ onAccountAdded }: SocialAccountsManagerProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/social-accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this social media account?')) {
      return
    }

    try {
      const response = await fetch(`/api/social-accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      toast.success('Account deleted successfully')
      fetchAccounts()
    } catch (error) {
      toast.error('Failed to delete account')
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
        return 'bg-black text-white'
      case 'INSTAGRAM':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'YOUTUBE_SHORTS':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Social Media Accounts</h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Account</span>
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <ShareIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No social media accounts</h3>
          <p className="text-gray-600 mb-4">Connect your social media accounts to automatically upload clips.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getPlatformColor(account.platform)}`}>
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getPlatformName(account.platform)}
                    </h4>
                    <p className="text-sm text-gray-600">@{account.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {account.isConnected ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {account.isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                {account.lastUsed && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Last used: {new Date(account.lastUsed).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <AddSocialAccountModal
          onClose={() => setIsAddModalOpen(false)}
          onAccountAdded={() => {
            fetchAccounts()
            onAccountAdded()
            setIsAddModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
