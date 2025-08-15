'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugInfo() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
      setUser(currentSession?.user || null)
      setLoading(false)
    } catch (error) {
      console.error('Debug auth check error:', error)
      setLoading(false)
    }
  }

  const testMFAEnroll = async () => {
    try {
      console.log('Testing MFA enrollment...')
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Test Device'
      })
      
      if (error) {
        console.error('MFA enrollment test failed:', error)
        alert(`MFA enrollment failed: ${error.message}`)
      } else {
        console.log('MFA enrollment test successful:', data)
        alert('MFA enrollment test successful!')
      }
    } catch (error) {
      console.error('MFA enrollment test error:', error)
      alert(`MFA enrollment test error: ${error}`)
    }
  }

  if (loading) {
    return <div>Loading debug info...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-sm font-mono">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-2">
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        <div>
          <strong>User:</strong> {user ? user.email : 'None'}
        </div>
        <div>
          <strong>User ID:</strong> {user ? user.id : 'None'}
        </div>
        <div>
          <strong>Email Confirmed:</strong> {user ? user.email_confirmed_at ? 'Yes' : 'No' : 'N/A'}
        </div>
        <div>
          <strong>MFA Factors:</strong> {user?.factors ? user.factors.length : 'None'}
        </div>
        <button
          onClick={testMFAEnroll}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Test MFA Enrollment
        </button>
        <button
          onClick={checkAuth}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs ml-2"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
