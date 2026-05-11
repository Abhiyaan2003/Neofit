import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/features/auth/AuthProvider'

export const metadata: Metadata = {
  title: {
    default: 'Neofit — Train Smarter, Without a Trainer',
    template: '%s | Neofit',
  },
  description: 'Neofit generates personalized workout plans based on the equipment in your gym. No trainer needed. Built for college gym users who want structured, effective training.',
  keywords: ['gym workout', 'workout plan', 'college gym', 'fitness app', 'no trainer'],
  openGraph: {
    title: 'Neofit — Train Smarter, Without a Trainer',
    description: 'Personalized workout plans based on your gym equipment.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0F1115',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: '#1D212B',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#EDEDED',
            },
          }}
        />
      </body>
    </html>
  )
}
