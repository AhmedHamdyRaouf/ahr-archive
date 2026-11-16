'use client'
// Needs-confirmation list: records with confidence MEDIUM / PENDING, and records Ahmed has not confirmed (evidence is not USER-CONFIRMED). It only reports.
import { useMemo, useState } from 'react'
import { SCHEMA } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, s, titleOf, tableLabel } from '@/lib/meta'

type Item = { t: string; pk: string; note: string }

export default function Confirm({ lang, data, onOpen }: { lang: Lang; data: Data; onOpen: (t: string, pk: string) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const secs = useMemo(() => {
    const low: Item[] = [], noConf: Item[] = []
    for (const x of SCHEMA) {
      if (!x.cols.includes('confidence') && !x.cols.includes('evidence_status')) continue
      for (const r of data[x.t] || []) {
        const pk = s(r[x.pk]); const c = s(r.confidence).trim().toUpperCase(); const ev = s(r.evidence_status)
        if (x.cols.includes('confidence') && (c === 'MEDIUM' || c === 'PENDING' || (c !== 'HIGH' && c !== ''))) low.push({ t: x.t, pk, note: c })
        else if (x.cols.includes('evidence_status') && ev && !/USER-CONFIRMED/i.test(ev)) noConf.push({ t: x.t, pk, note: ev.slice(0, 40) })
      }
    }
    return [{ key: 'low', title: t('cfLow', lang), items: low }, { key: 'nc', title: t('cfNoConf', lang), items: noConf }]
  }, [data, lang])
  return (
    <div className="pane">
      <div className="status" style={{ padding: 0 }}>{t('cfHint', lang)}</div>
      {secs.map((sec) => {
        const shown = open[sec.key] ? sec.items : sec.items.slice(0, 30)
        return (
          <div key={sec.key}>
            <div className="grp">{sec.title} {sec.items.length ? <b style={{ color: 'var(--bad)' }}>({sec.items.length})</b> : <span className="ok">{t('cfOk', lang)}</span>}</div>
            {shown.map((it, i) => (
              <div key={sec.key + i} className="it" onClick={() => onOpen(it.t, it.pk)}>
                <span className="id">{it.pk}</span>
                <span className="tt">{tableLabel(it.t, lang)} — {titleOf(it.t, (data[it.t] || []).find((r) => s(r[SCHEMA.find((x) => x.t === it.t)?.pk || '']) === it.pk), lang)}{it.note ? ` · ${it.note}` : ''}</span>
              </div>
            ))}
            {sec.items.length > 30 && !open[sec.key] && <button className="btn" onClick={() => setOpen({ ...open, [sec.key]: true })}>{t('hAll', lang)} ({sec.items.length})</button>}
          </div>
        )
      })}
    </div>
  )
}
