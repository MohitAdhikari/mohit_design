'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('editor');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const res = await fetch('/api/dashboard/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, role }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      // Surface Supabase-specific messages clearly
      const msg = data.error || 'Failed to invite user.';
      if (msg.toLowerCase().includes('smtp') || msg.toLowerCase().includes('email')) {
        setError(`${msg} — check Supabase Auth → SMTP settings.`);
      } else if (msg.toLowerCase().includes('already registered')) {
        setError('That email already has an account.');
      } else {
        setError(msg);
      }
      return;
    }

    setSuccess(`Invite sent to ${email}. They'll receive an email to set their password. If nothing arrives, check Supabase → Auth → SMTP config.`);
    setEmail('');
    setFullName('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2">
          {success}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email" required placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <input
          placeholder="Full name (optional)"
          value={fullName} onChange={(e) => setFullName(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        />
        <select
          value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'editor')}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button
        type="submit" disabled={saving}
        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-md px-4 py-2 transition"
      >
        {saving ? 'Sending invite…' : 'Send Invite'}
      </button>
    </form>
  );
}
