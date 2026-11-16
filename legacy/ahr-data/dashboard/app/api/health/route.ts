// Lists the photo files that exist in the private data repo, so the dashboard can compare them with Media_Assets.
import { NextResponse } from 'next/server'
import { ownerClient } from '@/lib/owner'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const o = await ownerClient(req)
  if (o.fail) return o.fail
  const ghToken = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!ghToken || !repo) return NextResponse.json({ code: 'not_configured', error: 'GitHub is not configured' }, { status: 501 })
  const r = await fetch(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`, {
    headers: { Authorization: `Bearer ${ghToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  if (!r.ok) return NextResponse.json({ error: `GitHub ${r.status}` }, { status: 502 })
  const tree = ((await r.json()) as { tree: { path: string; type: string }[] }).tree
  const photos = tree.filter((e) => e.type === 'blob' && /^photos\/[a-z]+\/.+\.(jpg|jpeg|png)$/i.test(e.path)).map((e) => e.path)
  return NextResponse.json({ photos })
}
