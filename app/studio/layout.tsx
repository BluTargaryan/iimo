import type { Metadata } from 'next'
import StudioShell from '@/app/components/sections/StudioShell'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'iimo Studio - Manage your photo shoots, clients, usage rights, and share professional previews from your photography dashboard.',
}

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StudioShell>
      {children}
    </StudioShell>
  )
}
