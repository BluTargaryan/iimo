import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Usage Rights',
  description: 'Manage usage rights for your photo shoots. Upload contracts, set expiration dates, and track usage permissions for your photography work.',
}

export default function EditRightsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
