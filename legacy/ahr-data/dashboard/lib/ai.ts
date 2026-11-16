// Anthropic helpers for server routes: the archive glossary (code | Arabic | English) and a JSON-returning call.
import type { SupabaseClient } from '@supabase/supabase-js'

export async function glossary(client: SupabaseClient): Promise<string> {
  const [pp, ww, ee, tc] = await Promise.all([
    client.from('person').select('person_id,name_ar,name_en_phonetic').range(0, 4999),
    client.from('works').select('work_id,title_ar,title_en').range(0, 4999),
    client.from('events').select('event_id,name,name_en').range(0, 4999),
    client.from('training_choir').select('id,item,item_en').range(0, 4999),
  ])
  const lines = (rows: unknown, id: string, a: string, b: string) =>
    ((rows || []) as Record<string, string>[]).filter((r) => r[id] && r[a]).map((r) => `${r[id]} | ${r[a]} | ${r[b] || ''}`).join('\n')
  return (
    'PEOPLE (code | Arabic | English):\n' + lines(pp.data, 'person_id', 'name_ar', 'name_en_phonetic') +
    '\n\nWORKS (code | Arabic | English):\n' + lines(ww.data, 'work_id', 'title_ar', 'title_en') +
    '\n\nEVENTS (code | Arabic | English):\n' + lines(ee.data, 'event_id', 'name', 'name_en') +
    '\n\nTRAINING (code | Arabic | English):\n' + lines(tc.data, 'id', 'item', 'item_en')
  )
}

export async function claudeJson(system: string, user: string, maxTokens: number): Promise<Record<string, unknown> | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
    signal: AbortSignal.timeout(55000),
  })
  if (!r.ok) return null
  const text = ((await r.json()) as { content: { type: string; text?: string }[] }).content.find((c) => c.type === 'text')?.text || ''
  try { return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) } catch { return null }
}
