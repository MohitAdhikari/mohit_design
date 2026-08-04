import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { DashboardRole } from '@/lib/dashboard/roles';

export interface DashboardUser {
  id: string;
  email: string;
  fullName: string | null;
  role: DashboardRole;
  active: boolean;
}

/**
 * Resolves the current dashboard user from the request's Supabase session
 * cookie, and cross-checks their role against the `profiles` table (never
 * trust a client-supplied role). Returns null if not authenticated, not
 * found, or deactivated.
 *
 * Call this at the top of every protected Server Component and every
 * dashboard API route — it is the single source of truth for "who is
 * making this request and what are they allowed to do".
 */
export async function getDashboardUser(): Promise<DashboardUser | null> {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, active')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.active) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as DashboardRole,
    active: profile.active,
  };
}

/**
 * Throws a Response-friendly error object when the current user does not
 * have one of the allowed roles. Use inside API routes:
 *
 *   const user = await requireRole(['admin']);
 *   if (user instanceof Response) return user;
 */
export async function requireRole(allowedRoles: DashboardRole[]) {
  const user = await getDashboardUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated.' }), { status: 401 });
  }
  if (!allowedRoles.includes(user.role)) {
    return new Response(JSON.stringify({ error: 'Forbidden.' }), { status: 403 });
  }
  return user;
}
