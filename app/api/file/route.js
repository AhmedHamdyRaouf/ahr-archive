import { getStaff, supa } from '@/lib/auth';
export const runtime = 'nodejs';
export async function GET(req) {
  const me = await getStaff();
  if (!me) return new Response('unauthorized', { status: 401 });
  const p = new URL(req.url).searchParams.get('p') || '';
  if (!/^[\w\-./]+$/.test(p) || p.includes('..')) return new Response('bad path', { status: 400 });
  const { data, error } = await (await supa()).storage.from('archive-files').createSignedUrl(p, 120);
  if (error || !data) return new Response('not found', { status: 404 });
  return Response.redirect(data.signedUrl, 302);
}
