import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client bound to the request's cookies. Uses the
 * anon key + the caller's session cookie, so it respects Row Level
 * Security exactly as a logged-in browser would (defense in depth).
 * Use this for anything scoped to "the current user".
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies.
            // Safe to ignore — middleware refreshes the session instead.
          }
        },
      },
    }
  );
}

/**
 * Privileged server-only Supabase client using the SERVICE ROLE key.
 * This key bypasses Row Level Security entirely — it must NEVER be
 * imported from a Client Component and must NEVER be exposed to the
 * browser. Only use it for explicit admin operations (creating users,
 * assigning roles, reading all profiles) after verifying the caller is
 * an authenticated admin.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
