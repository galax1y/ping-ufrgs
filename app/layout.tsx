import { Toaster } from 'sonner'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { AppShell } from '@/components/app-shell'
import { ThemeProvider } from '@/components/theme-provider'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ping UFRGS',
  description: 'Room key and access',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className='min-h-screen font-sans antialiased'>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors position='bottom-right' closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
