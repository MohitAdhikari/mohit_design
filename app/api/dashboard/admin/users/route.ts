import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/dashboard/session';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { DashboardRole } from '@/lib/dashboard/roles';
import { logActivity } from '@/lib/dashboard/activityLog';

const VALID_ROLES: DashboardRole[] = ['admin', 'editor'];

/**
 * Admin-only: list all dashboard users with their roles.
 * Uses the service role client — this route is unreachable unless
 * requireRole confirms the caller is an admin.
 */
export async function GET() {
  const user = await requireRole(['admin']);
  if (user instanceof Response) return user;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, role, active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ users: data });
}

/**
 * Admin-only: invite a new dashboard user. Creates the Supabase auth user
 * via the Admin API (service role), which triggers the `handle_new_user`
 * Postgres trigger to create the matching `profiles` row with the
 * requested role. The new user receives a Supabase-generated invite email
 * to set their own password — no plaintext password ever passes through
 * our server or client code.
 */
export async function POST(req: NextRequest) {
  const user = await requireRole(['admin']);
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const fullName = body?.fullName?.trim();
  const role: DashboardRole = VALID_ROLES.includes(body?.role) ? body.role : 'editor';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logActivity({ userId: user.id, userEmail: user.email, action: 'user.invited', meta: { invitedEmail: email, role } });

  return NextResponse.json({ user: data.user }, { status: 201 });
}
