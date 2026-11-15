import { sql } from '@/lib/db';
import { getStaff } from '@/lib/auth';
export const runtime = 'nodejs';
export const maxDuration = 30;

const FNS = new Set(['api_save','api_status','api_create','api_credit','api_link','api_date','api_review','api_merge']);

// Write: only the whitelisted archive.api_* functions. The editor name comes from the signed-in staff member.
export async function POST(req) {
  const me = await getStaff();
  if (!me) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (me.role === 'viewer') return Response.json({ error: 'صلاحيتك للعرض فقط' }, { status: 403 });
  const { fn, obj } = await req.json();
  if (!FNS.has(fn) || typeof obj !== 'object' || obj === null) return Response.json({ error: 'bad request' }, { status: 400 });
  const payload = { ...obj, editor: me.name };
  try {
    const rows = await sql.begin(async (tx) => {
      await tx`set local statement_timeout = '25s'`;
      return await tx.unsafe(`select archive.${fn}($1::text::jsonb) j`, [JSON.stringify(payload)]);
    });
    return Response.json({ result: rows[0] ? rows[0].j : null });
  } catch (e) {
    return Response.json({ error: String(e.message || e).slice(0, 400) }, { status: 400 });
  }
}
