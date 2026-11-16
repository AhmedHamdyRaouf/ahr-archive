'use client'
// Bulk fill of missing English fields: finds Arabic text with a blank English side, asks /api/translate in small batches,
// and shows every proposal for review. Nothing is saved until the owner presses save.
import { useMemo, useState } from 'react'
import { SCHEMA } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, Row, s, tableLabel } from '@/lib/meta'

type Miss = { key: string; t: string; pk: string; c: string; e: string; ar: string }
type Prop = Miss & { en: string; on: boolean }
export type Patch = { t: string; pk: string | number; patch: Row }

const hasAr = (v: string) => /[؀-ۿ]/.test(v)

export default function Translate({ lang, data, token, onSave }: { lang: Lang; data: Data; token: string; onSave: (p: Patch[]) => Promise<string> }) {
  const [tbl, setTbl] = useState('')
  const [props, setProps] = useState<Prop[]>([])
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  const missing: Miss[] = useMemo(() => {
    const out: Miss[] = []
    for (const x of SCHEMA) {
      for (const f of x.fields) {
        if (!f.e || f.c === x.pk) continue
        for (const r of data[x.t] || []) {
          const ar = s(r[f.c]).trim()
          if (ar && hasAr(ar) && s(r[f.e]).trim() === '') out.push({ key: `${x.t}|${r[x.pk]}|${f.c}`, t: x.t, pk: s(r[x.pk]), c: f.c, e: f.e, ar })
        }
      }
    }
    return out
  }, [data])

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    missing.forEach((x) => m.set(x.t, (m.get(x.t) || 0) + 1))
    return m
  }, [missing])

  async function run() {
    setNote(''); setBusy(true)
    const have = new Set(props.map((p) => p.key))
    const todo = missing.filter((m) => (!tbl || m.t === tbl) && !have.has(m.key)).slice(0, 45)
    for (let i = 0; i < todo.length; i += 15) {
      const chunk = todo.slice(i, i + 15)
      try {
        const r = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
          body: JSON.stringify({ items: chunk.map((m) => ({ id: m.key, ar: m.ar, col: m.c, table: m.t })) }),
        })
        const j = (await r.json().catch(() => ({}))) as { out?: Record<string, string>; code?: string; error?: string }
        if (!r.ok) { setNote(j.code === 'no_ai' ? t('trNoAi', lang) : `${t('error', lang)}: ${j.error || r.status}`); break }
        const out = j.out || {}
        setProps((p) => [...p, ...chunk.filter((m) => out[m.key]).map((m) => ({ ...m, en: out[m.key], on: true }))])
      } catch { setNote(t('error', lang)); break }
    }
    setBusy(false)
  }

  async function save() {
    const chosen = props.filter((p) => p.on && p.en.trim())
    const by = new Map<string, Patch>()
    for (const p of chosen) {
      const k = `${p.t}|${p.pk}`
      const cur = by.get(k) || { t: p.t, pk: p.pk, patch: {} }
      cur.patch[p.e] = p.en.trim()
      by.set(k, cur)
    }
    setBusy(true)
    const err = await onSave(Array.from(by.values()))
    setBusy(false)
    if (err) { setNote(`${t('error', lang)}: ${err}`); return }
    const done = new Set(chosen.map((p) => p.key))
    setProps((p) => p.filter((x) => !done.has(x.key)))
    setNote(t('trSaved', lang))
  }

  return (
    <div className="pane">
      <h3 style={{ margin: 0 }}>{t('trTitle', lang)}</h3>
      <div className="status" style={{ padding: 0 }}>{t('trHint', lang)}</div>
      {missing.length === 0 && <div className="ok">{t('trNone', lang)}</div>}
      {missing.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={tbl} onChange={(e) => setTbl(e.target.value)} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 8, background: 'var(--card)' }}>
            <option value="">{t('all', lang)} ({missing.length})</option>
            {Array.from(counts.entries()).map(([k, n]) => <option key={k} value={k}>{tableLabel(k, lang)} ({n})</option>)}
          </select>
          <button className="btn pri" disabled={busy} onClick={run}>{busy ? t('trBusy', lang) : t('trStart', lang)}</button>
        </div>
      )}
      {note && <div className={note === t('trSaved', lang) ? 'ok' : 'err'}>{note}</div>}
      {props.map((p, i) => (
        <div key={p.key} className="qi">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <input type="checkbox" checked={p.on} onChange={(e) => setProps(props.map((x, j) => (j === i ? { ...x, on: e.target.checked } : x)))} />
            <b>{p.pk}</b> · {p.c}
          </label>
          <div className="status" style={{ padding: '4px 0', whiteSpace: 'pre-wrap' }}>{p.ar}</div>
          <textarea style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: 8 }} dir="ltr" rows={p.en.length > 80 ? 4 : 2} value={p.en} onChange={(e) => setProps(props.map((x, j) => (j === i ? { ...x, en: e.target.value } : x)))} />
        </div>
      ))}
      {props.length > 0 && <div><button className="btn pri" disabled={busy} onClick={save}>{t('trSave', lang)} ({props.filter((p) => p.on).length})</button></div>}
    </div>
  )
}
