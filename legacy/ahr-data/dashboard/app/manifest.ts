import type { MetadataRoute } from 'next'

// lets the dashboard be added to the phone home screen as an app
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'لوحة تحكم أحمد حمدي رؤوف',
    short_name: 'AHR',
    description: 'AHR Data — Ahmed Hamdy Raouf',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f4ef',
    theme_color: '#7a5c2e',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
