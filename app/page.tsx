import type { Metadata } from 'next'
import HomeClient from './components/sections/HomeClient'

export const metadata: Metadata = {
  title: 'Home',
  description: 'iimo - Professional photo shoot management platform. Sign up or sign in to manage your photography projects, clients, and usage rights.',
}

export default function Home() {
  return <HomeClient />
}
