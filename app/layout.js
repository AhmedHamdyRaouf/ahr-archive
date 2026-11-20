export const metadata = {
  title: 'AHR Master Archive',
  manifest: '/manifest.webmanifest',
  icons: { icon: [{ url: '/favicon-32.png?v=3', sizes: '32x32', type: 'image/png' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: [{ url: '/apple-touch-icon.png?v=3', sizes: '180x180' }] },
  appleWebApp: { capable: true, title: 'AHR Archive', statusBarStyle: 'default' }
};
export const viewport = { themeColor: '#F5F6FA' };
export default function RootLayout({ children }) {
  return (<html lang="ar" dir="rtl"><body style={{ margin: 0 }}>{children}</body></html>);
}
