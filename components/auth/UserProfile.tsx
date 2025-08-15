'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { UserIcon, ShieldCheckIcon, ShieldExclamationIcon, CogIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  const hasMFA = user.factors && user.factors.length > 0
  const mfaStatus = hasMFA ? 'Enabled' : 'Disabled'

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="w-8 h-8 text-primary-600" />
        </div>
        <CardTitle className="text-xl">User Profile</CardTitle>
        <CardDescription>
          Manage your account settings and security
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.email}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.user_metadata?.full_name || 'Not set'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Two-Factor Authentication
            </label>
            <div className="flex items-center space-x-2">
              {hasMFA ? (
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              ) : (
                <ShieldExclamationIcon className="w-5 h-5 text-yellow-600" />
              )}
              <span className={`text-sm font-medium ${
                hasMFA ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {mfaStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {hasMFA 
                ? 'Your account is protected with 2FA'
                : 'Enable 2FA for enhanced security'
              }
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Created
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => window.location.href = '/auth'}
            variant="outline"
            className="flex-1"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            Account Settings
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex-1"
            loading={loading}
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
