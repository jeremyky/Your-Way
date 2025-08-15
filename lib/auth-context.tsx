'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any; requiresMFA?: boolean; factorId?: string; challengeId?: string }>
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  verifyMFA: (factorId: string, challengeId: string, code: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error }
    }

    // Check if MFA is required
    if (data.session?.user.factors && data.session.user.factors.length > 0) {
      // User has MFA enabled, we need to handle the challenge
      const factor = data.session.user.factors[0]
      if (factor.status === 'verified') {
        // MFA already verified, proceed with sign in
        return { error: null }
      } else {
        // MFA challenge required
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: factor.id
        })
        
        if (challengeError) {
          return { error: challengeError }
        }
        
        return { 
          error: null, 
          requiresMFA: true, 
          factorId: factor.id, 
          challengeId: challenge.id 
        }
      }
    }

    return { error: null }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const verifyMFA = async (factorId: string, challengeId: string, code: string) => {
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    verifyMFA,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
