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
  const f = { width: '100%', padding: '12px 14px', border: '1px solid #D9DCEB', borderRadius: 10, fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 6 };
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F6F7FB', fontFamily: 'Readex Pro, system-ui, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600&display=swap" rel="stylesheet" />
      <form onSubmit={go} style={{ background: '#fff', padding: 32, borderRadius: 16, width: 340, boxShadow: '0 8px 30px rgba(60,64,140,.10)' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#3F3D9B' }}>AHR Master Archive</h1>
        <p style={{ margin: '0 0 22px', color: '#6B6F8A', fontSize: 14 }}>تسجيل الدخول للوحة التحكم</p>
        <label style={{ fontSize: 13, color: '#44486A' }}>الإيميل<input style={f} type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" /></label>
        <label style={{ fontSize: 13, color: '#44486A', display: 'block', marginTop: 14 }}>كلمة السر<input style={f} type="password" required value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" /></label>
        {msg && <div style={{ color: '#C0392B', fontSize: 13, marginTop: 12 }}>{msg}</div>}
        <button disabled={busy} style={{ marginTop: 20, width: '100%', padding: 13, border: 0, borderRadius: 10, background: '#4B49C8', color: '#fff', fontSize: 15, fontFamily: 'inherit', cursor: 'pointer' }}>{busy ? '...' : 'دخول'}</button>
      </form>
    </main>
  );
}
