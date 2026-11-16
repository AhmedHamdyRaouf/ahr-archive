import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null
export function sb(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: true, autoRefreshToken: true } },
    )
  }
  return client
}
export const OWNER = (process.env.NEXT_PUBLIC_OWNER_EMAIL || '').toLowerCase()
