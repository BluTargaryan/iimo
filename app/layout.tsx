import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import WebVitalsReporter from "./components/sections/WebVitalsReporter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Prevents render blocking - shows fallback immediately
  preload: true, // Preloads primary font for faster LCP
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Prevents render blocking
  preload: false, // Only preload primary font
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iimo.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "iimo - Photo Shoot Management",
    template: "%s | iimo",
  },
  description: "iimo is a comprehensive photo shoot management platform. Organize your shoots, manage clients, track usage rights, and share professional previews with ease.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "iimo",
    title: "iimo - Photo Shoot Management",
    description: "iimo is a comprehensive photo shoot management platform. Organize your shoots, manage clients, track usage rights, and share professional previews with ease.",
  },
  twitter: {
    card: "summary_large_image",
    title: "iimo - Photo Shoot Management",
    description: "iimo is a comprehensive photo shoot management platform. Organize your shoots, manage clients, track usage rights, and share professional previews with ease.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebVitalsReporter />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
