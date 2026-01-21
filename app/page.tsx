'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/studio/shoots')
      } else {
        router.push('/authenth/signup')
      }
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span>Loading...</span>
    </div>
  )
}
