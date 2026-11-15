import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sql } from './db';

export async function supa() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch (e) {} }
    }
  });
}

// Returns { email, name, role } for an active staff member, or null.
export async function getStaff() {
  let email = null;
  if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_EMAIL) email = process.env.DEV_AUTH_EMAIL;
  else {
    const { data } = await (await supa()).auth.getUser();
    email = data && data.user && data.user.email ? data.user.email.toLowerCase() : null;
  }
  if (!email) return null;
  const r = await sql`select email, display_name, role from archive.staff where email = ${email} and active`;
  return r.length ? { email: r[0].email, name: r[0].display_name, role: r[0].role } : null;
}
