import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shoots',
  description: 'View and manage your photo shoots. Create new shoots, edit details, share previews, and track usage rights for all your photography projects.',
}

export default function ShootsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
