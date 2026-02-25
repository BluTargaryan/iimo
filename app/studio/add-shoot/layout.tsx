import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Shoot',
  description: 'Create a new photo shoot in iimo. Add shoot details, select a client, set dates, and start organizing your photography project.',
}

export default function AddShootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
