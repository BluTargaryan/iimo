import Link from 'next/link'
import Button from './components/atoms/Button'

export default function NotFound() {
  return (
    <main className='col-flex items-center justify-center min-h-screen p-4'>
      <div className='col-flex gap-6 items-center max-w-[500px] text-center'>
        <h1 className='text-6xl font-bold'>404</h1>
        <h2 className='text-3xl font-semibold'>Page not found</h2>
        <p className='text-lg text-placeholder'>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className='col-flex gap-3 mt-4'>
          <Link href='/'>
            <Button className='bg-foreground text-background px-6 py-3'>
              Go to home
            </Button>
          </Link>
          <Link href='/studio/shoots'>
            <Button className='border border-foreground text-foreground px-6 py-3'>
              Go to studio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
