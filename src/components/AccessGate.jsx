import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AccessGate({ children }) {
  const [status, setStatus] = useState('checking'); // checking | unlocked | locked
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('accessCode');
    if (!saved) { setStatus('locked'); return; }
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: saved }),
    })
      .then((r) => {
        if (r.ok) setStatus('unlocked');
        else { localStorage.removeItem('accessCode'); setStatus('locked'); }
      })
      .catch(() => setStatus('unlocked')); // offline/network — let through
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input }),
      });
      if (res.ok) {
        localStorage.setItem('accessCode', input);
        setStatus('unlocked');
      } else {
        setError('Wrong access code. Try again.');
      }
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'checking') return null;
  if (status === 'unlocked') return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-xl font-semibold mb-1">Lim Family's Rental Tracker</h1>
        <p className="text-muted-foreground text-sm mb-6">Enter the access code to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Access code"
            autoFocus
            className="w-full border border-input rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !input}>
            {loading ? 'Checking…' : 'Enter'}
          </Button>
        </form>
      </div>
    </div>
  );
}
