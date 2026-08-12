import type { Metadata } from 'next';
import Link from 'next/link';
import { getDashboardUser } from '@/lib/dashboard/session';
import { NAV_ITEMS } from '@/lib/dashboard/roles';
import LogoutButton from '@/components/dashboard/LogoutButton';

export const metadata: Metadata = {
  title: 'Dashboard | PHONEOCEAN',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The login page has no session yet — render it without the sidebar.
  // (Its own page component still runs getDashboardUser as needed.)
  const user = await getDashboardUser().catch(() => null);

  return (
    <div className="bg-[#0B0B0F] text-white min-h-screen font-sans antialiased">
      {user ? (
        <div className="flex min-h-screen">
          <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0F0F14] p-6 flex flex-col">
            <div className="mb-8">
              <p className="text-lg font-black tracking-tight">PHONEOCEAN</p>
              <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Dashboard</p>
            </div>
            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.filter((item) => item.roles.includes(user.role)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/10 pt-4 mt-4">
              <p className="text-xs text-white/50 mb-1">{user.email}</p>
              <p className="text-xs text-white/40 font-mono uppercase mb-3">{user.role}</p>
              <LogoutButton />
            </div>
          </aside>
          <main className="flex-1 p-8 max-w-5xl">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
