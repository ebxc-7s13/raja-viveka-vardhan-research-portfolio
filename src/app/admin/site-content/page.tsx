'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminCms';

interface SiteContentItem {
  id?: number;
  page: string;
  key: string;
  value: string;
}

// Predefined content keys organized by page
const contentRegistry: Record<string, { key: string; label: string; type: 'text' | 'textarea' }[]> = {
  'home': [
    { key: 'hero_title', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
    { key: 'hero_cta_research', label: 'CTA: Explore Research', type: 'text' },
    { key: 'hero_cta_publications', label: 'CTA: View Publications', type: 'text' },
    { key: 'hero_cta_thesis', label: 'CTA: Read Thesis', type: 'text' },
    { key: 'featured_title', label: 'Featured Research Title', type: 'text' },
    { key: 'featured_subtitle', label: 'Featured Research Subtitle', type: 'text' },
    { key: 'publications_title', label: 'Recent Publications Title', type: 'text' },
    { key: 'publications_subtitle', label: 'Recent Publications Subtitle', type: 'text' },
    { key: 'notes_title', label: 'Research Notes Title', type: 'text' },
    { key: 'notes_subtitle', label: 'Research Notes Subtitle', type: 'text' },
    { key: 'cta_title', label: 'CTA Title', type: 'text' },
    { key: 'cta_description', label: 'CTA Description', type: 'textarea' },
    { key: 'cta_button_text', label: 'CTA Button Text', type: 'text' },
  ],
  'about': [
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
    { key: 'hero_description', label: 'Hero Description', type: 'textarea' },
    { key: 'philosophy_quote', label: 'Research Philosophy Quote', type: 'textarea' },
  ],
  'research': [
    { key: 'hero_title', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
  ],
  'publications': [
    { key: 'hero_title', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
  ],
  'thesis': [
    { key: 'hero_title', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
  ],
  'patents': [
    { key: 'hero_title', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
  ],
  'timeline': [
    { key: 'hero_title', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
  ],
  'contact': [
    { key: 'hero_title', label: 'Hero Title', type: 'text' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
  ],
  'footer': [
    { key: 'brand_description', label: 'Brand Description', type: 'textarea' },
  ],
  'custom': [], // For adding custom keys
};

export default function AdminSiteContentPage() {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('home');
  const [editingItem, setEditingItem] = useState<SiteContentItem | null>(null);
  const [formValue, setFormValue] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/site-content');
      const json = await res.json();
      const data = json.data?.data || json.data;
      setItems(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function getValue(page: string, key: string): string {
    const item = items.find(i => i.page === page && i.key === key);
    return item?.value || '';
  }

  function handleEdit(page: string, key: string) {
    const item = items.find(i => i.page === page && i.key === key);
    setEditingItem(item || { page, key, value: '' });
    setFormValue(item?.value || '');
    setMessage('');
  }

  async function handleSave() {
    if (!editingItem) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: editingItem.page, key: editingItem.key, value: formValue }),
      });
      if (res.ok) {
        setMessage('Saved successfully');
        setEditingItem(null);
        fetchItems();
      } else {
        const json = await res.json();
        setMessage(json.error || 'Save failed');
      }
    } catch {
      setMessage('Network error');
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this content entry?')) return;
    try {
      await fetch(`/api/admin/site-content?id=${id}`, { method: 'DELETE' });
      fetchItems();
    } catch {}
  }

  async function handleAddCustom() {
    if (!customKey.trim()) return;
    const key = customKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    handleEdit('custom', key);
    setCustomKey('');
    setShowAddCustom(false);
  }

  const registryKeys = contentRegistry[selectedPage] || [];

  return (
    <AdminLayout title="Site Content Editor">
      <div className="space-y-6 max-w-4xl">
        <p className="text-sm text-slate-400">
          Edit all user-visible text content on the website. Changes take effect immediately on the frontend.
        </p>

        {/* Page selector */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(contentRegistry).map(page => (
            <button
              key={page}
              onClick={() => { setSelectedPage(page); setEditingItem(null); setMessage(''); }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>

        {/* Editing form */}
        {editingItem && (
          <div className="bg-slate-900/50 rounded-xl border border-indigo-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Editing: {editingItem.page} / {editingItem.key}
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white text-sm">
                Cancel
              </button>
            </div>
            {editingItem.key.includes('description') || editingItem.key.includes('subtitle') || editingItem.key.includes('quote') ? (
              <textarea
                value={formValue}
                onChange={e => setFormValue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm resize-y"
                rows={5}
              />
            ) : (
              <input
                type="text"
                value={formValue}
                onChange={e => setFormValue(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            )}
            {message && (
              <p className={`text-sm mt-2 ${message.includes('error') || message.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {message}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Content list for selected page */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)} Page Content
          </h3>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading...</div>
          ) : registryKeys.length === 0 && selectedPage !== 'custom' ? (
            <div className="text-slate-500 text-sm">No predefined keys for this page.</div>
          ) : (
            <>
              {registryKeys.map(field => {
                const value = getValue(selectedPage, field.key);
                const dbItem = items.find(i => i.page === selectedPage && i.key === field.key);
                return (
                  <div
                    key={field.key}
                    className="bg-slate-900/50 rounded-lg border border-slate-800 p-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-500 mb-0.5">{field.label}</div>
                        <div className="text-sm text-white truncate">
                          {value || <span className="text-slate-600 italic">Not set</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(selectedPage, field.key)}
                          className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                        >
                          {value ? 'Edit' : 'Set'}
                        </button>
                        {dbItem?.id && (
                          <button
                            onClick={() => handleDelete(dbItem.id!)}
                            className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-slate-800 hover:bg-red-900/30 rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Custom content for this page */}
              {items.filter(i => i.page === selectedPage && !registryKeys.find(f => f.key === i.key)).map(item => (
                <div
                  key={item.key}
                  className="bg-slate-900/50 rounded-lg border border-slate-800 p-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-500 mb-0.5">{item.key} (custom)</div>
                      <div className="text-sm text-white truncate">{item.value || <span className="text-slate-600 italic">Empty</span>}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleEdit(item.page, item.key)} className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors">Edit</button>
                      {item.id && (
                        <button onClick={() => handleDelete(item.id!)} className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-slate-800 hover:bg-red-900/30 rounded transition-colors">Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Add custom content key */}
        <div className="border-t border-slate-800 pt-6">
          <button
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          >
            + Add Custom Content Key
          </button>
          {showAddCustom && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={customKey}
                onChange={e => setCustomKey(e.target.value)}
                placeholder="content_key_name"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddCustom}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
