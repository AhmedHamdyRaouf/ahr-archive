import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Refreshes the Supabase session cookie and sends visitors without a session to /login.
export async function middleware(req) {
  let res = NextResponse.next({ request: req });
  if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_EMAIL) return res;
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      }
    }
  });
  const { data } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  if (!data.user && !path.startsWith('/login')) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (data.user && path.startsWith('/login')) return NextResponse.redirect(new URL('/dash', req.url));
  return res;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon-32.png|icon-192.png|icon-512.png|apple-touch-icon.png|manifest.webmanifest).*)'] };
