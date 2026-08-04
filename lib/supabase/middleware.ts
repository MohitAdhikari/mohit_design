import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session cookie on every request and
 * redirects unauthenticated users away from protected /dashboard routes.
 * Role-specific checks (admin vs editor) happen deeper, in the dashboard
 * layout and in every API route — this middleware only enforces
 * "must be logged in".
 */
export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = request.nextUrl.pathname === '/dashboard/login';

  // Redirects must carry over any cookies Supabase just refreshed on
  // `response` above — otherwise the browser keeps a stale session cookie
  // and the next request flips back to "unauthenticated", bouncing forever
  // between /dashboard and /dashboard/login.
  function withRefreshedCookies(redirectResponse: NextResponse) {
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  if (isDashboardRoute && !isLoginRoute && !user) {
    const redirectUrl = new URL('/dashboard/login', request.url);
    redirectUrl.searchParams.set('next', request.nextUrl.pathname);
    return withRefreshedCookies(NextResponse.redirect(redirectUrl));
  }

  if (isLoginRoute && user) {
    return withRefreshedCookies(NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  return response;
}
