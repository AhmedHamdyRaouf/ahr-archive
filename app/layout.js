export const metadata = {
  title: 'AHR Master Archive',
  manifest: '/manifest.webmanifest',
  icons: { icon: [{ url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }] },
  appleWebApp: { capable: true, title: 'AHR Archive', statusBarStyle: 'black-translucent' }
};
export const viewport = { themeColor: '#0F192F' };
export default function RootLayout({ children }) {
  return (<html lang="ar" dir="rtl"><body style={{ margin: 0 }}>{children}</body></html>);
}
