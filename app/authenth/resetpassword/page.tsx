'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PasswordInput from "../../components/atoms/PasswordInput";
import Button from "../../components/atoms/Button";
import { supabase } from '@/app/utils/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    const establishRecoverySession = async () => {
      // Wait for Supabase to automatically process hash fragments
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setError('Invalid or expired reset link. Please request a new password reset.')
        setSessionChecked(true)
        return
      }
      
      if (!session) {
        // Check if there are hash fragments that need processing
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          // Wait a bit more for Supabase to process
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (!retrySession) {
            setError('Invalid or expired reset link. Please request a new password reset.')
          }
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      }
      
      setSessionChecked(true)
    }

    establishRecoverySession()

    // Also listen for auth state changes (in case hash is processed asynchronously)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !sessionChecked) {
        setSessionChecked(true)
        setError(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [sessionChecked])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (updateError) {
        setError(updateError.message || 'An error occurred. Please try again.')
        setLoading(false)
        return
      }

      // Session is created automatically, redirect to dashboard
      router.push('/studio/shoots')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <div className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
        <div className="w-64 col-flex items-center gap-4 mb-28">
          <h1 className="text-center">Reset password</h1>
          <span>Checking reset link...</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
      <div className="w-64 col-flex items-center gap-4 mb-28">
        <h1 className="text-center">Reset password</h1>
        {error && <span className="text-error">{error}</span>}
      </div>

      <div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
        <PasswordInput 
          id="password" 
          name="password" 
          label="Password" 
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <PasswordInput 
          id="confirmPassword" 
          name="confirmPassword" 
          label="Confirm password" 
          placeholder="Enter your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
      </div>

      <div className="w-full col-flex gap-3.5">
        <Button 
          type="submit" 
          className="bg-foreground text-background w-full p-3.5"
          disabled={loading || !!error}
        >
          {loading ? 'Resetting...' : 'Reset'}
        </Button>
        <Button 
          type="button"
          className="border-2 border-foreground text-foreground w-full p-3.5"
          onClick={() => router.push('/authenth/login')}
        >
          Back to login
        </Button>
      </div>
    </form>
  );
}
