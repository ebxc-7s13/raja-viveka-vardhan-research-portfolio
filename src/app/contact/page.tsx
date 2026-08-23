'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formState, setFormState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [timestamp] = useState(() => Date.now().toString());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: 'loading', message: '' });

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      website: formData.get('website'),
      timestamp: formData.get('timestamp'),
    };

    const elapsed = Date.now() - parseInt(timestamp);
    if (elapsed < 3000) {
      setFormState({ status: 'error', message: 'Please take your time filling out the form.' });
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setFormState({ status: 'success', message: 'Message sent successfully! I\'ll get back to you soon.' });
        form.reset();
      } else {
        setFormState({ status: 'error', message: result.error || 'Something went wrong.' });
      }
    } catch {
      setFormState({ status: 'error', message: 'Network error. Please try again.' });
    }
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in <span className="text-emerald-400">Touch</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl">
            Interested in research collaboration, have questions about my work, or want to discuss 
            biomedical imaging and diagnostics? I&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          {formState.status === 'success' ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
              <p className="text-slate-400 mb-6">{formState.message}</p>
              <button
                onClick={() => setFormState({ status: 'idle', message: '' })}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot */}
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <label htmlFor="website">Leave this empty</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <input type="hidden" name="timestamp" value={timestamp} />

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-2">Name *</label>
                <input
                  type="text" id="name" name="name" required maxLength={100} autoComplete="name"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">Email *</label>
                <input
                  type="email" id="email" name="email" required maxLength={255} autoComplete="email"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-400 mb-2">Subject *</label>
                <input
                  type="text" id="subject" name="subject" required maxLength={200}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="Research collaboration, question about your work..."
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-400 mb-2">Message *</label>
                <textarea
                  id="message" name="message" required minLength={10} maxLength={5000} rows={6}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm resize-none"
                  placeholder="Tell me about your research interests or question..."
                />
              </div>

              {formState.status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {formState.message}
                </div>
              )}

              <button
                type="submit"
                disabled={formState.status === 'loading'}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {formState.status === 'loading' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
