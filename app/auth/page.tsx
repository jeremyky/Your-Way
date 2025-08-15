'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import MFAEnrollment from '@/components/auth/MFAEnrollment'
import MFAVerification from '@/components/auth/MFAVerification'
import DebugInfo from '@/components/auth/DebugInfo'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showMFA, setShowMFA] = useState(false)
  const [showMFAVerification, setShowMFAVerification] = useState(false)
  const [mfaData, setMfaData] = useState<{ factorId: string; challengeId: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  
  const router = useRouter()
  const { signIn, signUp, signOut } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.name
        })
        
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Account created! Please check your email to verify your account.')
          // Show MFA enrollment after successful signup
          setShowMFA(true)
        }
      } else {
        const { error, requiresMFA, factorId, challengeId } = await signIn(formData.email, formData.password)
        
        if (error) {
          toast.error(error.message)
        } else if (requiresMFA && factorId && challengeId) {
          // MFA verification required
          setMfaData({ factorId, challengeId })
          setShowMFAVerification(true)
        } else {
          toast.success('Signed in successfully!')
          router.push('/psychology')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const handleMFAComplete = () => {
    setShowMFA(false)
    toast.success('2FA setup complete! You can now sign in with your new account.')
    setIsSignUp(false)
    // Clear form data after successful signup
    setFormData({ name: '', email: '', password: '' })
  }

  const handleMFACancel = () => {
    setShowMFA(false)
    // If user cancels MFA, they can still sign in later
    toast('Account created! You can enable 2FA later in your account settings.')
    setIsSignUp(false)
    // Clear form data
    setFormData({ name: '', email: '', password: '' })
  }

  const handleMFAVerificationSuccess = () => {
    setShowMFAVerification(false)
    setMfaData(null)
    toast.success('2FA verification successful!')
    router.push('/psychology')
  }

  const handleMFAVerificationCancel = async () => {
    setShowMFAVerification(false)
    setMfaData(null)
    // Sign out the user since they cancelled MFA verification
    await signOut()
    toast('Sign in cancelled')
  }

  // Show MFA enrollment if user just signed up
  if (showMFA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-primary-50 flex items-center justify-center px-4">
        <MFAEnrollment 
          onComplete={handleMFAComplete}
          onCancel={handleMFACancel}
        />
      </div>
    )
  }

  // Show MFA verification if user is signing in with 2FA enabled
  if (showMFAVerification && mfaData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-primary-50 flex items-center justify-center px-4">
        <MFAVerification
          factorId={mfaData.factorId}
          challengeId={mfaData.challengeId}
          onSuccess={handleMFAVerificationSuccess}
          onCancel={handleMFAVerificationCancel}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-primary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-flow-500 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-earth-900">Your Way</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? 'Begin Your Journey' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Create your account to start your path of self-discovery'
                : 'Sign in to continue your journey'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-earth-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-earth-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-earth-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-earth-400 hover:text-earth-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {isSignUp && (
                <div className="flex items-start space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-earth-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-earth-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-earth-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
            
            {!isSignUp && (
              <div className="mt-4 text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-earth-500">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </Link>
          </p>
        </div>
        
        {/* Temporary debug info - remove this after fixing the issue */}
        <div className="mt-4">
          <DebugInfo />
        </div>
      </div>
    </div>
  )
} 