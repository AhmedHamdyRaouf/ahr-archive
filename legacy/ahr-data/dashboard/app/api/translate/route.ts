// Writes the missing English side of Arabic text fields. Nothing is saved here: the dashboard shows the result for review first.
import { NextResponse } from 'next/server'
import { ownerClient } from '@/lib/owner'
import { glossary, claudeJson } from '@/lib/ai'

export const runtime = 'nodejs'
export const maxDuration = 60

type Item = { id: string; ar: string; col: string; table: string }

export async function POST(req: Request) {
  const o = await ownerClient(req)
  if (o.fail) return o.fail
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ code: 'no_ai', error: 'ANTHROPIC_API_KEY is not set' }, { status: 501 })
  const { items } = (await req.json().catch(() => ({}))) as { items?: Item[] }
  if (!Array.isArray(items) || !items.length || items.length > 25) return NextResponse.json({ error: 'bad request' }, { status: 400 })
  const system =
    'You write the English side of a bilingual (Arabic/English) archive of the Egyptian composer Ahmed Hamdy Raouf. ' +
    'Input: a JSON array of {id, table, col, ar}. Return JSON only: an object mapping each id to the English text of its "ar" value.\n' +
    'Rules: names of people and titles of songs, works, films, plays, series and projects are written phonetically in Latin letters, never translated by meaning, and use exactly the English spellings in the glossary when the entry is there; ' +
    'descriptive words are translated; official institutions get their official English name; foreign names written in Arabic letters get their known Latin spelling; ' +
    'archive codes (P-0007, W-0012 ...), numbers, dates, URLs and file paths stay exactly as written; keep the same facts and the same sentence structure, add nothing; ' +
    'the archive names Ahmed in the third person (Ahmed Hamdy Raouf); English titles use the dash " — " and curly quotes “ ” around work names; if a value is already Latin text, copy it unchanged.\n\n' +
    (await glossary(o.client))
  const out = await claudeJson(system, JSON.stringify(items), 6000)
  if (!out) return NextResponse.json({ error: 'ai_failed' }, { status: 502 })
  const res: Record<string, string> = {}
  for (const it of items) if (typeof out[it.id] === 'string' && (out[it.id] as string).trim()) res[it.id] = (out[it.id] as string).trim()
  return NextResponse.json({ out: res })
}
