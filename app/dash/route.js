import { readFileSync } from 'fs';
import { join } from 'path';
import { getStaff } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let html;
export async function GET() {
  const me = await getStaff();
  if (!me) return new Response(null, { status: 302, headers: { Location: '/login' } });
  html = html || readFileSync(join(process.cwd(), 'dash', 'index.html'), 'utf8');
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
