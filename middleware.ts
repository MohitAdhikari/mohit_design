import { NextResponse, type NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

// Permissive CSP for the Sanity Studio route only — Studio's runtime needs
// `unsafe-eval` (esbuild-transpiled code) and inline styles/scripts.
const studioCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://picsum.photos",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io https://*.apicdn.sanity.io https://*.supabase.co",
  "upgrade-insecure-requests",
].join('; ');

// Strict policy for the rest of the site. `unsafe-eval` is dropped entirely
// here (it was previously allowed site-wide but is only ever needed by
// Studio). `unsafe-inline` for scripts is kept because the handful of
// inline scripts we render (theme-init, JSON-LD, GA) are emitted from a
// Server Component — nonce'ing them would require reading the per-request
// nonce via `headers()` inside the root layout, which forces the entire
// site out of static generation (verified: every route became fully
// dynamic when this was tried). Static generation + ISR is a bigger
// mobile-performance win than nonce'd scripts here, so this is a
// deliberate trade-off, not an oversight.
const siteCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://picsum.photos https://www.google-analytics.com https://img.youtube.com https://*.instagram.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.sanity.io https://*.apicdn.sanity.io https://www.google-analytics.com https://region1.google-analytics.com https://*.supabase.co",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.instagram.com",
  "upgrade-insecure-requests",
].join('; ');

export async function middleware(request: NextRequest) {
  const isStudio = request.nextUrl.pathname.startsWith('/studio');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const csp = isStudio ? studioCsp : siteCsp;

  // Response-header-only CSP: does not touch the request object or React's
  // headers(), so it has no effect on static generation/ISR for the page.
  const response = isDashboard ? await updateSupabaseSession(request) : NextResponse.next();

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Run on every route except static assets and image optimization,
    // so the CSP applies everywhere (including /studio and /dashboard).
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
