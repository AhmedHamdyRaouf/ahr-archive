'use client'
// Albums / projects as groups: every project of «المشاريع الجارية» with its rows (the album row first, then the songs linked to works).
import { useMemo } from 'react'
import { t, Lang } from '@/lib/i18n'
import { Data, s } from '@/lib/meta'

export default function Albums({ lang, data, onOpen }: { lang: Lang; data: Data; onOpen: (t: string, pk: string) => void }) {
  const groups = useMemo(() => {
    const m = new Map<string, typeof items>()
    const items = data.project_items || []
    for (const r of items) { const k = s(r.project).trim() || '—'; m.set(k, [...(m.get(k) || []), r]) }
    const order = (r: (typeof items)[number]) => (Number(r.sort_order) || 999)
    return Array.from(m.entries()).map(([name, list]) => ({
      name,
      list: [...list].sort((a, b) => Number(!!s(a.work_id)) - Number(!!s(b.work_id)) || order(a) - order(b) || (s(a.item_id) < s(b.item_id) ? -1 : 1)),
    }))
  }, [data])
  const works = useMemo(() => new Map((data.works || []).map((w) => [s(w.work_id), w])), [data])
  const en = lang === 'en'
  return (
    <div className="pane">
      <div className="status" style={{ padding: 0 }}>{t('alHint', lang)}</div>
      {groups.length === 0 && <div className="status" style={{ padding: 0 }}>{t('alNone', lang)}</div>}
      {groups.map((g) => (
        <div key={g.name}>
          <div className="grp">💿 {en ? s(g.list.find((r) => s(r.project_en))?.project_en) || g.name : g.name} ({g.list.length})</div>
          {g.list.map((r) => {
            const w = works.get(s(r.work_id))
            return (
              <div key={s(r.item_id)} className="it" style={{ flexWrap: 'wrap' }} onClick={() => onOpen('project_items', s(r.item_id))}>
                <span className="id">{s(r.item_id)}</span>
                <span className="tt">{(en && s(r.title_en)) || s(r.title)}{s(r.date_as_stated) ? ` · ${en ? s(r.date_en) || s(r.date_as_stated) : s(r.date_as_stated)}` : ''}</span>
                {w && <button className="btn" onClick={(e) => { e.stopPropagation(); onOpen('works', s(r.work_id)) }}>{t('alWork', lang)} {s(r.work_id)}{s(w.year_as_stated) ? ` (${s(w.year_as_stated)})` : ''}</button>}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
