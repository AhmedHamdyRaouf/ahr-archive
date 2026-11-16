'use client'
// Clickable code chips (for codes written inside a text) and the "related records" panel of an open record.
import { SCHEMA } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, Row, s, titleOf, tableLabel } from '@/lib/meta'
import type { Graph } from '@/lib/refs'

const rowOf = (data: Data, table: string, pk: string): Row | undefined => {
  const def = SCHEMA.find((x) => x.t === table)
  return def ? (data[table] || []).find((r) => s(r[def.pk]) === pk) : undefined
}

export function Chips({ codes, graph, data, lang, onOpen }: { codes: string[]; graph: Graph; data: Data; lang: Lang; onOpen: (t: string, pk: string) => void }) {
  if (!codes.length) return null
  return (
    <div className="chips">
      {codes.map((c) => {
        const ref = graph.exists.get(c)
        if (!ref) return <span key={c} className="chip bad">{c} — {t('missingCode', lang)}</span>
        return <button key={c} className="chip" onClick={() => onOpen(ref.t, ref.pk)}>{c} {titleOf(ref.t, rowOf(data, ref.t, ref.pk), lang)}</button>
      })}
    </div>
  )
}

export function Related({ table, row, graph, data, lang, onOpen }: { table: string; row: Row; graph: Graph; data: Data; lang: Lang; onOpen: (t: string, pk: string) => void }) {
  const def = SCHEMA.find((x) => x.t === table)
  if (!def) return null
  const pk = s(row[def.pk])
  const refs = graph.inn.get(pk) || []
  const groups = new Map<string, string[]>()
  for (const r of refs) groups.set(r.t, [...(groups.get(r.t) || []), r.pk])
  // people <-> works through credits
  const via = (otherCol: string, otherTable: string) => {
    const ids = new Set<string>()
    for (const c of refs.filter((x) => x.t === 'credits')) {
      const cr = rowOf(data, 'credits', c.pk)
      const v = cr ? s(cr[otherCol]) : ''
      if (v && graph.exists.get(v)?.t === otherTable) ids.add(v)
    }
    return Array.from(ids).sort()
  }
  const extra: { key: string; label: string; table: string; ids: string[] }[] = []
  if (table === 'person') extra.push({ key: 'w', label: t('relWorks', lang), table: 'works', ids: via('work_id', 'works') })
  if (table === 'works') extra.push({ key: 'p', label: t('relPeople', lang), table: 'person', ids: via('person_id', 'person') })
  const list = (tb: string, ids: string[]) =>
    ids.map((id) => (
      <div key={tb + id} className="it" onClick={() => onOpen(tb, id)}>
        <span className="id">{id}</span><span className="tt">{titleOf(tb, rowOf(data, tb, id), lang)}</span>
      </div>
    ))
  const empty = !groups.size && extra.every((e) => !e.ids.length)
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="grp">🔗 {t('related', lang)}</div>
      {empty && <div className="status" style={{ padding: 0 }}>{t('relNone', lang)}</div>}
      {extra.filter((e) => e.ids.length).map((e) => (
        <div key={e.key}><div className="status" style={{ padding: '4px 0' }}>{e.label} ({e.ids.length})</div>{list(e.table, e.ids)}</div>
      ))}
      {Array.from(groups.entries()).map(([tb, ids]) => (
        <div key={tb}><div className="status" style={{ padding: '4px 0' }}>{tableLabel(tb, lang)} ({ids.length})</div>{list(tb, ids.sort())}</div>
      ))}
    </div>
  )
}
