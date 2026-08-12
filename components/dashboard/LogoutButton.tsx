'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/dashboard/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left text-sm text-white/70 hover:text-white border border-white/10 rounded-md px-3 py-2 hover:bg-white/10 transition"
    >
      Sign out
    </button>
  );
}
