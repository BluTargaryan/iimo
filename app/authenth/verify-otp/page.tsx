'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TextInput from "../../components/atoms/TextInput";
import Button from "../../components/atoms/Button";
import { supabase } from '@/app/utils/supabase'

export default function VerifyOtp() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam)
      setEmail(decodedEmail)
    } else {
      // If no email in URL, redirect back to signup
      router.push('/authenth/signup')
    }
  }, [searchParams, router])

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otp.trim()) {
      setError('Please enter the OTP code')
      return
    }

    if (!email) {
      setError('Email is missing. Please try signing up again.')
      return
    }

    setLoading(true)

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (verifyError) {
        setError(verifyError.message || 'Invalid OTP code. Please try again.')
        setLoading(false)
        return
      }

      // Wait for auth state change to ensure session is fully established
      // This ensures the session is synced to both localStorage and cookies
      let redirectAttempted = false
      
      // Listen for auth state change - this fires when session is fully established
      // The SIGNED_IN event is fired when OTP verification succeeds
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        // SIGNED_IN event fires when OTP verification succeeds and session is created
        if (event === 'SIGNED_IN' && newSession && !redirectAttempted) {
          // Wait a moment for session to be fully synced to localStorage/cookies
          // Then verify session one more time before redirecting
          setTimeout(async () => {
            if (!redirectAttempted) {
              const { data: { session: verifiedSession } } = await supabase.auth.getSession()
              
              if (verifiedSession && !redirectAttempted) {
                redirectAttempted = true
                subscription.unsubscribe()
                // Use window.location for full page reload to sync cookies properly
                // This ensures middleware can read the session cookie
                window.location.href = '/studio/shoots'
              }
            }
          }, 500) // Small delay to ensure session is synced
        }
      })

      // Fallback: If no SIGNED_IN event after 3 seconds, check session and redirect
      setTimeout(async () => {
        if (!redirectAttempted) {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            redirectAttempted = true
            subscription.unsubscribe()
            // Use window.location for full page reload
            window.location.href = '/studio/shoots'
          } else {
            subscription.unsubscribe()
            setError('Session could not be established. Please try logging in.')
            setLoading(false)
          }
        }
      }, 3000)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
      <div className="w-64 col-flex items-center gap-4 mb-28 text-center md:w-full">
        <h1>OTP Verification</h1>
        {email && (
          <span className="text-center">
            An OTP has been sent to you at {email}. Please add it below.
          </span>
        )}
        {error && <span className="text-error">{error}</span>}
      </div>

      <div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
        <TextInput 
          id="otp" 
          name="otp" 
          type="text" 
          label="Single use OTP" 
          placeholder="Enter your onetime pin"
          value={otp}
          onChange={handleOtpChange}
        />
      </div>

      <div className="w-full col-flex gap-3.5">
        <Button 
          type="submit" 
          className="bg-foreground text-background w-full p-3.5"
          disabled={loading || !email}
        >
          {loading ? 'Verifying...' : 'Submit'}
        </Button>
        <Button 
          type="button"
          className="border-2 border-foreground text-foreground w-full p-3.5"
          onClick={() => router.push('/authenth/signup')}
        >
          Go back
        </Button>
      </div>
    </form>
  );
}
