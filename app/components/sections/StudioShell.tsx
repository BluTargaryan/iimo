'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopHeaderLoggedIn from "@/app/components/sections/TopHeaderLoggedIn"
import { useAuth } from '@/app/contexts/AuthContext'
import { supabase } from '@/app/utils/supabase'

export default function StudioShell({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    if (user) {
      setCheckingSession(false)
      return
    }

    if (loading) {
      return
    }

    if (!loading && !user) {
      const checkSessionOnce = async () => {
        const { data: { session: directSession } } = await supabase.auth.getSession()
        
        if (directSession?.user) {
          setCheckingSession(false)
        } else {
          router.push('/authenth/login')
        }
      }
      
      checkSessionOnce()
    }
  }, [user, loading, router])

  if (loading || checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className='pt-40 pb-30 px-4 md:px-10 xl:pb-40'>
      <TopHeaderLoggedIn />
      {children}
    </div>
  )
}
