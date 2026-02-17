'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/app/components/atoms/Button'

export default function ShootDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Shoot detail error:', error)
  }, [error])

  return (
    <main className='col-flex items-center justify-center min-h-screen p-4'>
      <div className='col-flex gap-6 items-center max-w-[500px] text-center'>
        <h1 className='text-4xl font-bold'>Failed to load shoot</h1>
        <p className='text-lg text-placeholder'>
          An error occurred while loading the shoot details. Please try again.
        </p>
        {error.message && (
          <p className='text-sm text-error bg-red-50 p-3 rounded border border-red-200'>
            {error.message}
          </p>
        )}
        <div className='col-flex gap-3 mt-4'>
          <Button
            onClick={reset}
            className='bg-foreground text-background px-6 py-3'
          >
            Try again
          </Button>
          <Button
            onClick={() => router.push('/studio/shoots')}
            className='border border-foreground text-foreground px-6 py-3'
          >
            Back to shoots
          </Button>
        </div>
      </div>
    </main>
  )
}
