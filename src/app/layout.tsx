import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { Toaster } from 'sonner'
import RouteGuard from '@/components/shared/RouteGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coaching Platform',
  description: 'Multi-tenant Coaching Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <RouteGuard>
            {children}
          </RouteGuard>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}