'use client'
// Integrity check screen: finds broken links and inconsistencies. It only reports; every line opens the record to fix it.
import { useEffect, useMemo, useState } from 'react'
import { SCHEMA } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, s, titleOf, tableLabel } from '@/lib/meta'
import type { Graph } from '@/lib/refs'

type Issue = { t: string; pk: string; note?: string }
type Sec = { key: string; title: string; items: Issue[] }

export default function Health({ lang, data, graph, token, onOpen }: { lang: Lang; data: Data; graph: Graph; token: string; onOpen: (t: string, pk: string) => void }) {
  const [photos, setPhotos] = useState<string[] | null>(null)
  const [photoFail, setPhotoFail] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [n, setN] = useState(0)

  useEffect(() => {
    setPhotos(null); setPhotoFail(false)
    fetch('/api/health', { headers: { authorization: `Bearer ${token}` } })
      .then(async (r) => { if (!r.ok) throw new Error(); setPhotos(((await r.json()) as { photos: string[] }).photos) })
      .catch(() => setPhotoFail(true))
  }, [token, n])

  const secs: Sec[] = useMemo(() => {
    const out: Sec[] = []
    const credits = data.credits || []
    // codes written in text that point at nothing (credit links shown separately)
    const fk = graph.dangling.filter((d) => d.t === 'credits' && (d.col === 'work_id' || d.col === 'person_id'))
    const rest = graph.dangling.filter((d) => !(d.t === 'credits' && (d.col === 'work_id' || d.col === 'person_id')))
    out.push({ key: 'fk', title: t('hFk', lang), items: fk.map((d) => ({ t: d.t, pk: d.pk, note: `${d.col}: ${d.code}` })) })
    out.push({ key: 'dang', title: t('hDangling', lang), items: rest.map((d) => ({ t: d.t, pk: d.pk, note: `${d.code}` })) })
    const hasCredit = (col: string) => new Set(credits.map((c) => s(c[col])))
    const wset = hasCredit('work_id')
    const pset = hasCredit('person_id')
    out.push({ key: 'nw', title: t('hNoCredW', lang), items: (data.works || []).filter((w) => !wset.has(s(w.work_id))).map((w) => ({ t: 'works', pk: s(w.work_id) })) })
    // a person counts as connected if he has credits OR his code is written in any other record (a photo, event, award, story ...)
    out.push({ key: 'np', title: t('hNoCredP', lang), items: (data.person || []).filter((p) => !pset.has(s(p.person_id)) && !(graph.inn.get(s(p.person_id)) || []).length).map((p) => ({ t: 'person', pk: s(p.person_id) })) })
    // duplicate names
    const dups: Issue[] = []
    const norm = (v: unknown) => s(v).replace(/\s+/g, ' ').trim().toLowerCase()
    for (const [tb, pk, col] of [['person', 'person_id', 'name_ar'], ['works', 'work_id', 'title_ar'], ['events', 'event_id', 'name']] as const) {
      const m = new Map<string, string[]>()
      for (const r of data[tb] || []) { const k = norm(r[col]); if (k) m.set(k, [...(m.get(k) || []), s(r[pk])]) }
      for (const ids of m.values()) if (ids.length > 1) ids.forEach((id) => dups.push({ t: tb, pk: id, note: ids.join(' = ') }))
    }
    out.push({ key: 'dup', title: t('hDup', lang), items: dups })
    // the year of a work against the dates of the events / project items linked to it (a different year is reported for review; many are legitimate, e.g. a later festival)
    const yrs = (v: unknown): string[] => s(v).match(/(?<!\d)(?:19|20)\d\d(?!\d)/g) || []
    const wmap = new Map((data.works || []).map((w) => [s(w.work_id), w]))
    const dateIssues = (tb: string, pk: string, label: string): Issue[] => (data[tb] || []).flatMap((r): Issue[] => {
      const w = wmap.get(s(r.work_id)); if (!w) return []
      const wy = yrs(w.year_as_stated)[0]; const ey = yrs(r.date_as_stated)
      return wy && ey.length && !ey.includes(wy) ? [{ t: tb, pk: s(r[pk]), note: `${label}: ${s(r.work_id)} ${wy} ≠ ${s(r.date_as_stated)}` }] : []
    })
    out.push({ key: 'dtev', title: t('hDates', lang), items: dateIssues('events', 'event_id', s(t('hDatesEv', lang))) })
    out.push({ key: 'dtpi', title: t('hDatesPi', lang), items: dateIssues('project_items', 'item_id', s(t('hDatesPiL', lang))) })
    // photos
    if (photos) {
      const set = new Set(photos)
      const media = data.media_assets || []
      const linked = new Set(media.map((m) => s(m.link)))
      out.push({ key: 'nofile', title: t('hNoFile', lang), items: media.filter((m) => !set.has(s(m.link)) && (s(m.link).startsWith('photos/') || s(m.category) === 'صورة')).map((m) => ({ t: 'media_assets', pk: s(m.media_id), note: s(m.link) })) })
      out.push({ key: 'orphan', title: t('hOrphan', lang), items: photos.filter((p) => !linked.has(p)).map((p) => ({ t: '', pk: '', note: p })) })
    }
    return out
  }, [data, graph, photos, lang])

  const idCol = (tb: string) => SCHEMA.find((x) => x.t === tb)?.pk || ''
  void idCol

  return (
    <div className="pane">
      <div className="status" style={{ padding: 0 }}>{t('hHint', lang)}</div>
      <div><button className="btn" onClick={() => setN(n + 1)}>{t('hRun', lang)}</button></div>
      {photoFail && <div className="err">{t('hNoRepo', lang)}</div>}
      {secs.map((sec) => {
        const shown = open[sec.key] ? sec.items : sec.items.slice(0, 30)
        return (
          <div key={sec.key}>
            <div className="grp">{sec.title} {sec.items.length ? <b style={{ color: 'var(--bad)' }}>({sec.items.length})</b> : <span className="ok">{t('hOk', lang)}</span>}</div>
            {shown.map((it, i) => (
              <div key={sec.key + i} className="it" onClick={() => it.t && onOpen(it.t, it.pk)} style={it.t ? undefined : { cursor: 'default' }}>
                {it.t ? <><span className="id">{it.pk}</span><span className="tt">{tableLabel(it.t, lang)} — {titleOf(it.t, (data[it.t] || []).find((r) => s(r[idCol(it.t)]) === it.pk), lang)}{it.note ? ` · ${it.note}` : ''}</span></> : <span className="tt">{it.note}</span>}
              </div>
            ))}
            {sec.items.length > 30 && !open[sec.key] && <button className="btn" onClick={() => setOpen({ ...open, [sec.key]: true })}>{t('hAll', lang)} ({sec.items.length})</button>}
          </div>
        )
      })}
    </div>
  )
}
