// The dashboard assistant: a chat with Claude that can read the whole archive (through the owner's own session, so RLS applies) and PROPOSE changes.
// Nothing is saved here. Proposals go back to the dashboard, which shows them and applies them only when the owner taps "apply".
import { NextResponse } from 'next/server'
import { ownerClient } from '@/lib/owner'
import { SCHEMA } from '@/lib/schema'

export const runtime = 'nodejs'
export const maxDuration = 60

type Msg = { role: 'user' | 'assistant'; content: string }
type Change = { kind: 'update' | 'insert'; table: string; pk?: string; fields: Record<string, string> }
type Block = { type: string; id?: string; name?: string; input?: Record<string, unknown>; text?: string }

const SYSTEM = `You are the assistant inside the private dashboard of the Egyptian composer Ahmed Hamdy Raouf. He talks to you the way he would talk to a colleague: you answer from the archive data and, when he asks, prepare changes to it.
Reply in the language he writes in (usually Egyptian Arabic), short and direct, suitable for a phone screen. Do the work first; ask at most one short question and only when you truly cannot proceed. Never invent data: if the archive does not say it, say so. Use the tools to look things up before answering; do not answer data questions from memory.
You never save anything yourself. To change the archive call propose_changes with exact field values; the owner reviews and taps apply. Propose only what he asked for. Use column names exactly as list_schema gives them (the English twin of an Arabic column ends with _en). Leave the primary key out of "insert" (the dashboard gives the lowest free code).
House rules: titles of songs, works, films, series, plays and projects are written phonetically in each language and never translated by meaning (English: Latin letters; spell like the existing records). Never state a total number of works. Use "Voice Coach", never "Vocal Coach". AHR division names stay in English. The Egyptian authors' society is SACERAU. He was born in Alexandria. Never put an ID-card number, syndicate membership number, personal mobile number or home address anywhere. Do not touch records whose privacy starts with داخلي or أقصى unless he explicitly asks, and never lower a record's privacy. Never set publish to نعم unless he asks.`

const TOOLS = [
  { name: 'list_schema', description: 'List every table with its primary key, record-code prefix and column names.', input_schema: { type: 'object', properties: {} } },
  { name: 'find', description: 'Find rows in one table. Optional free-text search over all columns, and optional exact filters (use "__blank__" to match empty cells). Returns at most `limit` rows (default 20, max 40) with long values shortened.', input_schema: { type: 'object', properties: { table: { type: 'string' }, text: { type: 'string' }, where: { type: 'object', additionalProperties: { type: 'string' } }, limit: { type: 'number' } }, required: ['table'] } },
  { name: 'get', description: 'Get one full row by primary key.', input_schema: { type: 'object', properties: { table: { type: 'string' }, pk: { type: 'string' } }, required: ['table', 'pk'] } },
  { name: 'count_blank', description: 'Count rows where a column is blank, and list the first 40 primary keys.', input_schema: { type: 'object', properties: { table: { type: 'string' }, column: { type: 'string' } }, required: ['table', 'column'] } },
  { name: 'propose_changes', description: 'Prepare changes for the owner to review and apply. kind "update" needs pk and only the fields to change; kind "insert" needs the fields of the new row.', input_schema: { type: 'object', properties: { summary: { type: 'string' }, changes: { type: 'array', items: { type: 'object', properties: { kind: { type: 'string', enum: ['update', 'insert'] }, table: { type: 'string' }, pk: { type: 'string' }, fields: { type: 'object', additionalProperties: { type: 'string' } } }, required: ['kind', 'table', 'fields'] } } }, required: ['summary', 'changes'] } },
]

export async function POST(req: Request) {
  const o = await ownerClient(req)
  if (o.fail) return o.fail
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return NextResponse.json({ code: 'no_ai', error: 'ANTHROPIC_API_KEY is not set' }, { status: 501 })
  const { messages } = (await req.json().catch(() => ({}))) as { messages?: Msg[] }
  if (!Array.isArray(messages) || !messages.length || messages[messages.length - 1].role !== 'user') return NextResponse.json({ error: 'bad request' }, { status: 400 })
  const hist: unknown[] = messages.slice(-20).map((m) => ({ role: m.role, content: String(m.content).slice(0, 8000) }))

  const cache = new Map<string, Record<string, unknown>[]>()
  const rowsOf = async (t: string) => {
    if (!cache.has(t)) {
      const { data } = await o.client.from(t).select('*').range(0, 4999)
      cache.set(t, (data || []) as Record<string, unknown>[])
    }
    return cache.get(t) as Record<string, unknown>[]
  }
  const short = (r: Record<string, unknown>) => Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null && v !== '').map(([k, v]) => [k, String(v).length > 300 ? String(v).slice(0, 300) + '…' : v]))
  const def = (t: unknown) => SCHEMA.find((x) => x.t === t)
  const proposals: { summary: string; changes: Change[] }[] = []

  async function run(name: string, inp: Record<string, unknown>): Promise<unknown> {
    if (name === 'list_schema') return SCHEMA.map((x) => ({ table: x.t, label: x.en, pk: x.pk, prefix: x.prefix, columns: x.cols }))
    if (name === 'propose_changes') {
      const list = Array.isArray(inp.changes) ? (inp.changes as Change[]) : []
      const ok: Change[] = []
      for (const c of list) {
        const d = def(c.table)
        if (!d || !c.fields || (c.kind !== 'update' && c.kind !== 'insert')) return { error: `bad change for table ${String(c.table)}` }
        if (c.kind === 'update') {
          const row = (await rowsOf(d.t)).find((r) => String(r[d.pk]) === String(c.pk))
          if (!row) return { error: `${d.t} ${String(c.pk)} not found` }
        }
        const fields = Object.fromEntries(Object.entries(c.fields).filter(([k]) => d.cols.includes(k) && k !== d.pk).map(([k, v]) => [k, String(v)]))
        ok.push({ kind: c.kind, table: d.t, pk: c.pk, fields })
      }
      proposals.push({ summary: String(inp.summary || ''), changes: ok })
      return { ok: true, note: 'Shown to the owner for approval. Nothing is saved until he taps apply.' }
    }
    const d = def(inp.table)
    if (!d) return { error: 'unknown table' }
    const rows = await rowsOf(d.t)
    if (name === 'get') {
      const r = rows.find((x) => String(x[d.pk]) === String(inp.pk))
      return r ? r : { error: 'not found' }
    }
    if (name === 'count_blank') {
      const col = String(inp.column)
      if (!d.cols.includes(col)) return { error: 'unknown column' }
      const b = rows.filter((r) => String(r[col] ?? '').trim() === '')
      return { count: b.length, first: b.slice(0, 40).map((r) => r[d.pk]) }
    }
    if (name === 'find') {
      const text = String(inp.text || '').trim().toLowerCase()
      const where = (inp.where || {}) as Record<string, string>
      const lim = Math.min(Number(inp.limit) || 20, 40)
      const hit = rows.filter((r) => {
        for (const [c, v] of Object.entries(where)) {
          const cur = String(r[c] ?? '').trim()
          if (v === '__blank__' ? cur !== '' : cur !== v) return false
        }
        return !text || Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(text))
      })
      return { matches: hit.length, rows: hit.slice(0, lim).map(short) }
    }
    return { error: 'unknown tool' }
  }

  const t0 = Date.now()
  let reply = ''
  for (let turn = 0; turn < 10; turn++) {
    if (Date.now() - t0 > 48000) { reply = reply || '(الوقت خلص قبل ما أكمل. اسألني تاني بشكل أصغر.)'; break }
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 4000, system: SYSTEM, tools: TOOLS, messages: hist }),
      signal: AbortSignal.timeout(Math.max(5000, 55000 - (Date.now() - t0))),
    }).catch(() => null)
    if (!r || !r.ok) return NextResponse.json({ error: 'ai_failed' }, { status: 502 })
    const j = (await r.json()) as { content: Block[]; stop_reason: string }
    hist.push({ role: 'assistant', content: j.content })
    const uses = j.content.filter((b) => b.type === 'tool_use')
    reply = j.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim() || reply
    if (j.stop_reason !== 'tool_use' || !uses.length) break
    const results = []
    for (const u of uses) {
      let out: unknown
      try { out = await run(String(u.name), u.input || {}) } catch { out = { error: 'tool failed' } }
      results.push({ type: 'tool_result', tool_use_id: u.id, content: JSON.stringify(out).slice(0, 60000) })
    }
    hist.push({ role: 'user', content: results })
  }
  return NextResponse.json({ reply, proposals })
}
