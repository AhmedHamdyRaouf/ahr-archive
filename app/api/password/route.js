import { getStaff, supa } from '@/lib/auth';
export const runtime = 'nodejs';

// Lets a signed-in staff member change their own password (Supabase enforces the project's password rules).
export async function POST(req) {
  const me = await getStaff();
  if (!me) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== 'string' || password.length < 12 || password.length > 200) {
    return Response.json({ error: 'كلمة السر لازم تكون 12 حرف على الأقل' }, { status: 400 });
  }
  const { error } = await (await supa()).auth.updateUser({ password });
  if (error) return Response.json({ error: String(error.message || 'فشل التغيير').slice(0, 200) }, { status: 400 });
  return Response.json({ ok: true });
}
