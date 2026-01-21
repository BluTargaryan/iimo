'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TextInput from "../../components/atoms/TextInput";
import PasswordInput from "../../components/atoms/PasswordInput";
import Button from "../../components/atoms/Button";
import { supabase } from '@/app/utils/supabase'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    personalBusinessName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
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
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            personal_business_name: formData.personalBusinessName
          },
          emailRedirectTo: `${window.location.origin}/authenth/verify-otp`
        }
      })

      if (signUpError) {
        setError(signUpError.message || 'An error occurred during sign up')
        setLoading(false)
        return
      }

      // Redirect to verify OTP page with email
      router.push(`/authenth/verify-otp?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">
      <div className="w-64 col-flex items-center gap-4 mb-28">
        <h1>Sign up</h1>
        {error && <span className="text-error">{error}</span>}
      </div>

      <div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
        <TextInput 
          id="fullName" 
          name="fullName" 
          type="text" 
          label="Full name" 
          placeholder="Enter your name"
          value={formData.fullName}
          onChange={handleInputChange}
        />
        <TextInput 
          id="personalBusinessName" 
          name="personalBusinessName" 
          type="text" 
          label="Personal / business name" 
          placeholder="Enter your name"
          value={formData.personalBusinessName}
          onChange={handleInputChange}
        />
        <TextInput 
          id="email" 
          name="email" 
          type="email" 
          label="Email" 
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
        />
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
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Complete registration'}
        </Button>
        <Button 
          type="button"
          className="border-2 border-foreground text-foreground w-full p-3.5"
          onClick={() => router.push('/authenth/login')}
        >
          Sign in
        </Button>
      </div>
    </form>
  );
}
