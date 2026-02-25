import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify OTP',
  description: 'Verify your one-time password (OTP) for your iimo account. Enter the code sent to your email or phone.',
}

export default function VerifyOTPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
