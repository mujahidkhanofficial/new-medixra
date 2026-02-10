import React from "react"
import { AuthProvider } from '@/components/providers/auth-provider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Toaster } from 'sonner'

const _geist = Geist({ subsets: ["latin"], variable: '--font-geist-sans' });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: {
    default: 'Medixra - Medical Equipment Marketplace Pakistan',
    template: '%s | Medixra',
  },
  description: 'Pakistan\'s trusted B2B marketplace for medical equipment. Connect with verified vendors, find new & refurbished equipment, and book technician services.',
  keywords: ['medical equipment', 'Pakistan', 'B2B', 'healthcare', 'hospital equipment', 'diagnostic equipment', 'medical devices', 'DRAP'],
  authors: [{ name: 'Medixra' }],
  creator: 'Medixra',
  metadataBase: new URL('https://medixra.com'),
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://medixra.com',
    siteName: 'Medixra',
    title: 'Medixra - Medical Equipment Marketplace Pakistan',
    description: 'Pakistan\'s trusted B2B marketplace for medical equipment. Connect with verified vendors and technicians.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Medixra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medixra - Medical Equipment Marketplace',
    description: 'Pakistan\'s trusted B2B marketplace for medical equipment.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.className} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Analytics />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
