import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clients',
  description: 'Manage your photography clients. View client details, track associated shoots, add notes, and maintain your client relationships in one place.',
}

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
