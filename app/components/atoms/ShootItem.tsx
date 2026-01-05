'use client'
import Image from 'next/image'
import Button from './Button'
import share from '@/app/assets/images/share.svg'
import { useRouter } from 'next/navigation'

const ShootItem = () => {
  const router = useRouter()
  return (
    <div className='col-flex gap-2 md:gap-4'>
        <h2>Title</h2>
        <span className='font-normal md:text-xl'>Description</span>

        <div className='grid grid-cols-2 gap-4.5 md:gap-3.5'>

        <Image src='https://images.unsplash.com/photo-1761839256547-0a1cd11b6dfb' alt='shoot-item' width={300} height={300} className='w-full h-full object-cover border-2 rounded-lg border-foreground' />
        <Image src='https://images.unsplash.com/photo-1761839256547-0a1cd11b6dfb' alt='shoot-item' width={300} height={300} className='w-full h-full object-cover border-2 rounded-lg border-foreground' />
        <Image src='https://images.unsplash.com/photo-1761839256547-0a1cd11b6dfb' alt='shoot-item' width={300} height={300} className='w-full h-full object-cover border-2 rounded-lg border-foreground' />
        <Image src='https://images.unsplash.com/photo-1761839256547-0a1cd11b6dfb' alt='shoot-item' width={300} height={300} className='w-full h-full object-cover border-2 rounded-lg border-foreground' />
        </div>

        <div className='row-flex gap-4.5'>
<Button className='bg-foreground text-background w-full p-3!' onClick={() => router.push('/studio/shoot/1')}>View</Button>
<Button className='border border-foreground text-foreground w-full p-3! row-flex gap-2 flex-centerize'>
    <span>Share</span>
    <Image src={share} alt='share' width={20} height={20} className='h-4 w-auto' />
</Button>
        </div>
    </div>
  )
}

export default ShootItem