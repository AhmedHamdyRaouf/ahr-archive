// Serves one photo from the private data repo to the signed-in owner (the repo is private, so the browser cannot read it directly).
// ?path=photos/<folder>/<file>&w=<pixels> returns a resized JPEG; without w the original file is returned.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

export const runtime = 'nodejs'

const PATH = /^photos\/(ahmed|people|events|works|press|misc)\/[A-Za-z0-9._-]+\.(jpe?g|png)$/i

export async function GET(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || ''
  const w = Math.min(2000, Math.max(0, parseInt(url.searchParams.get('w') || '0', 10) || 0))
  if (!token || !PATH.test(path) || path.includes('..')) return NextResponse.json({ error: 'bad request' }, { status: 400 })

  const ghToken = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!ghToken || !repo) return NextResponse.json({ code: 'not_configured' }, { status: 501 })

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, { auth: { persistSession: false } })
  const { data: u, error } = await client.auth.getUser(token)
  if (error || !u.user || (u.user.email || '').toLowerCase() !== (process.env.NEXT_PUBLIC_OWNER_EMAIL || '').toLowerCase()) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${branch}`, {
    headers: { Authorization: `Bearer ${ghToken}`, Accept: 'application/vnd.github.raw+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  if (!r.ok) return NextResponse.json({ error: `GitHub ${r.status}` }, { status: r.status === 404 ? 404 : 502 })
  const buf = Buffer.from(await r.arrayBuffer())
  const cache = { 'cache-control': 'private, max-age=86400' }

  if (!w) return new NextResponse(new Uint8Array(buf), { headers: { 'content-type': /\.png$/i.test(path) ? 'image/png' : 'image/jpeg', ...cache } })
  try {
    const out = await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer()
    return new NextResponse(new Uint8Array(out), { headers: { 'content-type': 'image/jpeg', ...cache } })
  } catch {
    return new NextResponse(new Uint8Array(buf), { headers: { 'content-type': /\.png$/i.test(path) ? 'image/png' : 'image/jpeg', ...cache } })
  }
}
