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
    default: 'Pakmedinex - Direct Medical Equipment Marketplace Pakistan',
    template: '%s | Pakmedinex',
  },
  description: 'Pakistan\'s leading Direct Medical Equipment Marketplace. Connect directly with verified vendors, buyers, and certified engineers for zero-commission transactions.',
  keywords: ['medical equipment', 'Pakistan', 'direct medical marketplace', 'healthcare', 'hospital equipment', 'diagnostic equipment', 'medical devices', 'certified engineers', 'DRAP'],
  authors: [{ name: 'Pakmedinex' }],
  creator: 'Pakmedinex',
  metadataBase: new URL('https://pakmedinex.com'),
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://pakmedinex.com',
    siteName: 'Pakmedinex',
    title: 'Pakmedinex - Direct Medical Equipment Marketplace Pakistan',
    description: 'Pakistan\'s leading Direct Medical Equipment Marketplace. Connect directly with verified vendors and engineers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pakmedinex' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pakmedinex - Direct Medical Equipment Marketplace',
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
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://pakmedinex.com/#website",
        "url": "https://pakmedinex.com/",
        "name": "Pakmedinex",
        "description": "Direct Medical Equipment Marketplace Pakistan",
        "potentialAction": [{
          "@type": "SearchAction",
          "target": "https://pakmedinex.com/products?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }]
      },
      {
        "@type": "Organization",
        "@id": "https://pakmedinex.com/#organization",
        "name": "Pakmedinex",
        "url": "https://pakmedinex.com/",
        "logo": "https://pakmedinex.com/icon.svg",
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
        <AuthProvider initialUser={user}>
          {children}
          <Analytics />
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
