import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'AHR Dashboard',
  robots: { index: false, follow: false },
  icons: { icon: '/icon-192.png', apple: '/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'AHR', statusBarStyle: 'default' as const },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
