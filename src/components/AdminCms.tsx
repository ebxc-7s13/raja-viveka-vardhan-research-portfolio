'use client';

import { useState, useEffect, useCallback } from 'react';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        const u = json?.data?.user || json?.user;
        if (u) setUser(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Not authenticated. <a href="/admin" className="text-indigo-400 ml-2">Go to login</a></div>;

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-slate-400 hover:text-white transition-colors">← Dashboard</a>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>
          <span className="text-sm text-slate-500">{user.name}</span>
        </div>
        {children}
      </div>
    </main>
  );
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  placeholder?: string;
  helpText?: string;
}

interface ColumnConfig {
  key: string;
  label: string;
}

interface CmsListProps {
  title: string;
  apiBase: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
  statusField?: string;
}

function StatusBadge({ value, field }: { value: string; field: string }) {
  if (field === 'status') {
    const colors: Record<string, string> = {
      completed: 'bg-emerald-500/20 text-emerald-400',
      ongoing: 'bg-amber-500/20 text-amber-400',
      under_review: 'bg-blue-500/20 text-blue-400',
      filed: 'bg-purple-500/20 text-purple-400',
      granted: 'bg-emerald-500/20 text-emerald-400',
      pending: 'bg-amber-500/20 text-amber-400',
      search_report: 'bg-cyan-500/20 text-cyan-400',
      published: 'bg-emerald-500/20 text-emerald-400',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[value] || 'bg-slate-500/20 text-slate-400'}`}>{value.replace(/_/g, ' ')}</span>;
  }
  if (field === 'published') {
    return <span className={`text-xs px-2 py-0.5 rounded-full ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>{value ? 'Published' : 'Draft'}</span>;
  }
  return <span className="text-slate-400 text-xs">{String(value ?? '').substring(0, 120)}</span>;
}

export function CmsList({ title, apiBase, fields, columns }: CmsListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      const json = await res.json();
      const data = json.data?.data || json.data;
      setItems(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, [apiBase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function initForm(item?: any) {
    const data: any = {};
    fields.forEach(f => {
      if (item && item[f.key] !== undefined) {
        data[f.key] = f.type === 'checkbox' ? !!item[f.key] : item[f.key];
      } else {
        data[f.key] = f.type === 'checkbox' ? false : f.type === 'number' ? 0 : '';
      }
    });
    setFormData(data);
    setEditing(item || null);
    setShowForm(true);
    setError('');
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const body = { ...formData };
      fields.forEach(f => {
        if (f.type === 'number') body[f.key] = parseInt(body[f.key]) || 0;
      });

      const url = editing ? `${apiBase}/${editing.id}` : apiBase;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        setShowForm(false);
        fetchItems();
      } else {
        setError(json.error || 'Save failed');
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch {}
  }

  if (showForm) {
    return (
      <AdminLayout title={editing ? `Edit ${title}` : `New ${title}`}>
        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">{error}</div>}
        <div className="space-y-4 max-w-3xl">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              {f.type === 'text' && (
                <input
                  type="text"
                  value={formData[f.key] || ''}
                  onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}
              {f.type === 'textarea' && (
                <textarea
                  value={formData[f.key] || ''}
                  onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm resize-y"
                  rows={f.rows || 4}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}
              {f.type === 'select' && (
                <select
                  value={formData[f.key] || ''}
                  onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required={f.required}
                >
                  <option value="">Select...</option>
                  {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
              {f.type === 'checkbox' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData[f.key]}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-500"
                  />
                  <span className="text-sm text-slate-400">{f.label}</span>
                </label>
              )}
              {f.type === 'number' && (
                <input
                  type="number"
                  value={formData[f.key] || 0}
                  onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  min={0}
                  required={f.required}
                />
              )}
              {f.helpText && <p className="text-xs text-slate-600 mt-1">{f.helpText}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${title} (${items.length})`}>
      <div className="mb-6">
        <button onClick={() => initForm()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors text-sm">
          + Add New
        </button>
      </div>
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 p-8 text-center">No items yet. Click &quot;Add New&quot; to create one.</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
              <div className="flex-1 min-w-0">
                {columns.map(col => (
                  <div key={col.key} className="text-sm">
                    {col.key === columns[0].key ? (
                      <span className="text-white font-medium">{String(item[col.key] ?? '').substring(0, 200)}</span>
                    ) : (
                      <StatusBadge value={item[col.key]} field={col.key} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => initForm(item)} className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-slate-800 hover:bg-red-900/30 rounded transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
