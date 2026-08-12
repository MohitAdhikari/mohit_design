import { redirect } from 'next/navigation';
import { getDashboardUser } from '@/lib/dashboard/session';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import InviteUserForm from '@/components/dashboard/InviteUserForm';

export default async function AdminUsersPage() {
  const user = await getDashboardUser();
  if (!user) redirect('/dashboard/login');
  if (user.role !== 'admin') redirect('/dashboard');

  const admin = createSupabaseAdminClient();
  const { data: users } = await admin
    .from('profiles')
    .select('id, email, full_name, role, active, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Users</h1>

      <div className="mb-8 border border-white/10 rounded-lg p-6">
        <h2 className="text-sm font-semibold mb-4">Invite a new user</h2>
        <InviteUserForm />
      </div>

      <div className="space-y-2">
        {(users || []).map((u: any) => (
          <div key={u.id} className="border border-white/10 rounded-md px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{u.full_name || u.email}</p>
              <p className="text-xs text-white/40">{u.email}</p>
            </div>
            <span className="text-xs font-mono uppercase text-white/50">{u.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
