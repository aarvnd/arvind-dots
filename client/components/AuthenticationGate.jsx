'use client';

import { useEffect, useState } from 'react';
import { AuthenticationError, ensureSession, login, logout } from '../lib/api';
import Dashboard from './Dashboard';
import Logo from './Logo';

export default function AuthenticationGate() {
  const [phase, setPhase] = useState('loading');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const checkSession = async () => {
    setPhase('loading');
    setError('');
    try {
      await ensureSession();
      setPhase('authenticated');
    } catch (failure) {
      setPhase(failure instanceof AuthenticationError ? 'login' : 'unavailable');
      if (!(failure instanceof AuthenticationError)) setError('Cannot reach the API. Start the server and retry.');
    }
  };

  useEffect(() => {
    checkSession();
    const expired = () => { setToken(''); setError(''); setPhase('login'); };
    window.addEventListener('arvind-dots:authentication-required', expired);
    return () => window.removeEventListener('arvind-dots:authentication-required', expired);
  }, []);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const credential = token;
    setToken('');
    try {
      await login(credential);
      setPhase('authenticated');
    } catch (failure) {
      setError(failure.message || 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    try { await logout(); }
    catch (failure) { setError(failure.message); setPhase('unavailable'); }
  };

  if (phase === 'authenticated') return <Dashboard onLogout={signOut} />;
  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center p-4">
      <section className="surface w-full max-w-md p-6 space-y-5 animate-fade-in">
        <Logo href={null} />
        <div>
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-fg-2">This workspace has one owner. Use the owner token from the server.</p>
        </div>
        {phase === 'loading' ? <p role="status" className="text-sm text-fg-2">Checking session…</p> : phase === 'unavailable' ? <>
          <p role="alert" className="notice notice-danger">{error}</p>
          <button onClick={checkSession} className="btn btn-primary">Retry connection</button>
        </> : <form onSubmit={signIn} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="owner-token" className="label">Owner token</label>
            <input id="owner-token" type="password" autoComplete="off" required maxLength={4096} value={token} onChange={(event) => setToken(event.target.value)} disabled={busy} className="input font-mono" />
            <p className="text-xs text-fg-3">For a local install, read the .auth-token file in your data directory (normally ~/.arvind-dots). Your model provider key is configured after signing in.</p>
          </div>
          {error && <p role="alert" className="notice notice-danger">{error}</p>}
          <button disabled={busy} type="submit" className="btn btn-primary w-full">{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>}
      </section>
    </main>
  );
}
