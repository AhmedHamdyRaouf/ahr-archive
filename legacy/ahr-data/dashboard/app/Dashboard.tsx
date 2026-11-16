'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import { sb, OWNER } from '@/lib/supabase'
import { SCHEMA, LABELS_AR, Table, Field } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import Uploader from './Uploader'
import Photo from './Photo'
import { Chips, Related } from './Related'
import Health from './Health'
import Ready from './Ready'
import Preview from './Preview'
import Assistant, { AMsg, AChange } from './Assistant'
import Translate, { Patch } from './Translate'
import History from './History'
import Search, { norm } from './Search'
import Timeline from './Timeline'
import Merge from './Merge'
import WorkPicker from './WorkPicker'
import Albums from './Albums'
import Home from './Home'
import Icon, { TABLE_ICON } from './Icon'
import Confirm from './Confirm'
import RecordHistory from './RecordHistory'
import { Row, Data, TITLE, SUB, FILE, s, levelOf, LEVELS, Level, listColumns, tableLabel, coerceRow } from '@/lib/meta'
import { buildGraph, codesIn } from '@/lib/refs'

const humanize = (c: string) => c.replace(/_en$/, '').replace(/_/g, ' ').replace(/^\w/, (x) => x.toUpperCase())
const labelOf = (c: string, l: Lang) => (l === 'ar' ? LABELS_AR[c] || humanize(c) : humanize(c))
// columns that are normally left blank for most rows (platform links, free notes): shown after the main ones
const OPTIONAL = /^(link_|notes?(_en)?$|story_notes)/
const byteSort = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

export default function Dashboard() {
  const [lang, setLang] = useState<Lang>('ar')
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [data, setData] = useState<Data>({})
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<string>('works')
  const [q, setQ] = useState('')
  const [emptyCol, setEmptyCol] = useState('')
  const [editing, setEditing] = useState<{ row: Row; isNew: boolean } | null>(null)
  const [msg, setMsg] = useState('')
  const [view, setView] = useState<'home' | 'table' | 'gaps' | 'health' | 'translate' | 'history' | 'privacy' | 'search' | 'timeline' | 'ready' | 'preview' | 'assistant' | 'albums' | 'confirm'>('home')
  const [lvl, setLvl] = useState<Level | ''>('')
  const [trail, setTrail] = useState<{ t: string; pk: string | number }[]>([])
  const [uploading, setUploading] = useState(false)
  const [full, setFull] = useState('')
  const [merging, setMerging] = useState(false)
  const [projF, setProjF] = useState('')
  const [pubF, setPubF] = useState('')
  const [linkF, setLinkF] = useState('')
  const [gq, setGq] = useState('')
  const [nav, setNav] = useState(false)
  const [wantNew, setWantNew] = useState('')
  const [asMsgs, setAsMsgs] = useState<AMsg[]>([])
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSync = useRef<Set<string>>(new Set())

  useEffect(() => {
    const l = (localStorage.getItem('ahr_lang') as Lang) || 'ar'
    setLang(l)
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try { localStorage.setItem('ahr_lang', lang) } catch { /* ignore */ }
  }, [lang])

  useEffect(() => {
    sb().auth.getSession().then(({ data: d }) => { setSession(d.session); setReady(true) })
    const { data: sub } = sb().auth.onAuthStateChange((_e, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  const allowed = !!session && (session.user.email || '').toLowerCase() === OWNER

  const loadAll = useCallback(async () => {
    setLoading(true)
    const out: Data = {}
    for (const tb of SCHEMA) {
      const { data: rows, error } = await sb().from(tb.t).select('*').range(0, 4999)
      if (error) { setMsg(`${t('error', lang)}: ${tb.t} — ${error.message}`); continue }
      const list = (rows || []) as Row[]
      list.sort((a, b) => (tb.pk === 'row_id' ? Number(a[tb.pk]) - Number(b[tb.pk]) : byteSort(s(a[tb.pk]), s(b[tb.pk]))))
      out[tb.t] = list
    }
    setData(out)
    setLoading(false)
  }, [lang])

  useEffect(() => { if (allowed) loadAll() }, [allowed, loadAll])

  const tb = SCHEMA.find((x) => x.t === tab) as Table
  const rows = data[tab] || []

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (emptyCol && s(r[emptyCol]).trim() !== '') return false
      if (lvl && levelOf(r.privacy) !== lvl) return false
      if (projF && tb.t === 'project_items' && s(r.project) !== projF) return false
      if (pubF && tb.cols.includes('publish') && (pubF === '_' ? s(r.publish) !== '' : s(r.publish) !== pubF)) return false
      if (linkF && tb.t === 'works') {
        const lc = tb.cols.filter((c) => c.startsWith('link_'))
        if (linkF === '_any' ? lc.some((c) => s(r[c]).trim() !== '') : s(r[linkF]).trim() !== '') return false
      }
      if (!needle) return true
      return tb.cols.some((c) => s(r[c]).toLowerCase().includes(needle))
    })
  }, [rows, q, emptyCol, lvl, tb, projF, pubF, linkF])

  const lists = useMemo(() => listColumns(tb, rows), [tb, rows])
  const [customCols, setCustomCols] = useState<string[]>([])
  const editKey = editing ? `${tab}|${s(editing.row[tb.pk])}|${editing.isNew}` : ''
  useEffect(() => { setCustomCols([]) }, [editKey])

  const graph = useMemo(() => buildGraph(data), [data])

  const gaps = useMemo(() => {
    return SCHEMA.map((x) => {
      const list = data[x.t] || []
      const cols = x.cols.filter((c) => c !== x.pk).map((c) => ({ c, n: list.filter((r) => s(r[c]).trim() === '').length })).filter((g) => g.n > 0)
      return { x, cols }
    }).filter((g) => g.cols.length)
  }, [data])

  // several tables can be saved close together (bulk fill, undo): every table is queued and copied to GitHub one after another
  function scheduleSync(table: string) {
    pendingSync.current.add(table)
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(async () => {
      const list = Array.from(pendingSync.current)
      pendingSync.current.clear()
      setMsg(t('syncing', lang))
      try {
        for (const tbl of list) {
          const r = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${session?.access_token}` },
            body: JSON.stringify({ table: tbl }),
          })
          const j = await r.json().catch(() => ({}))
          if (r.ok) continue
          setMsg(j.code === 'not_configured' ? t('syncOff', lang) : `${t('syncFail', lang)}: ${j.error || r.status}`)
          return
        }
        setMsg(t('synced', lang))
      } catch { setMsg(t('syncFail', lang)) }
    }, 800)
  }

  const sortRows = (def: Table, list: Row[]) => list.sort((a, b) => (def.pk === 'row_id' ? Number(a[def.pk]) - Number(b[def.pk]) : byteSort(s(a[def.pk]), s(b[def.pk]))))

  async function reloadTable(table: string) {
    const def = SCHEMA.find((x) => x.t === table)
    if (!def) return
    const { data: rows2, error } = await sb().from(table).select('*').range(0, 4999)
    if (error) { setMsg(`${t('error', lang)}: ${error.message}`); return }
    setData((d) => ({ ...d, [table]: sortRows(def, [...((rows2 || []) as Row[])]) }))
    scheduleSync(table)
  }

  async function applyPatches(list: Patch[]): Promise<string> {
    const done = new Set<string>()
    for (const p of list) {
      const def = SCHEMA.find((x) => x.t === p.t)
      if (!def) continue
      const { error } = await sb().from(p.t).update(p.patch).eq(def.pk, p.pk)
      if (error) return error.message
      setData((d) => ({ ...d, [p.t]: (d[p.t] || []).map((r) => (s(r[def.pk]) === s(p.pk) ? { ...r, ...p.patch } : r)) }))
      done.add(p.t)
    }
    done.forEach((x) => scheduleSync(x))
    return ''
  }

  // changes proposed by the assistant, applied only after the owner taps apply
  async function applyAssistant(list: AChange[]): Promise<string> {
    const taken = new Map<string, Set<number>>()
    for (const c of list) {
      const def = SCHEMA.find((x) => x.t === c.table)
      if (!def) return `unknown table ${c.table}`
      const fields: Row = {}
      for (const [k, v] of Object.entries(c.fields)) if (def.cols.includes(k) && k !== def.pk) fields[k] = v
      if (c.kind === 'update') {
        const old = (data[def.t] || []).find((r) => s(r[def.pk]) === s(c.pk))
        if (!old) return `${c.pk}: not found`
        if ('privacy' in fields) {
          const rank = (v: unknown) => ({ pub: 1, int: 2, max: 3, none: 1 } as Record<string, number>)[levelOf(v)]
          if (rank(old.privacy) >= 2 && rank(fields.privacy) < rank(old.privacy)) return `${c.pk}: ${t('asPrivBlock', lang)}`
        }
        const err = await applyPatches([{ t: def.t, pk: s(c.pk), patch: fields }])
        if (err) return err
      } else {
        const list2 = data[def.t] || []
        let id: string | number
        if (def.pk === 'row_id') id = list2.reduce((m, r) => Math.max(m, Number(r.row_id)), 0) + 1 + (taken.get(def.t)?.size || 0)
        else {
          const used = new Set(list2.map((r) => parseInt((s(r[def.pk]).match(/(\d+)$/) || ['', '0'])[1], 10)))
          taken.get(def.t)?.forEach((n) => used.add(n))
          let n = 1
          while (used.has(n)) n++
          id = `${def.prefix}${String(n).padStart(4, '0')}`
          taken.set(def.t, (taken.get(def.t) || new Set()).add(n))
        }
        const row: Row = {}
        def.cols.forEach((col) => (row[col] = ''))
        Object.assign(row, fields); row[def.pk] = id
        const { error } = await sb().from(def.t).insert(row)
        if (error) return error.message
        setData((d) => ({ ...d, [def.t]: [...(d[def.t] || []), row].sort((a, b) => (def.pk === 'row_id' ? Number(a[def.pk]) - Number(b[def.pk]) : byteSort(s(a[def.pk]), s(b[def.pk])))) }))
        scheduleSync(def.t)
      }
    }
    return ''
  }

  function isDirty() {
    if (!editing || editing.isNew) return false
    const cur = (data[tab] || []).find((r) => s(r[tb.pk]) === s(editing.row[tb.pk]))
    return !!cur && tb.cols.some((c) => s(cur[c]) !== s(editing.row[c]))
  }

  function openRecord(t2: string, pk: string | number, push = true) {
    if (isDirty() && !window.confirm(t('dirtyAsk', lang))) return
    const def = SCHEMA.find((x) => x.t === t2)
    const r = def && (data[t2] || []).find((x) => s(x[def.pk]) === s(pk))
    if (!r) return
    if (editing && !editing.isNew && push) setTrail((tr) => [...tr, { t: tab, pk: editing.row[tb.pk] as string | number }])
    else if (!editing) setTrail([])
    setTab(t2); setView('table'); setQ(''); setEmptyCol(''); setLvl(''); setPubF('')
    setEditing({ row: { ...r }, isNew: false })
  }

  function closeEditing() { setEditing(null); setTrail([]) }

  function goBack() {
    const last = trail[trail.length - 1]
    if (!last) return
    if (isDirty() && !window.confirm(t('dirtyAsk', lang))) return
    const def = SCHEMA.find((x) => x.t === last.t)
    const r = def && (data[last.t] || []).find((x) => s(x[def.pk]) === s(last.pk))
    setTrail((tr) => tr.slice(0, -1))
    if (!r) return
    setTab(last.t)
    setEditing({ row: { ...r }, isNew: false })
  }

  function nextId(): string | number {
    const list = data[tab] || []
    if (tb.pk === 'row_id') return list.reduce((m, r) => Math.max(m, Number(r.row_id)), 0) + 1
    const nums = list.map((r) => parseInt((s(r[tb.pk]).match(/(\d+)$/) || ['', '0'])[1], 10))
    // a free number left by a merged or removed record is handed to the next new record (decision 2026-11-10); otherwise continue after the highest
    const used = new Set(nums)
    let n = (nums.length ? Math.max(...nums) : 0) + 1
    for (let k = 1; k < n; k++) if (!used.has(k)) { n = k; break }
    return `${tb.prefix}${String(n).padStart(4, '0')}`
  }

  function startNew() {
    const row: Row = {}
    tb.cols.forEach((c) => (row[c] = ''))
    row[tb.pk] = nextId()
    setEditing({ row, isNew: true })
  }

  // "add" shortcuts from the home screen: switch to the table first, then open the empty form
  useEffect(() => {
    if (wantNew && tab === wantNew && view === 'table') { setWantNew(''); startNew() }
  }, [wantNew, tab, view]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (!editing) return
    const { row, isNew } = editing
    const payload: Row = coerceRow(tb.t, { ...row })
    if (!isNew && tb.cols.includes('privacy')) {
      const old = (data[tab] || []).find((r) => s(r[tb.pk]) === s(row[tb.pk]))
      const rank = (v: unknown) => ({ pub: 1, int: 2, max: 3, none: 1 } as Record<string, number>)[levelOf(v)]
      // lowering a protected record (داخلي / أقصى خصوصية → عام or blank) asks first
      if (old && rank(old.privacy) >= 2 && rank(payload.privacy) < rank(old.privacy) &&
        !window.confirm(t('pvLower', lang).replace('{a}', s(old.privacy) || '—').replace('{b}', s(payload.privacy) || '—'))) return
    }
    // blank strings stay blank strings, matching the existing data
    const res = isNew
      ? await sb().from(tb.t).insert(payload)
      : await sb().from(tb.t).update(payload).eq(tb.pk, row[tb.pk] as string | number)
    if (res.error) { setMsg(`${t('error', lang)}: ${res.error.message}`); return }
    setData((d) => {
      const list = [...(d[tab] || [])]
      const i = list.findIndex((r) => r[tb.pk] === row[tb.pk])
      if (i >= 0) list[i] = payload
      else list.push(payload)
      list.sort((a, b) => (tb.pk === 'row_id' ? Number(a[tb.pk]) - Number(b[tb.pk]) : byteSort(s(a[tb.pk]), s(b[tb.pk]))))
      return { ...d, [tab]: list }
    })
    closeEditing()
    setMsg(t('saved', lang))
    scheduleSync(tab)
  }

  // marks every shown, public, undecided row as «يُنشر = نعم» (rows with another privacy level are never touched)
  async function publishShown() {
    const todo = shown.filter((r) => s(r.privacy) === 'عام' && s(r.publish) === '')
    if (!todo.length) { setMsg(t('pubNone', lang)); return }
    if (!window.confirm(t('pubAsk', lang).replace('{n}', String(todo.length)))) return
    const err = await applyPatches(todo.map((r) => ({ t: tab, pk: s(r[tb.pk]), patch: { publish: 'نعم' } })))
    setMsg(err ? `${t('error', lang)}: ${err}` : t('saved', lang))
  }

  async function remove() {
    if (!editing || editing.isNew) return
    const used = tb.prefix ? graph.inn.get(s(editing.row[tb.pk])) || [] : []
    const lines = used.slice(0, 8).map((u) => `• ${u.pk} (${tableLabel(u.t, lang)})`).join('\n')
    const ask = used.length
      ? `${t('delUsed', lang)} ${used.length}\n${lines}${used.length > 8 ? '\n…' : ''}\n\n${t('delUsed2', lang)}`
      : t('confirmDel', lang)
    if (!window.confirm(ask)) return
    const id = editing.row[tb.pk] as string | number
    const { error } = await sb().from(tb.t).delete().eq(tb.pk, id)
    if (error) { setMsg(`${t('error', lang)}: ${error.message}`); return }
    setData((d) => ({ ...d, [tab]: (d[tab] || []).filter((r) => r[tb.pk] !== id) }))
    closeEditing()
    setMsg(t('saved', lang))
    scheduleSync(tab)
  }

  function exportXlsx() {
    const wb = XLSX.utils.book_new()
    for (const x of SCHEMA) {
      const cols = x.t === 'review_queue' ? x.cols.filter((c) => c !== 'row_id') : x.cols
      const aoa = [cols, ...(data[x.t] || []).map((r) => cols.map((c) => s(r[c])))]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), FILE[x.t])
    }
    XLSX.writeFile(wb, 'AHR_Master_Works_Database_export.xlsx')
  }

  // Public copy: no internal / maximum-privacy rows, no review queue, no rows marked do-not-publish, no credits that lead to a hidden record
  function exportPublic() {
    const hidden = new Set<string>()
    const keep: Record<string, Row[]> = {}
    const marked = (r: Row, cols: string[]) => cols.some((c) => /لا (ت|ي)نشر/.test(norm(s(r[c]))))
    for (const x of SCHEMA) {
      if (x.t === 'review_queue') continue
      const hasPriv = x.cols.includes('privacy')
      keep[x.t] = (data[x.t] || []).filter((r) => {
        const ok = (!hasPriv || levelOf(r.privacy) === 'pub') && !marked(r, x.cols)
        if (!ok && x.prefix) hidden.add(s(r[x.pk]))
        return ok
      })
    }
    // rows of tables without a privacy column (credits) follow the records they point to
    for (const x of SCHEMA) {
      if (!keep[x.t] || x.cols.includes('privacy') || !x.prefix && x.pk !== 'row_id') continue
      keep[x.t] = keep[x.t].filter((r) => !x.cols.some((c) => c !== x.pk && codesIn(s(r[c])).some((k) => hidden.has(k))))
    }
    const wb = XLSX.utils.book_new()
    const sumRows: (string | number)[][] = [['sheet', 'rows_all', 'rows_public']]
    for (const x of SCHEMA) {
      if (!keep[x.t]) continue
      sumRows.push([FILE[x.t], (data[x.t] || []).length, keep[x.t].length])
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([x.cols, ...keep[x.t].map((r) => x.cols.map((c) => s(r[c])))]), FILE[x.t])
    }
    const day = new Date().toISOString().slice(0, 10)
    const note = [['AHR public export', day], ['Excluded: internal and maximum-privacy rows, rows with blank privacy, rows marked do-not-publish, the review queue, and credits pointing to excluded records.'], ['Free text may still mention a code of an excluded record; check before publishing.'], [], ...sumRows]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(note), 'README')
    XLSX.writeFile(wb, `AHR_Public_Export_${day}.xlsx`)
    setMsg(t('pxDone', lang))
  }

  // ---------- screens ----------
  if (!ready) return <div className="status">{t('loading', lang)}</div>
  if (!session) return <Login lang={lang} setLang={setLang} />
  if (!allowed) {
    return (
      <div className="login">
        <div className="err">{t('noAccess', lang)}</div>
        <button className="btn" onClick={() => sb().auth.signOut()}>{t('logout', lang)}</button>
      </div>
    )
  }

  const titleCol = TITLE[tab]
  const titleField = tb.fields.find((f) => f.c === titleCol)
  const pick = (r: Row, f: Field | undefined, c: string) => (lang === 'en' && f?.e ? s(r[f.e]) || s(r[c]) : s(r[c]))
  const subCol = SUB[tab]
  const subField = tb.fields.find((f) => f.c === subCol)

  const plain = (x: string) => x.replace(/^[^\p{L}\p{N}]+/u, '')
  const openTab = (tb: string) => { setTab(tb); setView('table'); setQ(''); setEmptyCol(''); setLvl(''); setPubF(''); setLinkF(''); setNav(false) }
  const goView = (v: typeof view) => { setView(v); setNav(false) }
  const openQueue = (data.review_queue || []).filter((r) => s(r.status).trim() === 'مفتوحة').length
  const GROUPS: { k: string; tables: string[] }[] = [
    { k: 'nvArchive', tables: ['works', 'credits', 'person', 'work_relationship', 'project_items', 'youtube_videos', 'events', 'press', 'press_links', 'sources', 'media_assets', 'awards'] },
    { k: 'nvProfile', tables: ['life_story', 'roles_education', 'training_choir', 'audience_voices', 'site_texts', 'contact_channels'] },
    { k: 'nvRef', tables: ['review_queue', 'ref_relationship_type'] },
  ]
  const TOOLS: { v: typeof view; k: string; icon: string }[] = [
    { v: 'albums', k: 'hAlbums', icon: 'layers' }, { v: 'timeline', k: 'hTime', icon: 'calendar' }, { v: 'search', k: 'hSearch', icon: 'search' },
    { v: 'confirm', k: 'hConfirm', icon: 'check' }, { v: 'ready', k: 'hReady', icon: 'doc' }, { v: 'preview', k: 'hPrev', icon: 'eye' },
    { v: 'health', k: 'hHealth', icon: 'link' }, { v: 'translate', k: 'hTrans', icon: 'translate' }, { v: 'privacy', k: 'hPriv', icon: 'lock' },
    { v: 'history', k: 'hHist', icon: 'history' }, { v: 'assistant', k: 'hAsst', icon: 'bot' },
  ]

  return (
    <div className="shell">
      {nav && <div className="scrim" onClick={() => setNav(false)} />}
      <aside className={'side' + (nav ? ' open' : '')}>
        <div className="brand">
          <div className="logo"><span className="a">AHR</span> <span className="d">Data</span></div>
          <div className="bs">{t('brandSub', lang)}</div>
        </div>
        <nav>
          <button className={'ni' + (view === 'home' ? ' on' : '')} onClick={() => goView('home')}><Icon n="home" /><span>{plain(t('hHome', lang))}</span></button>
          {GROUPS.map((g) => (
            <div key={g.k}>
              <div className="ng">{t(g.k, lang)}</div>
              {g.tables.map((tbn) => {
                const x = SCHEMA.find((y) => y.t === tbn); if (!x) return null
                return (
                  <button key={tbn} className={'ni' + (view === 'table' && tab === tbn ? ' on' : '')} onClick={() => openTab(tbn)}>
                    <Icon n={TABLE_ICON[tbn]} /><span>{lang === 'ar' ? x.ar : x.en}</span>
                    {tbn === 'review_queue' && openQueue > 0 ? <b className="badge">{openQueue}</b> : <small>{(data[tbn] || []).length}</small>}
                  </button>
                )
              })}
            </div>
          ))}
          <div className="ng">{t('nvTools', lang)}</div>
          {TOOLS.map((x) => (
            <button key={x.v} className={'ni' + (view === x.v ? ' on' : '')} onClick={() => goView(view === x.v ? 'home' : x.v)}><Icon n={x.icon} /><span>{plain(t(x.k, lang))}</span></button>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="burger" onClick={() => setNav(true)} aria-label="menu"><Icon n="menu" /></button>
          <label className="gsearch">
            <Icon n="search" size={20} />
            <input value={gq} placeholder={t('gSearch', lang)} onChange={(e) => { setGq(e.target.value); setView(e.target.value.trim() ? 'search' : 'home') }} />
          </label>
          <button className="btn pri" onClick={() => setUploading(true)}>{t('upload', lang)}</button>
          <details className="menu">
            <summary aria-label="menu"><span className="avatar">AHR</span><Icon n="chevron" size={14} /></summary>
            <div className="mpop">
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{lang === 'ar' ? 'English' : 'العربية'}</button>
              <button onClick={() => goView(view === 'gaps' ? 'home' : 'gaps')}>{t('gaps', lang)}</button>
              <button onClick={exportXlsx}>{t('export', lang)}</button>
              <button title={t('pxHint', lang)} onClick={exportPublic}>{plain(t('hPubX', lang))}</button>
              <button onClick={() => sb().auth.signOut()}>{t('logout', lang)}</button>
            </div>
          </details>
        </header>
        <div className="content">
      {msg && <div className="status" style={{ paddingTop: 8 }}>{msg}</div>}
      {loading && <div className="status" style={{ paddingTop: 8 }}>{t('loading', lang)}</div>}

      {view === 'home' ? (
        <Home lang={lang} data={data} graph={graph} onTab={openTab}
          onView={(v) => goView(v)} onOpen={(t2, pk) => openRecord(t2, pk)} onNew={(tb) => { openTab(tb); setWantNew(tb) }} />
      ) : view === 'assistant' ? (
        <Assistant lang={lang} token={session?.access_token || ''} msgs={asMsgs} setMsgs={setAsMsgs} onApply={applyAssistant}
          onOpen={(t2, pk) => { const d = t2 ? SCHEMA.find((x) => x.t === t2) : SCHEMA.find((x) => x.prefix && pk.startsWith(x.prefix)); if (d) openRecord(d.t, pk) }} />
      ) : view === 'albums' ? (
        <Albums lang={lang} data={data} onOpen={(t2, pk) => openRecord(t2, pk)} />
      ) : view === 'confirm' ? (
        <Confirm lang={lang} data={data} onOpen={(t2, pk) => openRecord(t2, pk)} />
      ) : view === 'ready' ? (
        <Ready lang={lang} data={data} onOpen={(t2, pk) => openRecord(t2, pk)} />
      ) : view === 'preview' ? (
        <Preview lang={lang} data={data} onOpen={(t2, pk) => openRecord(t2, pk)} />
      ) : view === 'health' ? (
        <Health lang={lang} data={data} graph={graph} token={session?.access_token || ''} onOpen={(t2, pk) => openRecord(t2, pk)} />
      ) : view === 'translate' ? (
        <Translate lang={lang} data={data} token={session?.access_token || ''} onSave={applyPatches} />
      ) : view === 'privacy' ? (
        <div className="pane">
          <div className="status" style={{ padding: 0 }}>{t('pvHint', lang)}</div>
          {SCHEMA.filter((x) => x.cols.includes('privacy')).map((x) => {
            const list = data[x.t] || []
            const n = (l: Level) => list.filter((r) => levelOf(r.privacy) === l).length
            const names: Record<Level, string> = { pub: t('pvPublic', lang), int: t('pvInternal', lang), max: t('pvMax', lang), none: t('pvBlank', lang) }
            return (
              <div key={x.t} className="qi">
                <div className="grp" style={{ marginTop: 0 }}>{x.icon} {lang === 'ar' ? x.ar : x.en} — {t('pvTotal', lang)} {list.length}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {LEVELS.filter((l) => l !== 'none' || n(l) > 0).map((l) => (
                    <button key={l} className={'btn' + (l === 'int' || l === 'max' ? ' bad' : '')} disabled={!n(l)} onClick={() => { setTab(x.t); setView('table'); setQ(''); setEmptyCol(''); setLvl(l) }}>{names[l]}: <b>{n(l)}</b></button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : view === 'search' ? (
        <Search lang={lang} data={data} q={gq} onOpen={(t2, pk) => openRecord(t2, pk)} />
      ) : view === 'timeline' ? (
        <Timeline lang={lang} data={data} onOpen={(t2, pk) => openRecord(t2, pk)} />
      ) : view === 'history' ? (
        <History lang={lang} onOpen={(t2, pk) => openRecord(t2, pk)} onChanged={reloadTable} />
      ) : view === 'gaps' ? (
        <div style={{ paddingBottom: 60 }}>
          <div className="status" style={{ paddingTop: 10 }}>{t('gapsHint', lang)}</div>
          {gaps.map(({ x, cols }) => (
            <div key={x.t}>
              <div className="gapt">{x.icon} {lang === 'ar' ? x.ar : x.en}</div>
              <div style={{ display: 'grid', gap: 6, padding: '0 12px' }}>
                {cols.filter((g) => !OPTIONAL.test(g.c)).map((g) => (
                  <div key={g.c} className="gap" onClick={() => { setTab(x.t); setView('table'); setEmptyCol(g.c); setQ(''); setLvl('') }}>
                    <span>{labelOf(g.c, lang)}</span><b>{g.n}</b>
                  </div>
                ))}
                {cols.some((g) => OPTIONAL.test(g.c)) && <div className="status" style={{ padding: '6px 0 0' }}>{t('gapsOpt', lang)}</div>}
                {cols.filter((g) => OPTIONAL.test(g.c)).map((g) => (
                  <div key={g.c} className="gap" style={{ opacity: 0.6 }} onClick={() => { setTab(x.t); setView('table'); setEmptyCol(g.c); setQ(''); setLvl('') }}>
                    <span>{labelOf(g.c, lang)}</span><b>{g.n}</b>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="phd">
            <span className="pico"><Icon n={TABLE_ICON[tab] || 'doc'} size={26} /></span>
            <div className="ptt"><h2>{lang === 'ar' ? tb.ar : tb.en}</h2><div className="psub">{(data[tab] || []).length} {t('records', lang)}</div></div>
          </div>
          <div className="bar">
            <input value={q} placeholder={t('search', lang)} onChange={(e) => setQ(e.target.value)} />
            <select value={emptyCol} onChange={(e) => setEmptyCol(e.target.value)}>
              <option value="">{t('emptyIn', lang)}: {t('all', lang)}</option>
              {tb.cols.filter((c) => c !== tb.pk).map((c) => <option key={c} value={c}>{labelOf(c, lang)}{c.endsWith('_en') ? ' (EN)' : ''}</option>)}
            </select>
            {tb.cols.includes('privacy') && (
              <select value={lvl} onChange={(e) => setLvl(e.target.value as Level | '')}>
                <option value="">{t('pvFilter', lang)}: {t('all', lang)}</option>
                {LEVELS.map((l) => <option key={l} value={l}>{t(l === 'pub' ? 'pvPublic' : l === 'int' ? 'pvInternal' : l === 'max' ? 'pvMax' : 'pvBlank', lang)}</option>)}
              </select>
            )}
            {tab === 'works' && (
              <select value={linkF} onChange={(e) => setLinkF(e.target.value)}>
                <option value="">{t('linkF', lang)}: {t('all', lang)}</option>
                <option value="_any">{t('linkNone', lang)}</option>
                {tb.cols.filter((c) => c.startsWith('link_')).map((c) => <option key={c} value={c}>{t('linkNo', lang)} {labelOf(c, lang)}</option>)}
              </select>
            )}
            {tab === 'project_items' && (
              <select value={projF} onChange={(e) => setProjF(e.target.value)}>
                <option value="">{t('projAll', lang)}</option>
                {Array.from(new Set(rows.map((r) => s(r.project)).filter(Boolean))).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
            {tb.cols.includes('publish') && (
              <>
                <select value={pubF} onChange={(e) => setPubF(e.target.value)}>
                  <option value="">{t('pubFilter', lang)}: {t('all', lang)}</option>
                  <option value="نعم">{t('pubYes', lang)}</option>
                  <option value="لا">{t('pubNo', lang)}</option>
                  <option value="_">{t('pubUndec', lang)}</option>
                </select>
                <button className="btn" onClick={publishShown}>{t('pubBulk', lang)}</button>
              </>
            )}
            {tb.t !== 'ref_relationship_type' && <button className="btn pri" onClick={startNew}>{t('add', lang)}</button>}
            <span className="status">{shown.length} {t('rows', lang)}</span>
          </div>
          <div className="list">
            {shown.length === 0 && <div className="status">{t('none', lang)}</div>}
            {shown.map((r) => (
              <div key={s(r[tb.pk])} className="row" onClick={() => setEditing({ row: { ...r }, isNew: false })}>
                {tab === 'media_assets' && s(r.link).startsWith('photos/') && <Photo className="thumb" path={s(r.link)} token={session?.access_token || ''} w={240} />}
                <div className="rt">
                  <div className="id">{tb.pk === 'row_id' ? '#' : ''}{s(r[tb.pk])}</div>
                  <div className="tt">{pick(r, titleField, titleCol) || '—'}</div>
                  <div className="st">{levelOf(r.privacy) === 'int' ? '🔒 ' + t('pvInternal', lang) + ' · ' : levelOf(r.privacy) === 'max' ? '🔒 ' + t('pvMax', lang) + ' · ' : ''}{pick(r, subField, subCol)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {full && (
        <div className="modal" style={{ alignItems: 'center', background: '#000d' }} onClick={() => setFull('')}>
          <Photo className="full" path={full} token={session?.access_token || ''} w={1800} />
        </div>
      )}

      {uploading && (
        <Uploader
          lang={lang}
          token={session?.access_token || ''}
          onClose={() => setUploading(false)}
          onDone={(row) => {
            setData((d) => ({ ...d, media_assets: [...(d.media_assets || []), row as Row].sort((a, b) => byteSort(s(a.media_id), s(b.media_id))) }))
            setMsg(t('upDone', lang))
            scheduleSync('media_assets')
          }}
        />
      )}

      {editing && merging && (
        <Merge
          lang={lang} table={tab} row={editing.row} data={data} graph={graph}
          onClose={() => setMerging(false)}
          onDone={(tables) => { setMerging(false); closeEditing(); tables.forEach((x) => reloadTable(x)); setMsg(t('mgDone', lang)) }}
        />
      )}

      {editing && !merging && (
        <div className="modal" onClick={() => closeEditing()}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            {trail.length > 0 && <button className="btn" style={{ marginBottom: 8 }} onClick={goBack}>{t('back', lang)}</button>}
            <h3 style={{ marginTop: 0 }}>{lang === 'ar' ? tb.ar : tb.en} — {s(editing.row[tb.pk])}</h3>
            {tab === 'media_assets' && s(editing.row.link).startsWith('photos/') && <Photo className="big" path={s(editing.row.link)} token={session?.access_token || ''} w={1000} onClick={() => setFull(s(editing.row.link))} />}
            {tb.fields.filter((f) => f.c !== tb.pk).map((f) => (
              <div className="f" key={f.c}>
                <label>{labelOf(f.c, lang)}</label>
                {(() => {
                  const lo = lists.get(f.c)
                  const cur = s(editing.row[f.c])
                  if (tb.t === 'work_relationship' && (f.c === 'source_work_id' || f.c === 'target_work_id')) {
                    // a relationship can never link a work to itself: the other end is excluded from the suggestions
                    const other = s(editing.row[f.c === 'source_work_id' ? 'target_work_id' : 'source_work_id'])
                    return <WorkPicker value={cur} selfId={other} data={data} lang={lang} onChange={(v) => setEditing({ ...editing, row: { ...editing.row, [f.c]: v } })} />
                  }
                  if (tb.t === 'work_relationship' && f.c === 'relationship_type') {
                    const types = (data.ref_relationship_type || []).filter((r) => r.active !== false)
                    return (
                      <select value={cur} onChange={(e) => setEditing({ ...editing, row: { ...editing.row, relationship_type: e.target.value } })}>
                        <option value="">{t('listPick', lang)}</option>
                        {types.map((r) => <option key={s(r.code)} value={s(r.code)}>{lang === 'en' ? s(r.label_en) || s(r.label_ar) : s(r.label_ar)}</option>)}
                      </select>
                    )
                  }
                  if (f.c === 'parent_work_id') {
                    return <WorkPicker value={cur} selfId={s(editing.row[tb.pk])} data={data} lang={lang} onChange={(v) => setEditing({ ...editing, row: { ...editing.row, parent_work_id: v } })} />
                  }
                  if (lo && !customCols.includes(f.c)) {
                    const opts = cur && !lo.vals.includes(cur) ? [cur, ...lo.vals] : lo.vals
                    return (
                      <div className="pair">
                        <div>
                          {f.e && <div className="tag">{t('arCol', lang)}</div>}
                          <select value={cur} onChange={(e) => {
                            const v = e.target.value
                            if (v === '__new') { setCustomCols([...customCols, f.c]); return }
                            const en = f.e ? lo.en.get(v) : undefined
                            setEditing({ ...editing, row: { ...editing.row, [f.c]: v, ...(f.e && en !== undefined ? { [f.e]: en } : {}) } })
                          }}>
                            <option value="">{t('listPick', lang)}</option>
                            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                            <option value="__new">{t('listNew', lang)}</option>
                          </select>
                        </div>
                        {f.e && <Input val={s(editing.row[f.e])} tag={t('enCol', lang)} onChange={(v) => setEditing({ ...editing, row: { ...editing.row, [f.e as string]: v } })} />}
                      </div>
                    )
                  }
                  return (
                    <>
                      <div className="pair">
                        <Input val={cur} tag={f.e ? t('arCol', lang) : ''} onChange={(v) => setEditing({ ...editing, row: { ...editing.row, [f.c]: v } })} />
                        {f.e && <Input val={s(editing.row[f.e])} tag={t('enCol', lang)} onChange={(v) => setEditing({ ...editing, row: { ...editing.row, [f.e as string]: v } })} />}
                      </div>
                      {lo && <button className="btn" style={{ marginTop: 4 }} onClick={() => setCustomCols(customCols.filter((x) => x !== f.c))}>{t('listBack', lang)}</button>}
                    </>
                  )
                })()}
                {!editing.isNew && <Chips codes={codesIn(s(editing.row[f.c]) + ' ' + (f.e ? s(editing.row[f.e]) : '')).filter((c) => c !== s(editing.row[tb.pk]))} graph={graph} data={data} lang={lang} onOpen={(t2, pk) => openRecord(t2, pk)} />}
              </div>
            ))}
            {!editing.isNew && <RecordHistory lang={lang} table={tab} pk={s(editing.row[tb.pk])} />}
            {!editing.isNew && <Related table={tab} row={editing.row} graph={graph} data={data} lang={lang} onOpen={(t2, pk) => openRecord(t2, pk)} />}
            <div className="acts">
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn pri" onClick={save}>{t('save', lang)}</button>
                <button className="btn" onClick={() => closeEditing()}>{t('cancel', lang)}</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!editing.isNew && tb.prefix && <button className="btn" onClick={() => setMerging(true)}>{t('mgBtn', lang)}</button>}
                {!editing.isNew && <button className="btn bad" onClick={remove}>{t('del', lang)}</button>}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

function Input({ val, tag, onChange }: { val: string; tag: string; onChange: (v: string) => void }) {
  const long = val.length > 60 || val.includes('\n')
  return (
    <div>
      {tag && <div className="tag">{tag}</div>}
      {long ? <textarea rows={4} value={val} onChange={(e) => onChange(e.target.value)} /> : <input value={val} onChange={(e) => onChange(e.target.value)} />}
    </div>
  )
}

function Login({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  async function go() {
    setErr(''); setInfo('')
    const { error } = await sb().auth.signInWithPassword({ email, password: pw })
    if (error) setErr(error.message)
  }
  async function up() {
    setErr(''); setInfo('')
    if (email.trim().toLowerCase() !== OWNER) { setErr(t('noAccess', lang)); return }
    const { error } = await sb().auth.signUp({ email, password: pw })
    if (error) setErr(error.message)
    else setInfo(t('signupDone', lang))
  }
  return (
    <div className="login">
      <h2 style={{ margin: 0 }}>{t('title', lang)}</h2>
      <input type="email" placeholder={t('email', lang)} value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder={t('password', lang)} value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
      {err && <div className="err">{err}</div>}
      {info && <div className="status">{info}</div>}
      <button className="btn pri" onClick={go}>{t('login', lang)}</button>
      <button className="btn" onClick={up}>{t('signup', lang)}</button>
      <button className="btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>{lang === 'ar' ? 'English' : 'العربية'}</button>
    </div>
  )
}
