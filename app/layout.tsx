import React from "react"
import { AuthProvider } from '@/components/providers/auth-provider'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from 'sonner'

const _geist = Geist({ subsets: ["latin"], variable: '--font-geist-sans' });
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: {
    default: 'Medixra - Direct Medical Equipment Marketplace Pakistan',
    template: '%s | Medixra',
  },
  description: 'Pakistan\'s leading Direct Medical Equipment Marketplace. Connect directly with verified vendors, buyers, and certified technicians for zero-commission transactions.',
  keywords: ['medical equipment', 'Pakistan', 'direct medical marketplace', 'healthcare', 'hospital equipment', 'diagnostic equipment', 'medical devices', 'certified technicians', 'DRAP'],
  authors: [{ name: 'Medixra' }],
  creator: 'Medixra',
  metadataBase: new URL('https://medixra.com'),
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://medixra.com',
    siteName: 'Medixra',
    title: 'Medixra - Direct Medical Equipment Marketplace Pakistan',
    description: 'Pakistan\'s leading Direct Medical Equipment Marketplace. Connect directly with verified vendors and technicians.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Medixra' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medixra - Direct Medical Equipment Marketplace',
    description: 'Pakistan\'s leading Direct Medical Equipment Marketplace.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://medixra.com/#website",
        "url": "https://medixra.com/",
        "name": "Medixra",
        "description": "Direct Medical Equipment Marketplace Pakistan",
        "potentialAction": [{
          "@type": "SearchAction",
          "target": "https://medixra.com/products?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }]
      },
      {
        "@type": "Organization",
        "@id": "https://medixra.com/#organization",
        "name": "Medixra",
        "url": "https://medixra.com/",
        "logo": "https://medixra.com/icon.svg",
        "sameAs": []
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${_geist.className} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider initialSession={session}>
          {children}
          <Analytics />
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
