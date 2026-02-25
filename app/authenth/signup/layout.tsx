import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your iimo account to start managing your photo shoots, clients, and usage rights. Join photographers using iimo for professional project management.',
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
