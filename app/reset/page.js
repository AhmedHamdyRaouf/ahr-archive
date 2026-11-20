'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Set a new password after following the emailed reset link (Supabase PKCE: ?code=...).
export default function Reset() {
  const [state, setState] = useState('checking'); // checking | ready | bad | done
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const mk = () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  useEffect(() => {
    (async () => {
      const sb = mk();
      const code = new URL(window.location.href).searchParams.get('code');
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (error) { setState('bad'); return; }
        window.history.replaceState({}, '', '/reset');
        setState('ready'); return;
      }
      const { data } = await sb.auth.getUser();
      setState(data && data.user ? 'ready' : 'bad');
    })();
  }, []);
  async function save(e) {
    e.preventDefault(); setMsg('');
    if (a.length < 12) { setMsg('كلمة السر لازم تكون 12 حرف على الأقل'); return; }
    if (a !== b) { setMsg('كلمتين السر مش زي بعض'); return; }
    setBusy(true);
    const { error } = await mk().auth.updateUser({ password: a });
    if (error) { setMsg(String(error.message || 'فشل التغيير').slice(0, 200)); setBusy(false); return; }
    setState('done');
    setTimeout(() => { window.location.href = '/dash'; }, 1200);
  }
  const f = { width: '100%', padding: '12px 14px', border: '1px solid #C9D8DE', borderRadius: 10, fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 6 };
  const card = { background: '#fff', padding: 32, borderRadius: 16, width: 340, boxShadow: '0 8px 30px rgba(60,64,140,.10)' };
  return (
    <main dir="rtl" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F6F9FA', fontFamily: 'IBM Plex Sans Arabic, system-ui, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={card}>
        <img src="/logo.png?v=3" alt="AHR" style={{ display: 'block', height: 44, width: 'auto', margin: '0 0 14px' }} />
        <h1 style={{ margin: '0 0 4px', fontSize: 22, color: '#092D3B' }}>كلمة سر جديدة</h1>
        {state === 'checking' && <p style={{ color: '#4B6672', fontSize: 14 }}>...</p>}
        {state === 'bad' && (<>
          <p style={{ color: '#C0392B', fontSize: 14 }}>اللينك ده منتهي أو اتستخدم قبل كده.</p>
          <a href="/login" style={{ color: '#067D9A', fontSize: 14 }}>ارجع لصفحة الدخول واطلب لينك جديد</a>
        </>)}
        {state === 'done' && <p style={{ color: '#1E8E5A', fontSize: 14 }}>تم تغيير كلمة السر، جاري الدخول...</p>}
        {state === 'ready' && (
          <form onSubmit={save}>
            <p style={{ margin: '0 0 18px', color: '#4B6672', fontSize: 14 }}>اكتب كلمة السر الجديدة (12 حرف على الأقل)</p>
            <label style={{ fontSize: 13, color: '#092D3B' }}>كلمة السر الجديدة<input style={f} type="password" required value={a} onChange={e => setA(e.target.value)} autoComplete="new-password" /></label>
            <label style={{ fontSize: 13, color: '#092D3B', display: 'block', marginTop: 14 }}>تأكيد كلمة السر<input style={f} type="password" required value={b} onChange={e => setB(e.target.value)} autoComplete="new-password" /></label>
            {msg && <div style={{ color: '#C0392B', fontSize: 13, marginTop: 12 }}>{msg}</div>}
            <button disabled={busy} style={{ marginTop: 20, width: '100%', padding: 13, border: 0, borderRadius: 10, background: '#F36B12', color: '#fff', fontSize: 15, fontFamily: 'inherit', cursor: 'pointer' }}>{busy ? '...' : 'حفظ ودخول'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
