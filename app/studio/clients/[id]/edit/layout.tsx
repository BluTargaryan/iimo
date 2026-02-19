import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Client',
  description: 'Edit client information in iimo. Update client details, contact information, and manage your client relationships.',
}

export default function EditClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
