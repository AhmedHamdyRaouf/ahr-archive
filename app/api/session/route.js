import { getStaff, supa } from '@/lib/auth';
export const runtime = 'nodejs';
export async function GET() {
  const me = await getStaff();
  if (!me) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { data } = await (await supa()).auth.getSession();
  return Response.json({
    me, url: process.env.NEXT_PUBLIC_SUPABASE_URL, anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    token: data && data.session ? data.session.access_token : null
  });
}
