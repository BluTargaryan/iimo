import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upload Assets',
  description: 'Upload photos and assets to your shoot in iimo. Add images, organize your photography assets, and manage your shoot media.',
}

export default function UploadAssetsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
