'use client'
// Type a few letters of a work's name, tap the suggestion: the name is shown, the work code is what gets stored.
import { useMemo, useState } from 'react'
import { Data, s } from '@/lib/meta'
import type { Lang } from '@/lib/i18n'
import { norm } from './Search'

export default function WorkPicker({ value, selfId, data, lang, onChange }: { value: string; selfId: string; data: Data; lang: Lang; onChange: (code: string) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const works = useMemo(
    () => (data.works || []).filter((w) => s(w.work_id) !== selfId).map((w) => ({ id: s(w.work_id), ar: s(w.title_ar), en: s(w.title_en) })),
    [data, selfId],
  )
  const nameOf = (id: string) => { const w = works.find((x) => x.id === id); return w ? (lang === 'en' ? w.en || w.ar : w.ar) : id }
  const hits = useMemo(() => {
    const n = norm(q.trim())
    if (!n) return []
    return works.filter((w) => norm(w.ar).includes(n) || norm(w.en).includes(n)).slice(0, 8)
  }, [q, works])
  return (
    <div>
      {value && !open && (
        <div className="qi" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>{nameOf(value)}</b>
          <button className="btn" onClick={() => { onChange(''); setQ(''); setOpen(true) }}>✕</button>
        </div>
      )}
      {(!value || open) && (
        <>
          <input value={q} autoFocus={open} placeholder="…" onChange={(e) => { setQ(e.target.value); setOpen(true) }} />
          {hits.map((w) => (
            <div key={w.id} className="qi" style={{ cursor: 'pointer' }} onClick={() => { onChange(w.id); setQ(''); setOpen(false) }}>
              {lang === 'en' ? w.en || w.ar : w.ar}
              {w.ar && w.en && <span className="status"> · {lang === 'en' ? w.ar : w.en}</span>}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
