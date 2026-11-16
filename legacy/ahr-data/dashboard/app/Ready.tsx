'use client'
// Ready-to-publish check: looks only at records marked publish = نعم and reports what is still missing before they reach the site. It only reports; every line opens the record.
import { useMemo, useState } from 'react'
import { SCHEMA, LABELS_AR } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, s, titleOf, tableLabel, TITLE, SUB, levelOf } from '@/lib/meta'

type Item = { t: string; pk: string; note: string }
type Sec = { key: string; title: string; items: Item[] }
const humanize = (c: string) => c.replace(/_/g, ' ')
const lab = (c: string, l: Lang) => (l === 'ar' ? LABELS_AR[c] || humanize(c) : humanize(c))

export default function Ready({ lang, data, onOpen }: { lang: Lang; data: Data; onOpen: (t: string, pk: string) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const { secs, published, total } = useMemo(() => {
    const noTitle: Item[] = [], noEn: Item[] = [], notPub: Item[] = [], waiting: Item[] = []
    let published = 0, total = 0
    for (const x of SCHEMA) {
      if (!x.cols.includes('publish')) continue
      for (const r of data[x.t] || []) {
        total++
        const pk = s(r[x.pk])
        if (s(r.publish) !== 'نعم') {
          if (levelOf(r.privacy) === 'pub') waiting.push({ t: x.t, pk, note: '' })
          continue
        }
        published++
        for (const c of [TITLE[x.t], SUB[x.t]]) if (c && !s(r[c]).trim()) noTitle.push({ t: x.t, pk, note: lab(c, lang) })
        const miss = x.fields.filter((f) => f.e && s(r[f.c]).trim() && !s(r[f.e]).trim()).map((f) => lab(f.c, lang))
        if (miss.length) noEn.push({ t: x.t, pk, note: miss.slice(0, 4).join('، ') + (miss.length > 4 ? ` +${miss.length - 4}` : '') })
        if (x.cols.includes('privacy') && levelOf(r.privacy) !== 'pub') notPub.push({ t: x.t, pk, note: s(r.privacy) || '—' })
      }
    }
    const secs: Sec[] = [
      { key: 'rt', title: t('rdTitle', lang), items: noTitle },
      { key: 'ren', title: t('rdEn', lang), items: noEn },
      { key: 'rpv', title: t('rdPriv', lang), items: notPub },
      { key: 'rw', title: t('rdWait', lang), items: waiting },
    ]
    return { secs, published, total }
  }, [data, lang])

  const problems = secs.slice(0, 3).reduce((n, x) => n + x.items.length, 0)
  return (
    <div className="pane">
      <div className="status" style={{ padding: 0 }}>{t('rdHint', lang)}</div>
      <div className="qi"><b>{published}</b> / {total} {t('rdOf', lang)} — {problems ? <span style={{ color: 'var(--bad, #c0392b)' }}>{problems} {t('rdIssues', lang)}</span> : t('rdOk', lang)}</div>
      {secs.map((sec) => (
        <div key={sec.key} className="qi">
          <button className="btn" disabled={!sec.items.length} onClick={() => setOpen((o) => ({ ...o, [sec.key]: !o[sec.key] }))}>{sec.title}: <b>{sec.items.length}</b></button>
          {open[sec.key] && sec.items.slice(0, 200).map((i, k) => (
            <div key={k} className="gap" style={{ marginTop: 6 }} onClick={() => onOpen(i.t, i.pk)}>
              <span>{tableLabel(i.t, lang)} · {i.pk} · {titleOf(i.t, (data[i.t] || []).find((r) => s(r[SCHEMA.find((x) => x.t === i.t)?.pk || '']) === i.pk), lang)}</span>
              <b style={{ fontWeight: 400 }}>{i.note}</b>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
