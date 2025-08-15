'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ShieldCheckIcon, QrCodeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface MFAEnrollmentProps {
  onComplete: () => void
  onCancel: () => void
}

export default function MFAEnrollment({ onComplete, onCancel }: MFAEnrollmentProps) {
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Enroll TOTP when component mounts
  useEffect(() => {
    enrollFactor()
  }, [])

  const enrollFactor = async () => {
    try {
      setEnrolling(true)
      setError(null)
      
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setError('No active session found. Please try signing in again.')
        setEnrolling(false)
        return
      }

      console.log('Attempting MFA enrollment for user:', session.user.email)
      
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Your Way App'
      })
      
      if (error) {
        console.error('Error enrolling factor:', error)
        setError(`MFA enrollment failed: ${error.message}`)
        setEnrolling(false)
        return
      }
      
      console.log('MFA enrollment successful:', data)
      
      if (!data.totp?.qr_code) {
        setError('QR code not generated. Please try again.')
        setEnrolling(false)
        return
      }
      
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setEnrolling(false)
    } catch (err) {
      console.error('Unexpected error during MFA enrollment:', err)
      setError('Failed to set up 2FA. Please try again.')
      setEnrolling(false)
    }
  }

  // Verify the user's code
  const verifyCode = async () => {
    if (!factorId || !code.trim()) {
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
      // Get challenge
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ 
        factorId 
      })
      
      if (challengeError) {
        console.error('Challenge error:', challengeError)
        setError(challengeError.message)
        return
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      })

      if (verifyError) {
        console.error('Verification error:', verifyError)
        setError('Invalid code. Please try again.')
        setCode('')
        return
      }

      toast.success('2FA enabled successfully!')
      onComplete()
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
    enrollFactor()
  }

  const handleSkip = () => {
    toast('2FA setup skipped. You can enable it later in your account settings.')
    onComplete()
  }

  if (enrolling) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-primary-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
            </div>
            <CardTitle className="text-xl">Setting up 2FA</CardTitle>
            <CardDescription>
              Please wait while we prepare your security setup...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-primary-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle className="text-xl">Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app to complete setup
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Setup Error</p>
                <p>{error}</p>
                <div className="mt-3 space-x-2">
                  <button
                    onClick={handleRetry}
                    className="text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Try again
                  </button>
                  <button
                    onClick={handleSkip}
                    className="text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}

          {qrCode && (
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img 
                  src={`data:image/png;base64,${qrCode}`} 
                  alt="Scan with your Authenticator app"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code with apps like Google Authenticator, Authy, or Microsoft Authenticator
              </p>
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
              Verify & Enable
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Having trouble? Skip 2FA setup for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
