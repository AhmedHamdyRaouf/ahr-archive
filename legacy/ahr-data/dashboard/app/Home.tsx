'use client'
// Home screen: archive size, completeness, works over time, review alerts, last changes, quick access.
import { useEffect, useMemo, useState } from 'react'
import { sb } from '@/lib/supabase'
import { SCHEMA, LABELS_AR } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { Data, s, titleOf, tableLabel, levelOf } from '@/lib/meta'
import type { Graph } from '@/lib/refs'
import Icon, { TABLE_ICON } from './Icon'

type Log = { id: number; at: string; tbl: string; pk: string; action: 'insert' | 'update' | 'delete'; before: Record<string, unknown> | null; after: Record<string, unknown> | null }
// columns that are normally left blank (platform links, free notes) do not count against completeness
const OPTIONAL = /^(link_|notes?(_en)?$|story_notes)/
const CARDS = ['works', 'person', 'credits', 'work_relationship', 'events', 'press']
const humanize = (c: string) => c.replace(/_en$/, '').replace(/_/g, ' ')
const labelOf = (c: string, l: Lang) => (l === 'ar' ? LABELS_AR[c] || humanize(c) : humanize(c))
const CHIP = ['#f6ecd2', '#e4e6f4', '#f2dfe1', '#e6f0dc', '#f3e5d8', '#dfeef2']

function Donut({ pct }: { pct: number }) {
  const r = 52, c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 140 140" className="donut" aria-label={pct + '%'}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e3e0" strokeWidth="16" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--gold)" strokeWidth="16" strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 70 70)" />
      <text x="70" y="78" textAnchor="middle" fontSize="28" fontWeight="700" fill="var(--ink)">{pct}%</text>
    </svg>
  )
}

function Growth({ pts }: { pts: { y: number; n: number }[] }) {
  if (pts.length < 2) return <div className="status">—</div>
  const W = 520, H = 200, L = 34, B = 26, T = 10, R = 8
  const max = Math.max(...pts.map((p) => p.n)), min = Math.min(...pts.map((p) => p.n))
  const step = Math.max(5, Math.ceil((max - min) / 4 / 5) * 5)
  const lo = Math.floor(min / step) * step, hi = Math.max(lo + step, Math.ceil(max / step) * step)
  const x = (i: number) => L + (i * (W - L - R)) / (pts.length - 1)
  const y = (n: number) => T + (1 - (n - lo) / (hi - lo)) * (H - T - B)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.n).toFixed(1)}`).join(' ')
  const area = `${line} L${x(pts.length - 1)} ${H - B} L${x(0)} ${H - B} Z`
  const ticks: number[] = []
  for (let v = lo; v <= hi; v += step) ticks.push(v)
  const every = Math.ceil(pts.length / 10)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="growth" style={{ direction: 'ltr' }}>
      <defs><linearGradient id="gA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--gold)" stopOpacity=".28" /><stop offset="1" stopColor="var(--gold)" stopOpacity="0" /></linearGradient></defs>
      {ticks.map((v) => (
        <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#eee7d8" /><text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--mute)">{v}</text></g>
      ))}
      <path d={area} fill="url(#gA)" />
      <path d={line} fill="none" stroke="var(--gold)" strokeWidth="2" />
      {pts.map((p, i) => (
        <g key={p.y}>
          <circle cx={x(i)} cy={y(p.n)} r="3.5" fill="var(--gold)"><title>{p.y}: {p.n}</title></circle>
          {(i % every === 0 || i === pts.length - 1) && <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--mute)">{p.y}</text>}
        </g>
      ))}
    </svg>
  )
}

export default function Home({ lang, data, graph, onTab, onView, onOpen, onNew }: {
  lang: Lang; data: Data; graph: Graph
  onTab: (table: string) => void; onView: (v: 'confirm' | 'ready' | 'health' | 'history' | 'search') => void
  onOpen: (t: string, pk: string) => void; onNew: (table: string) => void
}) {
  const [log, setLog] = useState<Log[] | null>(null)
  const [week, setWeek] = useState<Record<string, { ins: number; upd: number }>>({})
  useEffect(() => {
    let live = true
    sb().from('change_log').select('id,at,tbl,pk,action,before,after').order('id', { ascending: false }).limit(5)
      .then(({ data: d }) => { if (live) setLog((d || []) as Log[]) })
    const since = new Date(Date.now() - 7 * 864e5).toISOString()
    sb().from('change_log').select('tbl,action').gte('at', since).limit(5000)
      .then(({ data: d }) => {
        if (!live) return
        const m: Record<string, { ins: number; upd: number }> = {}
        for (const r of (d || []) as { tbl: string; action: string }[]) {
          const e = (m[r.tbl] = m[r.tbl] || { ins: 0, upd: 0 })
          if (r.action === 'insert') e.ins++; else if (r.action === 'update') e.upd++
        }
        setWeek(m)
      })
    return () => { live = false }
  }, [])

  const growth = useMemo(() => {
    const m = new Map<number, number>()
    for (const w of data.works || []) {
      const y = parseInt((s(w.year_en) || s(w.year_as_stated)).match(/(19|20)\d\d/)?.[0] || '', 10)
      if (y) m.set(y, (m.get(y) || 0) + 1)
    }
    const ys = Array.from(m.keys()).sort((a, b) => a - b)
    if (!ys.length) return []
    const out: { y: number; n: number }[] = []
    let acc = 0
    for (let y = ys[0]; y <= ys[ys.length - 1]; y++) { acc += m.get(y) || 0; out.push({ y, n: acc }) }
    return out
  }, [data])

  // per-record completeness across every table: complete = all, partial = 70%+, incomplete = below
  const comp = useMemo(() => {
    let filled = 0, total = 0, done = 0, part = 0, miss = 0
    for (const x of SCHEMA) {
      const cols = x.cols.filter((c) => c !== x.pk && !OPTIONAL.test(c))
      for (const r of data[x.t] || []) {
        let f = 0
        for (const c of cols) if (s(r[c]).trim() !== '') f++
        filled += f; total += cols.length
        const k = cols.length ? f / cols.length : 1
        if (k >= 1) done++; else if (k >= 0.7) part++; else miss++
      }
    }
    return { pct: total ? Math.round((filled / total) * 100) : 100, done, part, miss }
  }, [data])

  const review = useMemo(() => {
    const open = (data.review_queue || []).filter((r) => s(r.status).trim() === 'مفتوحة').length
    let low = 0, undecided = 0
    for (const x of SCHEMA) {
      for (const r of data[x.t] || []) {
        if (x.cols.includes('confidence')) { const c = s(r.confidence).trim().toUpperCase(); if (c && c !== 'HIGH') low++ }
        if (x.cols.includes('publish') && levelOf(r.privacy) === 'pub' && s(r.publish) === '') undecided++
      }
    }
    return { open, low, undecided, dangling: graph.dangling.length }
  }, [data, graph])

  const when = (at: string) => new Date(at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { timeZone: 'Africa/Cairo', day: 'numeric', month: 'long', year: 'numeric' })
  const pkOf = (tb: string) => SCHEMA.find((x) => x.t === tb)?.pk || ''
  const change = (l: Log) => {
    if (l.action === 'insert') return t('hmInserted', lang)
    if (l.action === 'delete') return t('hmDeleted', lang)
    const cols = Object.keys(l.after || {}).filter((c) => !['updated_at', 'updated_by'].includes(c) && JSON.stringify((l.after || {})[c]) !== JSON.stringify((l.before || {})[c]))
    if (!cols.length) return t('hmEdited', lang)
    const first = cols.slice(0, 2).map((c) => labelOf(c, lang)).join('، ')
    return `${t('hmEdited', lang)}: ${first}${cols.length > 2 ? ' +' + (cols.length - 2) : ''}`
  }

  const alerts: { n: number; label: string; icon: string; go: () => void }[] = [
    { n: review.open, label: t('hmOpenQueue', lang), icon: 'warn', go: () => onTab('review_queue') },
    { n: review.low, label: t('hmLowConf', lang), icon: 'scale', go: () => onView('confirm') },
    { n: review.undecided, label: t('hmUndecided', lang), icon: 'doc', go: () => onView('ready') },
    { n: review.dangling, label: t('hmDangling', lang), icon: 'link', go: () => onView('health') },
  ]

  return (
    <div className="home">
      <div className="hello">
        <h2>{t('hello', lang)}</h2>
        <p>{t('helloSub', lang)}</p>
      </div>

      <div className="stats">
        {CARDS.map((tb) => {
          const d = SCHEMA.find((x) => x.t === tb); if (!d) return null
          return (
            <button key={tb} className="stat" onClick={() => onTab(tb)}>
              <span className="ico"><Icon n={TABLE_ICON[tb]} size={26} /></span>
              <span className="lbl">{lang === 'ar' ? d.ar : d.en}</span>
              <span className="num">{(data[tb] || []).length}</span>
              {(() => {
                const w = week[tb] || { ins: 0, upd: 0 }
                return w.ins ? <span className="delta up">↑ +{w.ins} {t('hmWeekNew', lang)}</span>
                  : w.upd ? <span className="delta">{w.upd} {t('hmWeekEdit', lang)}</span>
                  : <span className="delta none">{t('hmWeekNone', lang)}</span>
              })()}
            </button>
          )
        })}
      </div>

      <div className="grid3">
        <section className="panel">
          <h3>{t('hmAlerts', lang)}</h3>
          <div className="alerts">
            {alerts.map((a, i) => (
              <button key={i} className="alert" onClick={a.go}>
                <Icon n={a.icon} size={22} />
                <span className="al">{a.label}</span>
                <b className="pill">{a.n}</b>
              </button>
            ))}
          </div>
          <button className="more" onClick={() => onView('confirm')}>{t('hmViewAll', lang)} <Icon n="arrow" size={16} /></button>
        </section>

        <section className="panel">
          <h3>{t('hmGrowth', lang)}</h3>
          <Growth pts={growth} />
        </section>

        <section className="panel">
          <h3>{t('hmDonut', lang)}</h3>
          <div className="donutrow">
            <Donut pct={comp.pct} />
            <ul className="legend">
              <li><i style={{ background: 'var(--gold)' }} />{t('hmDone', lang)}<b>{comp.done}</b></li>
              <li><i style={{ background: '#e2b85a' }} />{t('hmPart', lang)}<b>{comp.part}</b></li>
              <li><i style={{ background: '#a0453a' }} />{t('hmMiss', lang)}<b>{comp.miss}</b></li>
            </ul>
          </div>
        </section>
      </div>

      <div className="grid2">
        <section className="panel">
          <div className="phead"><h3>{t('hmQuick', lang)}</h3></div>
          <div className="quick">
            <button onClick={() => onNew('works')}><Icon n="music" size={28} /><span>{t('hmAddWork', lang)}</span></button>
            <button onClick={() => onNew('person')}><Icon n="users" size={28} /><span>{t('hmAddPerson', lang)}</span></button>
            <button onClick={() => onView('confirm')}><Icon n="check" size={28} /><span>{t('hmReviewData', lang)}</span></button>
            <button onClick={() => onView('search')}><Icon n="search" size={28} /><span>{t('hmAdvSearch', lang)}</span></button>
          </div>
        </section>

        <section className="panel">
          <div className="phead">
            <h3>{t('hmRecent', lang)}</h3>
            <button className="more" onClick={() => onView('history')}>{t('hmFullLog', lang)} <Icon n="arrow" size={16} /></button>
          </div>
          <div className="tbl">
            <div className="th"><span>{t('hmType', lang)}</span><span>{t('hmRecord', lang)}</span><span>{t('hmChange', lang)}</span><span>{t('hmDate', lang)}</span></div>
            {log && log.length === 0 && <div className="status" style={{ padding: 10 }}>{t('hmNoRecent', lang)}</div>}
            {(log || []).map((l) => {
              const row = (data[l.tbl] || []).find((r) => s(r[pkOf(l.tbl)]) === l.pk)
              const idx = Math.max(0, SCHEMA.findIndex((x) => x.t === l.tbl))
              return (
                <div key={l.id} className="tr" onClick={() => l.action !== 'delete' && row && onOpen(l.tbl, l.pk)} title={row ? titleOf(l.tbl, row, lang) : ''}>
                  <span><em className="tchip" style={{ background: CHIP[idx % CHIP.length] }}>{tableLabel(l.tbl, lang)}</em></span>
                  <span className="mono">{l.pk}</span>
                  <span className="chg">{change(l)}</span>
                  <span className="dt">{when(l.at)}</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
