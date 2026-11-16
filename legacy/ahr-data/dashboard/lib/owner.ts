// Shared owner check for server routes: the caller must send the owner's Supabase access token.
import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export async function ownerClient(req: Request): Promise<{ client: SupabaseClient; fail: null } | { client: null; fail: NextResponse }> {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return { client: null, fail: NextResponse.json({ error: 'bad request' }, { status: 400 }) }
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })
  const { data: u, error } = await client.auth.getUser(token)
  if (error || !u.user || (u.user.email || '').toLowerCase() !== (process.env.NEXT_PUBLIC_OWNER_EMAIL || '').toLowerCase()) {
    return { client: null, fail: NextResponse.json({ error: 'forbidden' }, { status: 403 }) }
  }
  return { client, fail: null }
}
