'use client'
// Change history of one open record (from the change_log table, written by a database trigger).
import { useEffect, useState } from 'react'
import { sb } from '@/lib/supabase'
import { LABELS_AR } from '@/lib/schema'
import { t, Lang } from '@/lib/i18n'

type J = Record<string, unknown>
type Log = { id: number; at: string; action: 'insert' | 'update' | 'delete'; before: J | null; after: J | null }
const str = (v: unknown) => (v === null || v === undefined ? '' : String(v))
const cut = (v: string) => (v.length > 120 ? v.slice(0, 120) + '…' : v)

export default function RecordHistory({ lang, table, pk }: { lang: Lang; table: string; pk: string }) {
  const [rows, setRows] = useState<Log[] | null>(null)
  useEffect(() => {
    let live = true
    setRows(null)
    sb().from('change_log').select('id,at,action,before,after').eq('tbl', table).eq('pk', pk).order('id', { ascending: false }).limit(10)
      .then(({ data }) => { if (live) setRows((data || []) as Log[]) })
    return () => { live = false }
  }, [table, pk])
  if (rows === null) return null
  const label = (c: string) => (lang === 'ar' ? LABELS_AR[c] || c.replace(/_/g, ' ') : c.replace(/_/g, ' '))
  const when = (at: string) => new Date(at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'short' })
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="grp">🕘 {t('rhTitle', lang)}</div>
      {rows.length === 0 && <div className="status" style={{ padding: 0 }}>{t('rhNone', lang)}</div>}
      {rows.map((l) => {
        const keys = l.action === 'update' ? Object.keys(l.after || {}).filter((k) => JSON.stringify((l.before || {})[k]) !== JSON.stringify((l.after || {})[k])) : []
        return (
          <div key={l.id} className="qi">
            <div style={{ fontSize: 12, color: 'var(--mute)' }}>{when(l.at)} · {t(l.action === 'insert' ? 'hiInsert' : l.action === 'update' ? 'hiUpdate' : 'hiDelete', lang)}</div>
            {keys.slice(0, 6).map((k) => (
              <div key={k} className="diff">
                <b>{label(k)}</b>{'\n'}
                <span className="b">{t('hiBefore', lang)}: {cut(str((l.before || {})[k])) || '—'}</span>{'\n'}
                <span className="a">{t('hiAfter', lang)}: {cut(str((l.after || {})[k])) || '—'}</span>
              </div>
            ))}
            {keys.length > 6 && <div className="status" style={{ padding: 0 }}>+{keys.length - 6}</div>}
          </div>
        )
      })}
    </div>
  )
}
