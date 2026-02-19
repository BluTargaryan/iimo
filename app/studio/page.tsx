import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'iimo Studio - Manage your photo shoots, clients, usage rights, and share professional previews from your photography dashboard.',
}

export default function Studio() {
  redirect('/studio/shoots')
}
