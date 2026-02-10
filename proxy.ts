import { NextRequest, NextResponse } from "next/server";

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/patient": ["patient"],
  "/doctor": ["doctor"],
};

const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const role = req.cookies.get("role")?.value;

  console.log(`[Middleware] Path: ${pathname}, Has refresh: ${!!refreshToken}, Role: ${role}`);

  // ==================== ROOT ROUTE ====================
  if (pathname === "/") {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const validated = await validateSession(req);
    if (!validated) {
      return clearSessionAndRedirect(req, pathname);
    }

    const home = role === "doctor" ? "/doctor/appointments" : "/patient/doctors";
    return NextResponse.redirect(new URL(home, req.url));
  }

  // ==================== AUTH PAGES PROTECTION ====================
  // CRITICAL: If user is authenticated, they CANNOT access auth pages
  // This prevents browser back button from showing auth pages
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  
  if (isAuthPage) {
    // If they have a refresh token, validate it
    if (refreshToken && role) {
      const validated = await validateSession(req);
      
      if (validated) {
        // User is authenticated - FORCE redirect away from auth pages
        const fallback = role === "doctor" ? "/doctor/appointments" : "/patient/doctors";
        console.log(`[Middleware] ✋ Blocking authenticated user from ${pathname}, redirecting to ${fallback}`);
        
        // Create redirect response with cache control headers
        const redirectResponse = NextResponse.redirect(new URL(fallback, req.url));
        
        // Prevent caching of this redirect to ensure it always runs
        redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        redirectResponse.headers.set('Pragma', 'no-cache');
        redirectResponse.headers.set('Expires', '0');
        
        return redirectResponse;
      } else {
        // Session is invalid - clear cookies and let them access auth page
        console.log(`[Middleware] Invalid session on auth page, clearing cookies`);
        return clearSessionCookies(NextResponse.next());
      }
    }
    
    // No auth data - allow access to auth pages
    // Add headers to prevent caching of auth pages
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // ==================== PROTECTED ROUTES ====================
  const protectedPath = Object.keys(ROUTE_PERMISSIONS).find((path) =>
    pathname.startsWith(path)
  );

  if (!protectedPath) {
    return NextResponse.next();
  }

  // No refresh token = not authenticated at all
  if (!refreshToken) {
    console.log(`[Middleware] No refresh token, redirecting to login`);
    return clearSessionAndRedirect(req, pathname);
  }

  // No role = invalid session
  if (!role) {
    console.log(`[Middleware] No role, redirecting to login`);
    return clearSessionAndRedirect(req, pathname);
  }

  // Try to refresh access token if missing
  if (!accessToken) {
    console.log(`[Middleware] No access token, trying to refresh`);
    const refreshed = await tryRefreshToken(req);

    if (!refreshed) {
      console.log(`[Middleware] Refresh failed, redirecting to login`);
      return clearSessionAndRedirect(req, pathname);
    }
    // Token refreshed successfully, continue
    return NextResponse.next();
  }

  // Check role-based permissions
  const allowedRoles = ROUTE_PERMISSIONS[protectedPath];

  if (!allowedRoles.includes(role)) {
    // User has wrong role for this route
    const fallback = role === "doctor" ? "/doctor/appointments" : "/patient/doctors";
    console.log(`[Middleware] Wrong role for ${pathname}, redirecting to ${fallback}`);
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  // All checks passed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// ==================== HELPER FUNCTIONS ====================

async function tryRefreshToken(req: NextRequest): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh-token`,
      {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") ?? "",
        },
        credentials: "include",
      }
    );

    return res.ok;
  } catch {
    return false;
  }
}

async function validateSession(req: NextRequest): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/validate`, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
    });

    return res.ok;
  } catch {
    return false;
  }
}

function redirectToLogin(req: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", req.url);
  // Only add 'from' parameter for non-auth pages
  if (!AUTH_PAGES.some(page => pathname.startsWith(page))) {
    loginUrl.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

function clearSessionCookies(response: NextResponse): NextResponse {
  const cookieOptions = {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  response.cookies.set("access_token", "", cookieOptions);
  response.cookies.set("refresh_token", "", cookieOptions);
  response.cookies.set("role", "", cookieOptions);

  return response;
}

function clearSessionAndRedirect(req: NextRequest, pathname: string) {
  const res = redirectToLogin(req, pathname);
  return clearSessionCookies(res);
}