'use client'
// Merge two records of the same table: keep one, fill its empty fields from the other, rewrite every written code of the
// other record to the kept one (in every table), then delete the other. Every step is logged in History.
import { useMemo, useState } from 'react'
import { sb } from '@/lib/supabase'
import { SCHEMA, LABELS_AR } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, Row, s, titleOf, tableLabel } from '@/lib/meta'
import type { Graph } from '@/lib/refs'

const humanize = (c: string) => c.replace(/_en$/, '').replace(/_/g, ' ').replace(/^\w/, (x) => x.toUpperCase())
const labelOf = (c: string, l: Lang) => (l === 'ar' ? LABELS_AR[c] || humanize(c) : humanize(c))
const esc = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default function Merge({ lang, table, row, data, graph, onClose, onDone }: { lang: Lang; table: string; row: Row; data: Data; graph: Graph; onClose: () => void; onDone: (tables: string[]) => void }) {
  const def = SCHEMA.find((x) => x.t === table)!
  const [otherPk, setOtherPk] = useState('')
  const [swap, setSwap] = useState(false)
  const [pickSide, setPickSide] = useState<Record<string, 'keep' | 'drop'>>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  const mine = s(row[def.pk])
  const options = useMemo(() => {
    const n = q.trim().toLowerCase()
    return (data[table] || []).filter((r) => s(r[def.pk]) !== mine && (!n || def.cols.some((c) => s(r[c]).toLowerCase().includes(n)))).slice(0, 60)
  }, [data, table, mine, q, def])
  const other = otherPk ? (data[table] || []).find((r) => s(r[def.pk]) === otherPk) : undefined
  const keepRow = other ? (swap ? other : row) : row
  const dropRow = other ? (swap ? row : other) : undefined
  const keepCode = s(keepRow[def.pk])
  const dropCode = dropRow ? s(dropRow[def.pk]) : ''

  const cols = def.cols.filter((c) => c !== def.pk)
  const conflicts = dropRow ? cols.filter((c) => s(keepRow[c]).trim() && s(dropRow[c]).trim() && s(keepRow[c]).trim() !== s(dropRow[c]).trim()) : []
  const fills = dropRow ? cols.filter((c) => !s(keepRow[c]).trim() && s(dropRow[c]).trim()) : []
  const refs = dropRow ? (graph.inn.get(dropCode) || []).filter((r) => !(r.t === table && r.pk === keepCode)) : []

  async function go() {
    if (!dropRow || !window.confirm(t('mgWarn', lang))) return
    setBusy(true); setErr('')
    const re = new RegExp(`(^|[^A-Z0-9-])${esc(dropCode)}(?!\\d)`, 'g')
    // 1) the kept record: its own values, empty fields filled, conflicts as chosen
    const merged: Row = { ...keepRow }
    for (const c of fills) merged[c] = dropRow[c]
    for (const c of conflicts) if (pickSide[c] === 'drop') merged[c] = dropRow[c]
    const touched = new Set<string>([table])
    const keepPatch: Row = {}
    for (const c of cols) {
      const v = s(merged[c]).replace(re, `$1${keepCode}`)
      if (v !== s(keepRow[c])) keepPatch[c] = v
    }
    if (Object.keys(keepPatch).length) {
      const r = await sb().from(table).update(keepPatch).eq(def.pk, keepCode)
      if (r.error) { setErr(r.error.message); setBusy(false); return }
    }
    // 2) every other record that mentions the removed code now mentions the kept one
    for (const ref of refs) {
      if (ref.t === table && ref.pk === dropCode) continue
      const d2 = SCHEMA.find((x) => x.t === ref.t)!
      const cur = (data[ref.t] || []).find((r) => s(r[d2.pk]) === ref.pk)
      if (!cur) continue
      const patch: Row = {}
      for (const c of d2.cols) {
        if (c === d2.pk) continue
        const v = s(cur[c])
        if (v && re.test(v)) patch[c] = v.replace(re, `$1${keepCode}`)
        re.lastIndex = 0
      }
      if (!Object.keys(patch).length) continue
      const r = await sb().from(ref.t).update(patch).eq(d2.pk, ref.pk)
      if (r.error) { setErr(`${ref.t} ${ref.pk}: ${r.error.message}`); setBusy(false); onDone(Array.from(touched)); return }
      touched.add(ref.t)
    }
    // 3) the removed record
    const del = await sb().from(table).delete().eq(def.pk, dropCode)
    if (del.error) { setErr(del.error.message); setBusy(false); onDone(Array.from(touched)); return }
    setBusy(false)
    onDone(Array.from(touched))
  }

  const name = (r: Row) => `${s(r[def.pk])} — ${titleOf(table, r, lang)}`
  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{t('mgTitle', lang)} — {tableLabel(table, lang)}</h3>
        <div className="f">
          <label>{t('mgPick', lang)}</label>
          <input value={q} placeholder={t('search', lang)} onChange={(e) => setQ(e.target.value)} />
          <select value={otherPk} onChange={(e) => { setOtherPk(e.target.value); setSwap(false); setPickSide({}) }}>
            <option value="">—</option>
            {options.map((r) => <option key={s(r[def.pk])} value={s(r[def.pk])}>{name(r)}</option>)}
          </select>
        </div>
        {dropRow && (
          <>
            <div className="qi">
              <div><b>{t('mgKeep', lang)}:</b> {name(keepRow)}</div>
              <div><b>{t('mgDrop', lang)}:</b> {name(dropRow)}</div>
              <button className="btn" style={{ marginTop: 6 }} onClick={() => { setSwap(!swap); setPickSide({}) }}>{t('mgSwap', lang)}</button>
            </div>
            {conflicts.length === 0 && fills.length === 0 && <div className="status">{t('mgSame', lang)}</div>}
            {conflicts.length > 0 && <div className="grp">{t('mgConf', lang)}</div>}
            {conflicts.map((c) => (
              <div key={c} className="f">
                <label>{labelOf(c, lang)}{c.endsWith('_en') ? ' (EN)' : ''}</label>
                {(['keep', 'drop'] as const).map((side) => {
                  const v = s((side === 'keep' ? keepRow : dropRow)[c])
                  const on = (pickSide[c] || 'keep') === side
                  return (
                    <div key={side} className="qi" style={{ cursor: 'pointer', outline: on ? '2px solid #7a5c2e' : 'none' }} onClick={() => setPickSide({ ...pickSide, [c]: side })}>
                      {on ? '● ' : '○ '}{v.length > 200 ? v.slice(0, 200) + '…' : v}
                    </div>
                  )
                })}
              </div>
            ))}
            {fills.length > 0 && <div className="grp">{t('mgFill', lang)}: {fills.map((c) => labelOf(c, lang)).join('، ')}</div>}
            <div className="grp">{t('mgRefs', lang)}: {refs.length}</div>
            <div className="status" style={{ padding: 0 }}>{Array.from(new Set(refs.map((r) => r.t))).map((x) => `${tableLabel(x, lang)} (${refs.filter((r) => r.t === x).length})`).join(' · ')}</div>
          </>
        )}
        {err && <div className="err">{err}</div>}
        <div className="acts">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn pri" disabled={!dropRow || busy} onClick={go}>{t('mgGo', lang)}</button>
            <button className="btn" onClick={onClose}>{t('cancel', lang)}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
