'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface MFAVerificationProps {
  factorId: string
  challengeId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function MFAVerification({ 
  factorId, 
  challengeId, 
  onSuccess, 
  onCancel 
}: MFAVerificationProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter the 6-digit code')
      return
    }

    if (code.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code
      })

      if (verifyError) {
        console.error('Verification error:', verifyError)
        setError('Invalid code. Please try again.')
        setCode('')
        return
      }

      toast.success('2FA verification successful!')
      onSuccess()
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Failed to verify code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    setCode('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-primary-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Verification Error</p>
                <p>{error}</p>
                <button
                  onClick={handleRetry}
                  className="text-red-600 hover:text-red-700 font-medium mt-2 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700">
              6-Digit Code
            </label>
            <input
              id="mfa-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
              maxLength={6}
              autoFocus
            />
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyCode}
              className="flex-1"
              loading={loading}
              disabled={!code || code.length !== 6}
            >
              Verify
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Don't have access to your authenticator app? Contact support for help.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
