import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Client',
  description: 'Add a new client to your iimo account. Create client profiles to organize your photography business relationships.',
}

export default function AddClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
