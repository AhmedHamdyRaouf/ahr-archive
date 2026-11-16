'use client'
// Shows one archive photo. The photo is fetched with the owner's token (the data repo is private), only when it scrolls into view.
import { useEffect, useRef, useState } from 'react'

const cache = new Map<string, string>()

export default function Photo({ path, token, w, className, onClick }: { path: string; token: string; w: number; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const key = `${path}@${w}`
  const [src, setSrc] = useState(cache.get(key) || '')
  const [state, setState] = useState<'idle' | 'load' | 'fail'>('idle')

  useEffect(() => {
    if (src || !path.startsWith('photos/') || !token) return
    const el = ref.current
    if (!el) return
    let dead = false
    const go = async () => {
      setState('load')
      try {
        const r = await fetch(`/api/photo?path=${encodeURIComponent(path)}&w=${w}`, { headers: { authorization: `Bearer ${token}` } })
        if (!r.ok) throw new Error(String(r.status))
        const u = URL.createObjectURL(await r.blob())
        cache.set(key, u)
        if (!dead) { setSrc(u); setState('idle') }
      } catch { if (!dead) setState('fail') }
    }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); go() } }, { rootMargin: '200px' })
    io.observe(el)
    return () => { dead = true; io.disconnect() }
  }, [src, path, token, w, key])

  if (!path.startsWith('photos/')) return null
  return (
    <div ref={ref} className={className} onClick={onClick}>
      {src ? <img src={src} alt="" /> : <span className="ph">{state === 'fail' ? '⚠' : '…'}</span>}
    </div>
  )
}
