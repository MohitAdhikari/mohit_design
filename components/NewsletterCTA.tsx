'use client';

import { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    // Simulate API call — replace with real endpoint when ready
    await new Promise((r) => setTimeout(r, 900));
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#0E0E12] p-8 md:p-12 lg:p-16 shadow-sm overflow-hidden">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.18),transparent_60%)] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(157,0,255,0.18),transparent_60%)] blur-2xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,229,255,0.04),transparent_40%,transparent_60%,rgba(157,0,255,0.04))]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-[#00E5FF]/10 border border-blue-200 dark:border-[#00E5FF]/30 mb-5">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-[#00E5FF]" />
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-[#00E5FF] font-bold">
                  Weekly Drop
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white mb-4">
                Never miss a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-[#00E5FF] dark:to-[#9D00FF]">scoop</span>.
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-sans leading-relaxed max-w-lg">
                Get the week&apos;s biggest esports stories, exclusive interviews and active redeem codes —
                delivered to your inbox every Friday. No spam, unsubscribe anytime.
              </p>
            </div>

            <div>
              {status === 'success' ? (
                <div className="rounded-2xl border border-green-300 dark:border-[#00FF66]/30 bg-green-50 dark:bg-[#00FF66]/5 p-6 md:p-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <Check className="w-6 h-6 text-green-600 dark:text-[#00FF66]" />
                  </div>
                  <h3 className="text-xl font-bold font-space-grotesk text-gray-900 dark:text-white mb-1">
                    You&apos;re in!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check your inbox for a quick confirmation.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-3">
                  <label htmlFor="newsletter-email" className="block text-xs font-mono font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                    Your email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourdomain.com"
                      className="flex-1 bg-gray-50 dark:bg-[#0B0B0F] border border-gray-200 dark:border-gray-800 focus:border-blue-500 dark:focus:border-[#00E5FF]/60 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none transition-colors font-mono text-sm"
                    />
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-[#00E5FF] dark:to-[#9D00FF] text-white dark:text-[#0B0B0F] font-black uppercase tracking-widest text-xs hover:opacity-95 disabled:opacity-60 transition-all shadow-sm hover:shadow-[0_8px_24px_rgba(0,229,255,0.25)]"
                    >
                      {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-500 font-mono">
                    By subscribing, you agree to our{' '}
                    <a href="/privacy-policy" className="underline underline-offset-4 hover:text-gray-900 dark:hover:text-gray-300">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
