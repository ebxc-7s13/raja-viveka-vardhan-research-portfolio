'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Stats {
  posts: number;
  projects: number;
  messages: number;
  unreadMessages: number;
  theses: number;
  patents: number;
  timeline: number;
  themes: number;
}

function unwrapApiData(json: any): any {
  if (json && typeof json === 'object') {
    if ('data' in json && json.success !== undefined) {
      const inner = json.data;
      if (inner && typeof inner === 'object' && 'pagination' in inner && 'data' in inner) {
        return inner.data;
      }
      return inner;
    }
    return json;
  }
  return json;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ posts: 0, projects: 0, messages: 0, unreadMessages: 0, theses: 0, patents: 0, timeline: 0, themes: 0 });
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        const userData = json.data?.user || json.user;
        if (userData) { setUser(userData); fetchStats(); }
      }
    } catch {}
    setLoading(false);
  }

  async function fetchStats() {
    try {
      const endpoints = ['/api/admin/posts', '/api/admin/projects', '/api/admin/messages', '/api/admin/theses', '/api/admin/patents', '/api/admin/timeline', '/api/admin/themes'];
      const results = await Promise.all(endpoints.map(async (url) => {
        const res = await fetch(url);
        const json = await res.json();
        const data = unwrapApiData(json);
        return Array.isArray(data) ? data : [];
      }));
      setStats({
        posts: results[0].length,
        projects: results[1].length,
        messages: results[2].length,
        unreadMessages: results[2].filter((m: any) => !m.read).length,
        theses: results[3].length,
        patents: results[4].length,
        timeline: results[5].length,
        themes: results[6].length,
      });
    } catch {}
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok) {
        const userData = json.data?.user || json.user;
        if (userData) { setUser(userData); fetchStats(); }
        else setError('Login succeeded but user data is missing');
      } else {
        setError(json.error || 'Login failed');
      }
    } catch { setError('Network error'); }
    setLoggingIn(false);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStats({ posts: 0, projects: 0, messages: 0, unreadMessages: 0, theses: 0, patents: 0, timeline: 0, themes: 0 });
  }

  if (loading) return <main className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></main>;

  if (!user) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Research Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage your research portfolio</p>
        </div>
        <form onSubmit={handleLogin} className="bg-slate-900/50 rounded-xl border border-slate-800 p-8 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm" required autoComplete="username" />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm" required autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loggingIn} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
            {loggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );

  const cmsSections = [
    { label: 'Research Projects', href: '/admin/projects', icon: '🔬', count: stats.projects, color: 'indigo' },
    { label: 'Publications', href: '/admin/posts', icon: '📄', count: stats.posts, color: 'emerald' },
    { label: 'Theses', href: '/admin/theses', icon: '🎓', count: stats.theses, color: 'blue' },
    { label: 'Patents', href: '/admin/patents', icon: '📋', count: stats.patents, color: 'amber' },
    { label: 'Timeline', href: '/admin/timeline', icon: '📅', count: stats.timeline, color: 'violet' },
    { label: 'Research Themes', href: '/admin/themes', icon: '🏷️', count: stats.themes, color: 'cyan' },
    { label: 'Site Content', href: '/admin/site-content', icon: '📝', count: 0, color: 'teal' },
    { label: 'Contact Messages', href: '/admin/messages', icon: '✉️', count: stats.messages, color: 'rose', badge: stats.unreadMessages },
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Research Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome, {user.name}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors">Sign Out</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cmsSections.map(s => (
            <Link key={s.href} href={s.href} className="block bg-slate-900/50 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <div className="flex items-center gap-2">
                  {s.badge ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{s.badge} new</span> : null}
                  <span className={`text-2xl font-bold text-${s.color}-400`}>{s.count}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{s.label}</h3>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          <p>Admin credentials configured in <code className="px-1 py-0.5 bg-slate-800 rounded text-slate-500">.env.local</code> • Run <code className="px-1 py-0.5 bg-slate-800 rounded text-slate-500">npx tsx scripts/seed.ts</code> after changing</p>
        </div>
      </div>
    </main>
  );
}
