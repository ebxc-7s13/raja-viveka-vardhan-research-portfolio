'use client';

import { useState, useEffect, useCallback } from 'react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/messages?all=true');
      const json = await res.json();
      const data = json.data?.data || json.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-slate-400 hover:text-white transition-colors">← Dashboard</a>
            <h1 className="text-2xl font-bold text-white">Contact Messages ({messages.length})</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 p-8 text-center">No messages yet.</div>
        ) : (
          <div className="space-y-2">
            {messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedMsg(selectedMsg?.id === msg.id ? null : msg)}
                className={`bg-slate-900/50 rounded-xl border p-4 cursor-pointer transition-colors ${selectedMsg?.id === msg.id ? 'border-indigo-500' : 'border-slate-800 hover:border-slate-700'} ${!msg.read ? 'border-l-indigo-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{msg.name}</span>
                  <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-slate-400">{msg.email} — {msg.subject}</div>
                {selectedMsg?.id === msg.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
