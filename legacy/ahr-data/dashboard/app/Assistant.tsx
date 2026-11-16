'use client'
// Chat with the assistant. The assistant reads the archive and proposes changes; a proposal is saved only when the owner taps apply.
import { useEffect, useRef, useState } from 'react'
import { t, Lang } from '@/lib/i18n'
import { SCHEMA } from '@/lib/schema'

export type AChange = { kind: 'update' | 'insert'; table: string; pk?: string; fields: Record<string, string> }
export type AProposal = { summary: string; changes: AChange[]; state?: 'applied' | 'dismissed' | string }
export type AMsg = { role: 'user' | 'assistant'; content: string; proposals?: AProposal[] }

export default function Assistant({ lang, token, msgs, setMsgs, onApply, onOpen }: {
  lang: Lang; token: string; msgs: AMsg[]; setMsgs: (f: (m: AMsg[]) => AMsg[]) => void
  onApply: (c: AChange[]) => Promise<string>; onOpen: (t: string, pk: string) => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, busy])

  async function send() {
    const q = text.trim()
    if (!q || busy) return
    const next: AMsg[] = [...msgs, { role: 'user', content: q }]
    setMsgs(() => next); setText(''); setBusy(true)
    try {
      const r = await fetch('/api/assistant', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }) })
      const j = (await r.json()) as { reply?: string; proposals?: AProposal[]; code?: string }
      const reply = r.ok ? j.reply || '…' : j.code === 'no_ai' ? t('asNoKey', lang) : t('asFail', lang)
      setMsgs((m) => [...m, { role: 'assistant', content: reply, proposals: j.proposals?.length ? j.proposals : undefined }])
    } catch { setMsgs((m) => [...m, { role: 'assistant', content: t('asFail', lang) }]) }
    setBusy(false)
  }

  async function apply(mi: number, pi: number) {
    const p = msgs[mi].proposals?.[pi]
    if (!p || p.state) return
    const err = await onApply(p.changes)
    setMsgs((m) => m.map((x, i) => (i !== mi ? x : { ...x, proposals: x.proposals?.map((y, k) => (k === pi ? { ...y, state: err ? `⚠️ ${err}` : 'applied' } : y)) })))
  }
  const dismiss = (mi: number, pi: number) => setMsgs((m) => m.map((x, i) => (i !== mi ? x : { ...x, proposals: x.proposals?.map((y, k) => (k === pi ? { ...y, state: 'dismissed' } : y)) })))
  const label = (tb: string) => { const d = SCHEMA.find((x) => x.t === tb); return d ? (lang === 'ar' ? d.ar : d.en) : tb }

  return (
    <div className="pane" style={{ paddingBottom: 90 }}>
      {!msgs.length && <div className="status" style={{ padding: 0 }}>{t('asHint', lang)}</div>}
      {msgs.map((m, i) => (
        <div key={i} className="qi" style={{ background: m.role === 'user' ? 'var(--card)' : 'transparent', whiteSpace: 'pre-wrap' }}>
          {m.content.split(/([A-Z]{1,3}-\d{4})/g).map((part, k) => /^[A-Z]{1,3}-\d{4}$/.test(part)
            ? <a key={k} href="#" onClick={(e) => { e.preventDefault(); onOpen('', part) }} style={{ textDecoration: 'underline' }}>{part}</a>
            : <span key={k}>{part}</span>)}
          {m.proposals?.map((p, pi) => (
            <div key={pi} className="qi" style={{ marginTop: 8, border: '1px solid var(--line)' }}>
              <div className="grp" style={{ marginTop: 0 }}>{p.summary}</div>
              {p.changes.map((c, ci) => (
                <div key={ci} style={{ fontSize: 13, marginTop: 6 }}>
                  <b>{c.kind === 'insert' ? t('asNew', lang) : c.pk}</b> · {label(c.table)}
                  {Object.entries(c.fields).map(([k, v]) => <div key={k} style={{ opacity: 0.85 }}>{k}: {v.length > 160 ? v.slice(0, 160) + '…' : v}</div>)}
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {!p.state ? (<>
                  <button className="btn pri" onClick={() => apply(i, pi)}>{t('asApply', lang)}</button>
                  <button className="btn" onClick={() => dismiss(i, pi)}>{t('asSkip', lang)}</button>
                </>) : <span className="status" style={{ padding: 0 }}>{p.state === 'applied' ? t('saved', lang) : p.state === 'dismissed' ? t('asSkipped', lang) : p.state}</span>}
              </div>
            </div>
          ))}
        </div>
      ))}
      {busy && <div className="status">{t('asBusy', lang)}</div>}
      <div ref={end} />
      <div style={{ position: 'fixed', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, display: 'flex', gap: 6, padding: 10, background: 'var(--bg, #fff)', borderTop: '1px solid var(--line)' }}>
        <textarea value={text} rows={2} style={{ flex: 1 }} placeholder={t('asPh', lang)} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }} />
        <button className="btn pri" disabled={busy || !text.trim()} onClick={() => void send()}>{t('asSend', lang)}</button>
        {!!msgs.length && <button className="btn" onClick={() => setMsgs(() => [])}>{t('asClear', lang)}</button>}
      </div>
    </div>
  )
}
