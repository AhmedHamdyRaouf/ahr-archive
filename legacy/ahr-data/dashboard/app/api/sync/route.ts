// Copies one table to the private data repo as data/csv/<Table>.csv after every save.
// Auth: the caller must send the owner's Supabase access token; the rows are read with that
// same token, so the database policies decide what is visible (nothing else is trusted).
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SCHEMA } from '@/lib/schema'

const FILE: Record<string, string> = {
  works: 'Works', credits: 'Credits', person: 'Person', events: 'Events', awards: 'Awards', press: 'Press', sources: 'Sources',
  media_assets: 'Media_Assets', life_story: 'Life_Story', training_choir: 'Training_Choir', roles_education: 'Roles_Education',
  press_links: 'Press_Links', review_queue: 'Review_Queue', audience_voices: 'Audience_Voices', youtube_videos: 'YouTube_Videos', project_items: 'Project_Items', site_texts: 'Site_Texts', contact_channels: 'Contact_Channels', work_relationship: 'Work_Relationship', ref_relationship_type: 'Ref_Relationship_Type',
}

const cell = (v: unknown) => {
  const x = v === null || v === undefined ? '' : String(v)
  return /[",\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x
}

export async function POST(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const { table } = (await req.json().catch(() => ({}))) as { table?: string }
  const def = SCHEMA.find((x) => x.t === table)
  if (!token || !def) return NextResponse.json({ error: 'bad request' }, { status: 400 })

  const ghToken = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!ghToken || !repo) return NextResponse.json({ code: 'not_configured', error: 'GitHub is not configured' }, { status: 501 })

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })
  const { data: u, error: ue } = await client.auth.getUser(token)
  if (ue || !u.user || (u.user.email || '').toLowerCase() !== (process.env.NEXT_PUBLIC_OWNER_EMAIL || '').toLowerCase()) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { data: rows, error } = await client.from(def.t).select('*').range(0, 4999)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const list = (rows || []) as Record<string, unknown>[]
  // the relationship-type reference list keeps its own sort_order in the copy
  if (def.t === 'ref_relationship_type') list.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
  else list.sort((a, b) => (def.pk === 'row_id' ? Number(a.row_id) - Number(b.row_id) : String(a[def.pk]) < String(b[def.pk]) ? -1 : 1))

  // Review_Queue is stored without its row_id column (the file order is the row order).
  const cols = def.t === 'review_queue' ? def.cols.filter((c) => c !== 'row_id') : def.cols
  const csv = '﻿' + [cols.map(cell).join(','), ...list.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n') + '\r\n'

  const path = `data/csv/${FILE[def.t]}.csv`
  const api = `https://api.github.com/repos/${repo}/contents/${path}`
  const gh = { Authorization: `Bearer ${ghToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  const cur = await fetch(`${api}?ref=${branch}`, { headers: gh })
  const sha = cur.ok ? ((await cur.json()) as { sha: string }).sha : undefined
  const put = await fetch(api, {
    method: 'PUT',
    headers: { ...gh, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `Dashboard: update ${FILE[def.t]} (${list.length} rows)`,
      content: Buffer.from(csv, 'utf8').toString('base64'),
      branch,
      sha,
    }),
  })
  if (!put.ok) return NextResponse.json({ error: `GitHub ${put.status}` }, { status: 502 })
  return NextResponse.json({ ok: true, rows: list.length })
}
