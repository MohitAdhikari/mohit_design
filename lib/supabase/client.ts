'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-only Supabase client. Uses the public anon key, which is safe to
 * expose — all sensitive operations (role assignment, Sanity writes) happen
 * server-side and are never reachable from this client.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
