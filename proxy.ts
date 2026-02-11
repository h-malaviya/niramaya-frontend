import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// role-based protected paths
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/patient": ["patient"],
  "/doctor": ["doctor"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const role = req.cookies.get("role")?.value;

  // ================= ROOT `/` =================
  if (pathname === "/") {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const valid = await validateSession(req);
    if (!valid) {
      return clearSessionAndRedirect(req, pathname);
    }
    const dash = role === "doctor" ? "/doctor/appointments" : "/patient/doctors";
    return NextResponse.redirect(new URL(dash, req.url));
  }

  // ================= AUTH PAGES =================
  // check if exact auth page
  const matchesAuthPage = AUTH_PAGES.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  );

  if (matchesAuthPage) {
    // if user is authenticated, redirect them away
    if (refreshToken && role) {
      const valid = await validateSession(req);
      if (valid) {
        const dash =
          role === "doctor" ? "/doctor/appointments" : "/patient/doctors";
        return redirectNoCache(req, dash);
      }
    }
    // not authenticated — allow
    return NextResponse.next();
  }

  // ================= PROTECTED ROUTES =================
  const protectedPath = Object.keys(ROUTE_PERMISSIONS).find((path) =>
    pathname.startsWith(path)
  );

  // public pages not matching protected paths
  if (!protectedPath) {
    return NextResponse.next();
  }

  // if user has no refresh token — unauthenticated
  if (!refreshToken) {
    return clearSessionAndRedirect(req, pathname);
  }

  // role must exist
  if (!role) {
    return clearSessionAndRedirect(req, pathname);
  }

  // try to refresh access token if missing
  if (!accessToken) {
    const refreshed = await tryRefreshToken(req);
    if (!refreshed) {
      return clearSessionAndRedirect(req, pathname);
    }
    return NextResponse.next();
  }

  // check allowed roles
  const allowed = ROUTE_PERMISSIONS[protectedPath] ?? [];
  if (!allowed.includes(role)) {
    const fallback =
      role === "doctor" ? "/doctor/appointments" : "/patient/doctors";
    return redirectNoCache(req, fallback);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // all auth pages except static assets + api
    "/login/:path*",
    "/signup/:path*",
    "/forgot-password/:path*",
    "/reset-password/:path*",

    // protected routes
    "/doctor/:path*",
    "/patient/:path*",
    "/",
  ],
};


// ================= HELPERS =================

function redirectNoCache(req: NextRequest, url: string) {
  const res = NextResponse.redirect(new URL(url, req.url));
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  response.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
  response.cookies.set("role", "", { path: "/", maxAge: 0 });
  return response;
}

function clearSessionAndRedirect(req: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", req.url);
  if (!AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    loginUrl.searchParams.set("from", pathname);
  }
  const res = NextResponse.redirect(loginUrl);
  return clearSessionCookies(res);
}

async function tryRefreshToken(req: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh-token`,
      {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") ?? "" },
        credentials: "include",
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function validateSession(req: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}validate`,
      {
        method: "GET",
        headers: { cookie: req.headers.get("cookie") ?? "" },
        credentials: "include",
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
