'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TextInput from "../../components/atoms/TextInput";
import Button from "../../components/atoms/Button";
import { supabase } from '@/app/utils/supabase'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/authenth/resetpassword`
      })

      if (resetError) {
        setError(resetError.message || 'An error occurred. Please try again.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
      <div className="w-64 col-flex items-center gap-4 mb-28">
        <h1 className="text-center">Forgot password?</h1>
        {error && <span className="text-error">{error}</span>}
        {success && (
          <span className="text-center text-green-600">
            Password reset link has been sent to your email. Please check your inbox.
          </span>
        )}
      </div>

      <div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
        <TextInput 
          id="email" 
          name="email" 
          type="email" 
          label="Email" 
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
        />
        <span className="text-center font-normal">
          In a few minutes, we will send a reset link to your email once we confirm it exists.
        </span>
      </div>

      <div className="w-full col-flex gap-3.5">
        <Button 
          type="submit" 
          className="bg-foreground text-background w-full p-3.5"
          disabled={loading || success}
        >
          {loading ? 'Sending...' : 'Submit email'}
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
