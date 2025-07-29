import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Your Way - Discover Your Path',
  description: 'A guided journey of self-discovery and personal growth, inspired by Taoist wisdom. Map your inner landscape, understand your relationships, and find your authentic path.',
  keywords: 'self-discovery, personal growth, journaling, relationships, mindfulness, Taoist wisdom, inner guide',
  authors: [{ name: 'Your Way Team' }],
  openGraph: {
    title: 'Your Way - Discover Your Path',
    description: 'A guided journey of self-discovery and personal growth, inspired by Taoist wisdom.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Way - Discover Your Path',
    description: 'A guided journey of self-discovery and personal growth, inspired by Taoist wisdom.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </body>
    </html>
  )
} 