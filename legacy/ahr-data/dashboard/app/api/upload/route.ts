// Uploads one photo: commits the file to photos/<folder>/ in the private data repo and registers it in Media_Assets.
// Rules enforced here (photos/README.md): file name is <MA-id>_<english-slug>.<ext>; a photo already in the archive
// is refused (the old one stays, the new one is dropped); the caller must be the owner (Supabase token checked).
import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60

const FOLDERS = ['ahmed', 'people', 'events', 'works', 'press', 'misc']
const MAX_BYTES = 4_400_000 // Vercel functions accept ~4.5 MB request bodies
const HASHES = 'photos/_hashes.json' // original-file hash -> media_id, for photos that were re-encoded before saving


// The AI side of an upload (needs ANTHROPIC_API_KEY): from the Arabic description Ahmed typed it writes the Arabic and English
// title, links the people / works / events it recognises by adding their codes, writes the English description, picks the folder and
// a file name. Names follow the project's bilingual rule (phonetic for people and titles, descriptive words translated, official
// English names for institutions) using the spellings already in the archive. Any failure falls back to a plain record.
type Made = { title_ar: string; desc_ar: string; title_en: string; desc_en: string; folder: string; slug: string; ai: boolean }

async function enrich(client: SupabaseClient, descAr: string): Promise<Made> {
  const plain: Made = { title_ar: descAr.split(/[\n.،؛]/)[0].trim().slice(0, 80) || 'صورة', desc_ar: descAr, title_en: '', desc_en: '', folder: 'misc', slug: 'photo', ai: false }
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return plain
  try {
    const [pp, ww, ee, tc] = await Promise.all([
      client.from('person').select('person_id,name_ar,name_en_phonetic').range(0, 4999),
      client.from('works').select('work_id,title_ar,title_en').range(0, 4999),
      client.from('events').select('event_id,name,name_en').range(0, 4999),
      client.from('training_choir').select('id,item,item_en').range(0, 4999),
    ])
    const lines = (rows: unknown, id: string, a: string, b: string) =>
      ((rows || []) as Record<string, string>[]).filter((r) => r[id] && r[a]).map((r) => `${r[id]} | ${r[a]} | ${r[b] || ''}`).join('\n')
    const system =
      'You complete one photo record in a bilingual (Arabic/English) archive of the Egyptian composer Ahmed Hamdy Raouf. The user typed an Arabic description of the photo (who is in it and the details). ' +
      'Return JSON only: {"title_ar","desc_ar","title_en","desc_en","folder","slug"}.\n' +
      'desc_ar: keep the user text and every fact in it, but the archive names Ahmed in the third person, so replace first-person words (أنا، معايا، أنا والفنان...) with أحمد حمدي رؤوف; only add the archive code in parentheses right after each person, work, event or training item that clearly matches the glossary (example: الفنان علي الحجار (P-0007)). Never guess a code: if a name matches none or more than one entry, leave it without a code. ' +
      'If the text gives no place and/or no date, end with the matching sentence: "المكان والتاريخ لم يُسجَّلا." / "التاريخ لم يُسجَّل." / "المكان لم يُسجَّل.". Do not add any other fact.\n' +
      'title_ar: a short title in the archive style, under 90 characters, e.g. «أحمد مع علي الحجار وجمال بخيت – تسجيل «ع الرباب»», without codes.\n' +
      'title_en and desc_en: the English side. Names of people and titles of songs, works, films, plays, series and projects are written phonetically in Latin letters, never translated by meaning, and use exactly the English spellings from the glossary when the entry is there; descriptive words (concert, recording, opening, workshop, places, left/right) are translated; official institutions get their official English name; codes stay exactly as written; English titles use the dash " — " and curly quotes “ ” around work names; add nothing that is not in the Arabic.\n' +
      'folder: one of ahmed (Ahmed alone / personal), people (Ahmed with other people), events (concerts, shows, workshops, premieres, ceremonies), works (poster or artwork of a work), press (press, articles, interviews, TV), misc (logos, documents, anything else).\n' +
      'slug: 2-6 lowercase English words joined by dashes (letters, digits, dashes only) describing the photo.\n\n' +
      'PEOPLE (code | Arabic | English):\n' + lines(pp.data, 'person_id', 'name_ar', 'name_en_phonetic') +
      '\n\nWORKS (code | Arabic | English):\n' + lines(ww.data, 'work_id', 'title_ar', 'title_en') +
      '\n\nEVENTS (code | Arabic | English):\n' + lines(ee.data, 'event_id', 'name', 'name_en') +
      '\n\nTRAINING (code | Arabic | English):\n' + lines(tc.data, 'id', 'item', 'item_en')
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: descAr }],
      }),
      signal: AbortSignal.timeout(40000),
    })
    if (!r.ok) return plain
    const text = ((await r.json()) as { content: { type: string; text?: string }[] }).content.find((c) => c.type === 'text')?.text || ''
    const j = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) as Record<string, unknown>
    const g = (k: string) => String(j[k] ?? '').trim()
    const slug = g('slug').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
    return {
      title_ar: g('title_ar') || plain.title_ar,
      desc_ar: g('desc_ar') || descAr,
      title_en: g('title_en'),
      desc_en: g('desc_en'),
      folder: FOLDERS.includes(g('folder')) ? g('folder') : 'misc',
      slug: slug || 'photo',
      ai: true,
    }
  } catch {
    return plain
  }
}

export async function POST(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  const ghToken = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  if (!token) return NextResponse.json({ error: 'bad request' }, { status: 400 })
  if (!ghToken || !repo) return NextResponse.json({ code: 'not_configured', error: 'GitHub is not configured' }, { status: 501 })

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  })
  const { data: u, error: ue } = await client.auth.getUser(token)
  if (ue || !u.user || (u.user.email || '').toLowerCase() !== (process.env.NEXT_PUBLIC_OWNER_EMAIL || '').toLowerCase()) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'bad request' }, { status: 400 })
  const file = form.get('file')
  const str = (k: string) => String(form.get(k) ?? '').trim()
  const orig = str('orig').toLowerCase()
  const privacy = str('privacy') === 'داخلي' ? 'داخلي' : 'عام'
  const descIn = str('desc_ar')
  if (!(file instanceof Blob) || !/^[0-9a-f]{40}$/.test(orig) || !descIn) {
    return NextResponse.json({ error: 'bad fields' }, { status: 400 })
  }
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : ''
  if (!ext) return NextResponse.json({ error: 'type' }, { status: 415 })
  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.length > MAX_BYTES) return NextResponse.json({ error: 'too_big' }, { status: 413 })

  const gh = { Authorization: `Bearer ${ghToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
  const api = (p: string) => `https://api.github.com/repos/${repo}/${p}`

  // 1) duplicate check: the original file's git hash and the stored file's git hash, against everything under photos/
  const stored = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  const tree = await fetch(api(`git/trees/${branch}?recursive=1`), { headers: gh })
  if (!tree.ok) return NextResponse.json({ error: `GitHub ${tree.status}` }, { status: 502 })
  const entries = ((await tree.json()) as { tree: { path: string; sha: string }[] }).tree.filter((e) => e.path.startsWith('photos/'))
  const hit = entries.find((e) => e.sha === orig || e.sha === stored)
  const hashRes = await fetch(api(`contents/${HASHES}?ref=${branch}`), { headers: gh })
  let hashes: Record<string, string> = {}
  let hashesSha: string | undefined
  if (hashRes.ok) {
    const j = (await hashRes.json()) as { sha: string; content: string }
    hashesSha = j.sha
    try { hashes = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')) } catch { hashes = {} }
  }
  const dup = hit ? (hit.path.match(/(MA-\d+)_/) || [])[1] || hit.path : hashes[orig]
  if (dup) return NextResponse.json({ duplicate: true, existing: dup }, { status: 409 })

  // 2) English text + file name (automatic), next media id, then reserve it by inserting the row
  const en = await enrich(client, descIn)
  const folder = en.folder
  const slug = en.slug
  const { data: ids, error: ie } = await client.from('media_assets').select('media_id').range(0, 4999)
  if (ie) return NextResponse.json({ error: ie.message }, { status: 500 })
  // lowest free number: a gap left by a removed record is reused (decision 2026-11-10)
  const used = new Set((ids || []).map((r) => parseInt(String(r.media_id).replace(/\D/g, ''), 10) || 0))
  let next = 1
  while (used.has(next)) next++
  const mediaId = `MA-${String(next).padStart(4, '0')}`
  const path = `photos/${folder}/${mediaId}_${slug}.${ext}`
  const day = new Date().toLocaleDateString('sv', { timeZone: 'Africa/Cairo' })
  const row = {
    media_id: mediaId,
    platform_or_asset: en.title_ar,
    category: 'صورة',
    description: en.desc_ar,
    link: path,
    status: 'Active',
    privacy,
    source: `رفع من اللوحة ${day}`,
    platform_or_asset_en: en.title_en,
    category_en: 'Photo',
    description_en: en.desc_en,
    source_en: `Uploaded from the dashboard ${day}`,
    privacy_en: privacy === 'داخلي' ? 'Internal' : 'Public',
  }
  const ins = await client.from('media_assets').insert(row)
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 })

  // 3) commit the photo; if that fails, release the reserved row so nothing points at a missing file
  const put = await fetch(api(`contents/${path}`), {
    method: 'PUT',
    headers: { ...gh, 'content-type': 'application/json' },
    body: JSON.stringify({ message: `Photo: add ${mediaId} (${folder})`, content: bytes.toString('base64'), branch }),
  })
  if (!put.ok) {
    await client.from('media_assets').delete().eq('media_id', mediaId)
    return NextResponse.json({ error: `GitHub ${put.status}` }, { status: 502 })
  }

  // 4) remember the original's hash so sending the same photo again is caught even if it was re-encoded
  hashes[orig] = mediaId
  await fetch(api(`contents/${HASHES}`), {
    method: 'PUT',
    headers: { ...gh, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `Photo: record original hash for ${mediaId}`,
      content: Buffer.from(JSON.stringify(hashes, null, 1) + '\n', 'utf8').toString('base64'),
      branch,
      sha: hashesSha,
    }),
  }).catch(() => null)

  return NextResponse.json({ ok: true, media_id: mediaId, path, row, ai: en.ai })
}
