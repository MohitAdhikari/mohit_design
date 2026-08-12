'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

interface FormState {
  game: string;
  code: string;
  issue: string;
  email: string;
}

export default function GameCodeFeedback() {
  const [form, setForm] = useState<FormState>({ game: '', code: '', issue: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.game.trim()) nextErrors.game = 'Please enter a game name.';
    if (!form.issue.trim()) nextErrors.issue = 'Please describe the issue.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // No backend endpoint is wired; in production this can POST to /api/feedback.
    // eslint-disable-next-line no-console
    console.log('[Game Code Feedback]', form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-1">Thanks for the report</h3>
        <p className="text-sm text-gray-400">Our team will review the code and update the list.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-purple-500/10 bg-[#0f1117] p-6 sm:p-8">
      <h3 className="text-lg sm:text-xl font-bold font-space-grotesk mb-2 text-white">
        Report a code
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        Found an expired, incorrect or missing code? Let us know.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="game" className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-1.5">
            Game <span className="text-red-400">*</span>
          </label>
          <input
            id="game"
            value={form.game}
            onChange={(e) => setForm({ ...form, game: e.target.value })}
            placeholder="e.g. BGMI, Free Fire, Roblox"
            className="w-full px-4 py-2.5 rounded-lg bg-[#13151d] border border-gray-800 text-white placeholder-gray-600 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
          />
          {errors.game && <p className="mt-1.5 text-xs text-red-400">{errors.game}</p>}
        </div>

        <div>
          <label htmlFor="code" className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-1.5">
            Code (optional)
          </label>
          <input
            id="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder=" Paste the code here"
            className="w-full px-4 py-2.5 rounded-lg bg-[#13151d] border border-gray-800 text-white placeholder-gray-600 font-mono text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="issue" className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-1.5">
            What is wrong? <span className="text-red-400">*</span>
          </label>
          <textarea
            id="issue"
            rows={3}
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
            placeholder="Code expired, typo, reward changed, etc."
            className="w-full px-4 py-2.5 rounded-lg bg-[#13151d] border border-gray-800 text-white placeholder-gray-600 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all resize-none"
          />
          {errors.issue && <p className="mt-1.5 text-xs text-red-400">{errors.issue}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-500 mb-1.5">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-lg bg-[#13151d] border border-gray-800 text-white placeholder-gray-600 text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors"
      >
        <Send className="w-4 h-4" />
        Submit report
      </button>
    </form>
  );
}
