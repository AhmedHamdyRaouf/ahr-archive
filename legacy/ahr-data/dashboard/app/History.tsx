'use client'
// Change history: every insert / update / delete made on the 15 tables (recorded by a database trigger), with undo.
import { useCallback, useEffect, useState } from 'react'
import { sb } from '@/lib/supabase'
import { SCHEMA, LABELS_AR } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'
import { tableLabel, TITLE } from '@/lib/meta'

type J = Record<string, unknown>
type Log = { id: number; at: string; by_user: string | null; tbl: string; pk: string; action: 'insert' | 'update' | 'delete'; before: J | null; after: J | null }

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v))
const cut = (v: string) => (v.length > 160 ? v.slice(0, 160) + '…' : v)
const humanize = (c: string) => c.replace(/_en$/, ' (EN)').replace(/_/g, ' ')

export default function History({ lang, onOpen, onChanged }: { lang: Lang; onOpen: (t: string, pk: string) => void; onChanged: (table: string) => void }) {
  const [rows, setRows] = useState<Log[]>([])
  const [more, setMore] = useState(true)
  const [sel, setSel] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (from: number) => {
    const { data, error } = await sb().from('change_log').select('*').order('id', { ascending: false }).range(from, from + 49)
    if (error) { setNote(`${t('error', lang)}: ${error.message}`); return }
    const list = (data || []) as Log[]
    setRows((r) => (from === 0 ? list : [...r, ...list]))
    setMore(list.length === 50)
  }, [lang])

  useEffect(() => { load(0) }, [load])

  const when = (at: string) => new Date(at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' })
  const act = (a: Log['action']) => t(a === 'insert' ? 'hiInsert' : a === 'update' ? 'hiUpdate' : 'hiDelete', lang)
  const label = (c: string) => (lang === 'ar' ? LABELS_AR[c] || humanize(c) : humanize(c))
  const nameOf = (l: Log) => str((l.after || l.before || {})[TITLE[l.tbl]])
  const changed = (l: Log) => Object.keys(l.after || {}).filter((k) => JSON.stringify((l.before || {})[k]) !== JSON.stringify((l.after || {})[k]))

  async function undo(l: Log) {
    const def = SCHEMA.find((x) => x.t === l.tbl)
    if (!def) return
    if (!window.confirm(l.action === 'insert' ? t('hiUndoInsert', lang) : t('hiUndoAsk', lang))) return
    setBusy(true); setNote('')
    const res =
      l.action === 'update' ? await sb().from(l.tbl).update(l.before as J).eq(def.pk, l.pk)
      : l.action === 'insert' ? await sb().from(l.tbl).delete().eq(def.pk, l.pk)
      : await sb().from(l.tbl).insert(l.before as J)
    setBusy(false)
    if (res.error) { setNote(`${t('error', lang)}: ${res.error.message}`); return }
    setNote(t('hiDone', lang) + (l.tbl === 'media_assets' && l.action === 'insert' ? ' — ' + t('hiMediaNote', lang) : ''))
    setSel(null)
    onChanged(l.tbl)
    load(0)
  }

  return (
    <div className="pane">
      <h3 style={{ margin: 0 }}>{t('hiTitle', lang)}</h3>
      <div className="status" style={{ padding: 0 }}>{t('hiHint', lang)}</div>
      {note && <div className={note.startsWith(t('hiDone', lang)) ? 'ok' : 'err'}>{note}</div>}
      {rows.length === 0 && <div className="status" style={{ padding: 0 }}>{t('hiEmpty', lang)}</div>}
      {rows.map((l) => (
        <div key={l.id} className="qi" style={{ cursor: 'pointer' }} onClick={() => setSel(sel === l.id ? null : l.id)}>
          <div style={{ fontSize: 12, color: 'var(--mute)' }}>{when(l.at)} · {act(l.action)} · {tableLabel(l.tbl, lang)}</div>
          <div><b style={{ color: 'var(--acc)' }}>{l.pk}</b> {nameOf(l).slice(0, 70)}</div>
          {sel === l.id && (
            <div onClick={(e) => e.stopPropagation()}>
              {l.action === 'update' && changed(l).map((k) => (
                <div key={k} className="diff">
                  <b>{label(k)}</b>{'\n'}
                  <span className="b">{t('hiBefore', lang)}: {cut(str((l.before || {})[k])) || '—'}</span>{'\n'}
                  <span className="a">{t('hiAfter', lang)}: {cut(str((l.after || {})[k])) || '—'}</span>
                </div>
              ))}
              {l.action !== 'update' && <div className="diff">{cut(Object.entries((l.after || l.before || {}) as J).filter(([, v]) => str(v)).map(([k, v]) => `${label(k)}: ${str(v)}`).join('\n'))}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <button className="btn bad" disabled={busy} onClick={() => undo(l)}>{t('hiUndo', lang)}</button>
                {l.action !== 'delete' && <button className="btn" onClick={() => onOpen(l.tbl, l.pk)}>{t('hiOpen', lang)}</button>}
              </div>
            </div>
          )}
        </div>
      ))}
      {more && rows.length > 0 && <div><button className="btn" onClick={() => load(rows.length)}>{t('hiMore', lang)}</button></div>}
    </div>
  )
}
