'use client'
// What the public sees: reads the pub_* views with the anonymous key only (no sign-in token), so the result is exactly what the website can read.
// It also scans that text for things that must never be public (long digit runs such as phone or ID numbers, membership / ID-card wording).
import { useEffect, useState } from 'react'
import { SCHEMA } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, s, tableLabel } from '@/lib/meta'

const TABLES = ['works', 'person', 'credits', 'events', 'awards', 'press', 'youtube_videos', 'project_items', 'site_texts', 'contact_channels']
type Hit = { t: string; pk: string; col: string; why: string }
type Res = { t: string; rows: Record<string, unknown>[] | null; err?: boolean }
const WORDS = /(رقم\s*(ال)?عضوية|رقم\s*(ال)?قومي|بطاقة\s*(ال)?(شخصية|هوية|رقم)|بطاقة\s*تحقيق|membership\s*(no|number)|national\s*id|passport)/i

export default function Preview({ lang, data, onOpen }: { lang: Lang; data: Data; onOpen: (t: string, pk: string) => void }) {
  const [res, setRes] = useState<Res[] | null>(null)
  const [show, setShow] = useState('')
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    Promise.all(TABLES.map(async (tb): Promise<Res> => {
      try {
        const r = await fetch(`${url}/rest/v1/pub_${tb}?select=*&limit=5000`, { headers: { apikey: key } })
        if (!r.ok) return { t: tb, rows: null, err: true }
        return { t: tb, rows: (await r.json()) as Record<string, unknown>[] }
      } catch { return { t: tb, rows: null, err: true } }
    })).then(setRes)
  }, [])

  const hits: Hit[] = []
  for (const r of res || []) {
    const pkc = SCHEMA.find((x) => x.t === r.t)?.pk || ''
    for (const row of r.rows || []) for (const [c, v] of Object.entries(row)) {
      const txt = s(v).replace(/https?:\/\/\S+/g, ' ')
      if (!txt) continue
      if (r.t === 'contact_channels' && c === 'value') continue // the public contact numbers he chose to show (Nov 2026)
      if (/\d{10,}/.test(txt) || /\+?\d{2,3}[\s\-]?\d{2,4}[\s\-]\d{3,4}[\s\-]\d{3,4}/.test(txt)) hits.push({ t: r.t, pk: s(row[pkc]), col: c, why: t('pvDigits', lang) })
      else if (WORDS.test(txt)) hits.push({ t: r.t, pk: s(row[pkc]), col: c, why: t('pvWords', lang) })
    }
  }
  const sample = (res || []).find((x) => x.t === show)

  if (!res) return <div className="status">{t('loading', lang)}</div>
  return (
    <div className="pane">
      <div className="status" style={{ padding: 0 }}>{t('pvwHint', lang)}</div>
      {res.map((r) => (
        <div key={r.t} className="gap" style={{ marginTop: 6 }} onClick={() => setShow(show === r.t ? '' : r.t)}>
          <span>{tableLabel(r.t, lang)}</span>
          <b>{r.err ? '⚠️' : `${r.rows?.length ?? 0} / ${(data[r.t] || []).length}`}</b>
        </div>
      ))}
      {sample && sample.rows && (
        <div className="qi" style={{ overflowX: 'auto' }}>
          <div className="grp" style={{ marginTop: 0 }}>{tableLabel(sample.t, lang)} — {t('pvwSample', lang)}</div>
          <pre style={{ whiteSpace: 'pre-wrap', direction: 'ltr', fontSize: 12 }}>{JSON.stringify(sample.rows.slice(0, 3), null, 1)}</pre>
        </div>
      )}
      <div className="grp">{t('pvwScan', lang)}: {hits.length ? <b style={{ color: 'var(--bad, #c0392b)' }}>{hits.length}</b> : t('pvwClean', lang)}</div>
      {hits.slice(0, 100).map((h, i) => (
        <div key={i} className="gap" style={{ marginTop: 6 }} onClick={() => onOpen(h.t, h.pk)}>
          <span>{tableLabel(h.t, lang)} · {h.pk} · {h.col}</span><b style={{ fontWeight: 400 }}>{h.why}</b>
        </div>
      ))}
    </div>
  )
}
