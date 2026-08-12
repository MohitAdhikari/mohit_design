import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';

export default async function DashboardOverviewPage() {
  const user = await getDashboardUser();
  if (!user) redirect('/dashboard/login');

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Welcome, {user.fullName || user.email}</h1>
      <p className="text-white/50 text-sm mb-8 font-mono uppercase tracking-wider">{user.role}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/articles/new"
          className="border border-white/10 rounded-lg p-6 hover:bg-white/5 transition"
        >
          <p className="font-semibold mb-1">New Article</p>
          <p className="text-sm text-white/50">Start writing a new draft.</p>
        </Link>
        <Link
          href="/dashboard/articles"
          className="border border-white/10 rounded-lg p-6 hover:bg-white/5 transition"
        >
          <p className="font-semibold mb-1">My Articles</p>
          <p className="text-sm text-white/50">View and continue your drafts.</p>
        </Link>
        {user.role === 'admin' && (
          <Link
            href="/dashboard/admin/users"
            className="border border-white/10 rounded-lg p-6 hover:bg-white/5 transition"
          >
            <p className="font-semibold mb-1">Manage Users</p>
            <p className="text-sm text-white/50">Invite editors and admins.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
