'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TextInput from "../../components/atoms/TextInput";
import PasswordInput from "../../components/atoms/PasswordInput";
import Button from "../../components/atoms/Button";
import { supabase } from '@/app/utils/supabase'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    if (!formData.password) {
      setError('Password is required')
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        setError(signInError.message || 'Invalid email or password')
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

  return (
    <form onSubmit={handleSubmit} className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
      <div className="w-64 col-flex items-center gap-4 mb-28">
        <h1>Log in</h1>
        {error && <span className="text-error">{error}</span>}
      </div>

      <div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
        <TextInput 
          id="email" 
          name="email" 
          type="email" 
          label="Email / title" 
          placeholder="Enter your email or title"
          value={formData.email}
          onChange={handleInputChange}
        />

        <div className="w-full col-flex items-center gap-3.5">
          <PasswordInput 
            id="password" 
            name="password" 
            label="Password" 
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <Link href="/authenth/forgotpassword" className="underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="w-full col-flex gap-3.5">
        <Button 
          type="submit" 
          className="bg-foreground text-background w-full p-3.5"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
        <Button 
          type="button"
          className="border-2 border-foreground text-foreground w-full p-3.5"
          onClick={() => router.push('/authenth/signup')}
        >
          Sign up
        </Button>
      </div>
    </form>
  );
}
