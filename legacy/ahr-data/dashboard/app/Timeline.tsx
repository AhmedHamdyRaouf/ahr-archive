'use client'
// Career timeline: every record that carries a recognisable year, grouped by year across the tables.
import { useMemo, useState } from 'react'
import { SCHEMA } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, s, titleOf, tableLabel, levelOf } from '@/lib/meta'

// which column holds the date text of each table
const YEAR_COLS: Record<string, string[]> = {
  works: ['year_as_stated'], events: ['date_as_stated'], awards: ['year'], press: ['date_as_stated'], life_story: ['period'],
  roles_education: ['period'], training_choir: ['period'], youtube_videos: ['date_as_stated'], press_links: ['period'], project_items: ['date_as_stated'],
}

const digits = (v: string) => v.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
export const yearsOf = (v: string): number[] => Array.from(new Set((digits(v).match(/\b(?:19|20)\d{2}\b/g) || []).map(Number)))

type Item = { t: string; pk: string; title: string; when: string; year: number | null; lock: boolean }

export default function Timeline({ lang, data, onOpen }: { lang: Lang; data: Data; onOpen: (t: string, pk: string) => void }) {
  const [kind, setKind] = useState('')
  const [desc, setDesc] = useState(true)
  const items = useMemo(() => {
    const out: Item[] = []
    for (const x of SCHEMA) {
      const cols = YEAR_COLS[x.t]
      if (!cols) continue
      for (const r of data[x.t] || []) {
        const when = cols.map((c) => s(r[c])).filter(Boolean).join(' ')
        const ys = yearsOf(when)
        const lv = levelOf(r.privacy)
        const base = { t: x.t, pk: s(r[x.pk]), title: titleOf(x.t, r, lang), when, lock: lv === 'int' || lv === 'max' }
        // a range (2018 → 2024) shows under its first year; every other year it mentions is not repeated
        out.push({ ...base, year: ys.length ? Math.min(...ys) : null })
      }
    }
    return out
  }, [data, lang])
  const kinds = Array.from(new Set(items.map((i) => i.t)))
  const list = items.filter((i) => !kind || i.t === kind)
  const years = Array.from(new Set(list.filter((i) => i.year !== null).map((i) => i.year as number))).sort((a, b) => (desc ? b - a : a - b))
  const noYear = list.filter((i) => i.year === null)
  const Block = ({ label, rows }: { label: string; rows: Item[] }) => (
    <div>
      <div className="gapt">{label} <span className="status">({rows.length})</span></div>
      {rows.map((h) => (
        <div key={h.t + h.pk} className="row" onClick={() => onOpen(h.t, h.pk)}>
          <div className="rt">
            <div className="id">{h.pk} · {tableLabel(h.t, lang)}{h.lock ? ' 🔒' : ''}</div>
            <div className="tt">{h.title || '—'}</div>
            {h.when && <div className="st">{h.when.slice(0, 90)}</div>}
          </div>
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ paddingBottom: 60 }}>
      <div className="status" style={{ paddingTop: 10 }}>{t('tiHint', lang)}</div>
      <div className="bar">
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">{t('tiAll', lang)}</option>
          {kinds.map((k) => <option key={k} value={k}>{tableLabel(k, lang)}</option>)}
        </select>
        <button className="btn" onClick={() => setDesc(!desc)}>{t(desc ? 'tiNewest' : 'tiOldest', lang)}</button>
      </div>
      {years.map((y) => <Block key={y} label={String(y)} rows={list.filter((i) => i.year === y)} />)}
      {noYear.length > 0 && <Block label={t('tiNoYear', lang)} rows={noYear} />}
    </div>
  )
}
