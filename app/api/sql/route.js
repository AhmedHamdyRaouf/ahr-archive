import { sql } from '@/lib/db';
import { getStaff } from '@/lib/auth';
export const runtime = 'nodejs';
export const maxDuration = 30;

// Read-only: runs the dashboard's SELECT queries inside a READ ONLY transaction.
export async function POST(req) {
  const me = await getStaff();
  if (!me) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { q } = await req.json();
  if (typeof q !== 'string' || q.length > 20000) return Response.json({ error: 'bad query' }, { status: 400 });
  try {
    const rows = await sql.begin('read only', async (tx) => {
      await tx`set local statement_timeout = '25s'`;
      return await tx.unsafe(q);
    });
    return Response.json({ rows: Array.from(rows) });
  } catch (e) {
    return Response.json({ error: String(e.message || e).slice(0, 400) }, { status: 400 });
  }
}
