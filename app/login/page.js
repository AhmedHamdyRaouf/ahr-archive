'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pw });
    if (error) { setMsg('الإيميل أو كلمة السر غلط'); setBusy(false); return; }
    window.location.href = '/dash';
  }
  async function forgot() {
    const em = email.trim().toLowerCase();
    if (!em) { setMsg('اكتب الإيميل الأول وبعدين دوس "نسيت كلمة السر"'); return; }
    setBusy(true); setMsg('');
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: window.location.origin + '/reset' });
    setBusy(false);
    setMsg(error ? 'مقدرتش أبعت اللينك دلوقتي، جرّب بعد شوية' : 'لو الإيميل مسجّل عندنا، هيوصلك لينك تغيير كلمة السر. شوف الإيميل (وكمان Spam).');
  }
  const f = { width: '100%', padding: '12px 14px', border: '1px solid #C9D8DE', borderRadius: 10, fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 6 };
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F6F9FA', fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <form onSubmit={go} style={{ background: '#fff', padding: 32, borderRadius: 16, width: 340, boxShadow: '0 8px 30px rgba(60,64,140,.10)' }}>
        <img src="/logo.png?v=3" alt="AHR" style={{ display: 'block', height: 44, width: 'auto', margin: '0 0 14px' }} />
        <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#092D3B' }}>AHR Master Archive</h1>
        <p style={{ margin: '0 0 22px', color: '#4B6672', fontSize: 14 }}>تسجيل الدخول للوحة التحكم</p>
        <label style={{ fontSize: 13, color: '#092D3B' }}>الإيميل<input style={f} type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /></label>
        <label style={{ fontSize: 13, color: '#092D3B', display: 'block', marginTop: 14 }}>كلمة السر<input style={f} type="password" required value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" /></label>
        {msg && <div style={{ color: msg.startsWith('لو الإيميل') ? '#1E8E5A' : '#C0392B', fontSize: 13, marginTop: 12 }}>{msg}</div>}
        <button disabled={busy} style={{ marginTop: 20, width: '100%', padding: 13, border: 0, borderRadius: 10, background: '#F36B12', color: '#fff', fontSize: 15, fontFamily: 'inherit', cursor: 'pointer' }}>{busy ? '...' : 'دخول'}</button>
      <button type="button" onClick={forgot} disabled={busy} style={{ marginTop: 14, width: '100%', padding: 8, border: 0, background: 'transparent', color: '#067D9A', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>نسيت كلمة السر؟</button>
      </form>
    </main>
  );
}
