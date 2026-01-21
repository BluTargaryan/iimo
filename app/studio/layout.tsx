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

    // Context finished loading but no user - wait for session with async/await
    if (!loading && !user) {
      const waitForSession = async () => {
        let attempts = 0
        const maxAttempts = 10 // 5 seconds total (10 * 500ms)
        
        while (attempts < maxAttempts) {
          const { data: { session: directSession } } = await supabase.auth.getSession()
          
          if (directSession?.user) {
            // Give context time to catch up (it will update via onAuthStateChange)
            setCheckingSession(false)
            return
          }
          
          // Wait 500ms before next attempt
          await new Promise(resolve => setTimeout(resolve, 500))
          attempts++
        }
        
        // No session found after all attempts
        router.push('/authenth/login')
      }
      
      waitForSession()
    }
  }, [user, loading, session, router])

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
