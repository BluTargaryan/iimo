import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Usage Rights',
  description: 'Add usage rights for your photo shoot. Upload contracts, set expiration dates, and define usage permissions for your photography work.',
}

export default function AddRightsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
