'use client'
// Photo upload queue: pick one or many photos, write each one's description, then upload them one after another
// (each is shrunk only if too big for one request and sent to /api/upload).
import { useEffect, useState } from 'react'
import { t, Lang } from '@/lib/i18n'

const MAX = 4_000_000 // keep under the ~4.5 MB request limit

// git blob hash of the original bytes (matches how GitHub identifies a file), used to spot a photo already in the archive
async function blobSha1(buf: ArrayBuffer) {
  const head = new TextEncoder().encode(`blob ${buf.byteLength}\0`)
  const all = new Uint8Array(head.length + buf.byteLength)
  all.set(head, 0)
  all.set(new Uint8Array(buf), head.length)
  const d = await crypto.subtle.digest('SHA-1', all)
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  let side = Math.min(2600, Math.max(bmp.width, bmp.height))
  let q = 0.88
  for (let i = 0; i < 8; i++) {
    const k = Math.min(1, side / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * k)
    c.height = Math.round(bmp.height * k)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', q))
    if (blob && blob.size <= MAX) return blob
    q = Math.max(0.6, q - 0.08)
    side = Math.round(side * 0.85)
  }
  throw new Error('too_big')
}

type Item = { id: number; blob: Blob | null; orig: string; url: string; desc: string; privacy: string; state: 'prep' | 'ready' | 'sending' | 'done' | 'error'; note: string }
let seq = 0

export default function Uploader({ lang, token, onClose, onDone }: {
  lang: Lang
  token: string
  onClose: () => void
  onDone: (row: Record<string, string>) => void
}) {
  const [items, setItems] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => () => { items.forEach((i) => i.url && URL.revokeObjectURL(i.url)) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (id: number, p: Partial<Item>) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i)))

  async function pick(files: FileList | null) {
    if (!files) return
    for (const f of Array.from(files)) {
      const id = ++seq
      setItems((l) => [...l, { id, blob: null, orig: '', url: '', desc: '', privacy: 'عام', state: 'prep', note: '' }])
      try {
        const orig = await blobSha1(await f.arrayBuffer())
        const ok = (f.type === 'image/jpeg' || f.type === 'image/png') && f.size <= MAX
        const b = ok ? f : await shrink(f)
        patch(id, { blob: b, orig, url: URL.createObjectURL(b), state: 'ready' })
      } catch { patch(id, { state: 'error', note: t('upReadFail', lang) }) }
    }
  }

  async function sendOne(i: Item) {
    if (!i.blob) return
    patch(i.id, { state: 'sending', note: '' })
    const fd = new FormData()
    fd.append('file', i.blob, 'photo')
    fd.append('orig', i.orig)
    fd.append('privacy', i.privacy)
    fd.append('title_en', '')
    fd.append('desc_ar', i.desc.trim())
    fd.append('desc_en', '')
    try {
      const r = await fetch('/api/upload', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: fd })
      const j = await r.json().catch(() => ({}))
      if (r.ok) { onDone(j.row); patch(i.id, { state: 'done', note: `${t('upOk', lang)}: ${j.media_id}${j.ai ? '' : ' — ' + t('upNoAi', lang)}` }) }
      else if (r.status === 409) patch(i.id, { state: 'error', note: `${t('upDup', lang)} (${j.existing})` })
      else if (r.status === 413) patch(i.id, { state: 'error', note: t('upBig', lang) })
      else if (j.code === 'not_configured') patch(i.id, { state: 'error', note: t('syncOff', lang) })
      else patch(i.id, { state: 'error', note: `${t('error', lang)}: ${j.error || r.status}` })
    } catch { patch(i.id, { state: 'error', note: t('error', lang) }) }
  }

  // one after another: each upload reads the repository and takes the next free media id
  async function sendAll() {
    setBusy(true)
    for (const i of items.filter((x) => (x.state === 'ready' || (x.state === 'error' && x.blob)) && x.desc.trim())) await sendOne(i)
    setBusy(false)
  }

  const pending = items.filter((i) => i.blob && (i.state === 'ready' || i.state === 'error'))
  const missingDesc = pending.some((i) => !i.desc.trim())
  const canSend = pending.length > 0 && !missingDesc && !busy && !items.some((i) => i.state === 'prep')

  return (
    <div className="modal" onClick={busy ? undefined : onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{t('upTitle', lang)}</h3>
        <div className="status" style={{ paddingTop: 0 }}>{t('upRules', lang)}</div>
        <div className="f">
          <label>{t('upPick', lang)}</label>
          <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
        </div>
        {items.map((i) => (
          <div key={i.id} className="qi">
            {i.url && <img src={i.url} alt="" />}
            {i.state === 'prep' && <div className="status" style={{ padding: 0 }}>…</div>}
            {i.state !== 'done' && i.state !== 'prep' && i.blob && (
              <>
                <div className="f" style={{ marginTop: 6 }}>
                  <label>{t('upEach', lang)} *</label>
                  <textarea rows={4} value={i.desc} disabled={i.state === 'sending'} placeholder={t('upDescHint', lang)} onChange={(e) => patch(i.id, { desc: e.target.value })} />
                </div>
                <div className="f" style={{ marginBottom: 4 }}>
                  <select value={i.privacy} disabled={i.state === 'sending'} onChange={(e) => patch(i.id, { privacy: e.target.value })}>
                    <option value="عام">{t('upPublic', lang)}</option>
                    <option value="داخلي">{t('upInternal', lang)}</option>
                  </select>
                </div>
              </>
            )}
            {i.state === 'sending' && <div className="status" style={{ padding: 0 }}>{t('upSending', lang)}</div>}
            {i.note && <div className={i.state === 'done' ? 'ok' : 'err'}>{i.note}</div>}
            {i.state !== 'sending' && i.state !== 'done' && !busy && (
              <button className="btn" onClick={() => { if (i.url) URL.revokeObjectURL(i.url); setItems((l) => l.filter((x) => x.id !== i.id)) }}>{t('upRemove', lang)}</button>
            )}
          </div>
        ))}
        {missingDesc && !busy && <div className="status" style={{ padding: 0 }}>{t('upNeedDesc', lang)}</div>}
        <div className="acts">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn pri" disabled={!canSend} onClick={sendAll}>{busy ? t('upBusy', lang) : `${t('upAll', lang)}${pending.length ? ` (${pending.length})` : ''}`}</button>
            <button className="btn" disabled={busy} onClick={onClose}>{t('cancel', lang)}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
