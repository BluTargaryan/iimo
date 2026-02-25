import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Shoot',
  description: 'Edit your photo shoot details in iimo. Update shoot information, client, dates, and other project details.',
}

export default function EditShootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
