'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopHeaderLoggedIn from "@/app/components/sections/TopHeaderLoggedIn";
import AddShootFixed from "../components/sections/AddShootClientFixed";
import Toast from "../components/sections/Toast";
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '@/app/utils/supabase'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter()
  const { user, loading, session } = useAuth()
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // If context has user, we're good
    if (user) {
      setCheckingSession(false)
      return
    }

    // If still loading context, wait
    if (loading) {
      return
    }

    // Context finished loading but no user - check session once and redirect if needed
    // Rely on onAuthStateChange listener in AuthContext instead of polling
    if (!loading && !user) {
      const checkSessionOnce = async () => {
        const { data: { session: directSession } } = await supabase.auth.getSession()
        
        if (directSession?.user) {
          // Give context time to catch up (it will update via onAuthStateChange)
          setCheckingSession(false)
        } else {
          // No session found, redirect immediately
          router.push('/authenth/login')
        }
      }
      
      checkSessionOnce()
    }
  }, [user, loading, router])

  // Show loading while context is loading or we're checking session
  if (loading || checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    )
  }

  // If no user after all checks, return null (redirect will happen)
  if (!user) {
    return null
  }

  return (
    <div className='pt-40 pb-30 px-4 md:px-10 xl:pb-40'>
        <TopHeaderLoggedIn />
        {children}
    </div>
  );
}
