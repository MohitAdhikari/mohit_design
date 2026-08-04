import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';

// Admin landing page. Intentionally minimal for now — each card below is a
// placeholder for a future section (analytics, settings, media, activity
// logs, additional roles) that can be built independently without any
// changes to the auth/role architecture already in place.
export default async function AdminOverviewPage() {
  const user = await getDashboardUser();
  if (!user) redirect('/dashboard/login');
  if (user.role !== 'admin') redirect('/dashboard');

  const sections = [
    { title: 'User Management', href: '/dashboard/admin/users', ready: true },
    { title: 'All Articles', href: '/dashboard/articles', ready: true },
    { title: 'Publishing Queue', href: '#', ready: false },
    { title: 'Analytics', href: '#', ready: false },
    { title: 'Settings', href: '#', ready: false },
    { title: 'Media Library', href: '#', ready: false },
    { title: 'Activity Log', href: '#', ready: false },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Admin</h1>
      <p className="text-white/50 text-sm mb-8">
        Architecture is ready for these sections — each ships independently.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className={`border border-white/10 rounded-lg p-6 transition ${
              s.ready ? 'hover:bg-white/5' : 'opacity-40 cursor-not-allowed pointer-events-none'
            }`}
          >
            <p className="font-semibold mb-1">{s.title}</p>
            <p className="text-xs text-white/40">{s.ready ? 'Available' : 'Coming soon'}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
