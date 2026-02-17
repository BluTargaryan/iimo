'use client'

import { useEffect } from 'react'
import Button from './components/atoms/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <main className='col-flex items-center justify-center min-h-screen p-4'>
      <div className='col-flex gap-6 items-center max-w-[500px] text-center'>
        <h1 className='text-4xl font-bold'>Something went wrong!</h1>
        <p className='text-lg text-placeholder'>
          An unexpected error occurred. Please try again.
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
            onClick={() => window.location.href = '/'}
            className='border border-foreground text-foreground px-6 py-3'
          >
            Go to home
          </Button>
        </div>
      </div>
    </main>
  )
}
