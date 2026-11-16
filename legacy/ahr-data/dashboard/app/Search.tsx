'use client'
// Cross-table search: one box, every table. Arabic is normalised so spelling variants still match.
import { useMemo, useState } from 'react'
import { SCHEMA } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, s, titleOf, tableLabel, levelOf } from '@/lib/meta'

export const norm = (v: string) =>
  v.toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')

const LIMIT = 80

export default function Search({ lang, data, q, onOpen }: { lang: Lang; data: Data; q: string; onOpen: (t: string, pk: string) => void }) {
  const index = useMemo(
    () => SCHEMA.map((x) => ({ x, rows: (data[x.t] || []).map((r) => ({ r, k: norm(x.cols.map((c) => s(r[c])).join(' \u0001 ')) })) })),
    [data],
  )
  const words = norm(q.trim()).split(/\s+/).filter(Boolean)
  const res = useMemo(() => {
    if (!words.length) return { list: [] as { t: string; pk: string; title: string; hit: string; lock: boolean }[], more: false }
    const list: { t: string; pk: string; title: string; hit: string; lock: boolean }[] = []
    let more = false
    for (const { x, rows } of index) {
      for (const { r, k } of rows) {
        if (!words.every((w) => k.includes(w))) continue
        if (list.length >= LIMIT) { more = true; break }
        const lv = levelOf(r.privacy)
        // show the column where the first word matched, to make clear why a row came up
        const col = x.cols.find((c) => c !== x.pk && norm(s(r[c])).includes(words[0])) || ''
        const val = s(r[col])
        const at = Math.max(0, norm(val).indexOf(words[0]) - 25)
        list.push({ t: x.t, pk: s(r[x.pk]), title: titleOf(x.t, r, lang), hit: col && col !== 'title' ? val.slice(at, at + 90) : '', lock: lv === 'int' || lv === 'max' })
      }
      if (more) break
    }
    return { list, more }
  }, [index, q, lang]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="pane">
      <div className="status" style={{ padding: '6px 0' }}>{t('seHint', lang)}</div>
      {words.length > 0 && res.list.length === 0 && <div className="status">{t('seNone', lang)}</div>}
      {res.list.map((h) => (
        <div key={h.t + h.pk} className="row" onClick={() => onOpen(h.t, h.pk)}>
          <div className="rt">
            <div className="id">{h.pk} · {tableLabel(h.t, lang)}{h.lock ? ' 🔒' : ''}</div>
            <div className="tt">{h.title || '—'}</div>
            {h.hit && <div className="st">{h.hit}</div>}
          </div>
        </div>
      ))}
      {res.more && <div className="status">{t('seMore', lang)}</div>}
    </div>
  )
}
