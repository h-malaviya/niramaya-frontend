import { NextRequest, NextResponse } from "next/server";

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/patient": ["patient"],
  "/doctor": ["doctor"],
};
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"]
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const accessToken = req.cookies.get("access_token")?.value
  const refreshToken = req.cookies.get("refresh_token")?.value
  const role = req.cookies.get("role")?.value
  if (pathname === "/") {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const validated = await validateSession(req)
    if (!validated) {
      return clearSessionAndRedirect(req, pathname)
    }

    const home =
      role === "doctor" ? "/doctor/appointments" : "/patient/doctors"

    return NextResponse.redirect(new URL(home, req.url))
  }
  // 🔒 Block auth pages if already logged in
  if (AUTH_PAGES.some(p => pathname.startsWith(p)) && refreshToken && role) {
    const fallback = role === "doctor" ? "/doctor/home" : "/patient/home"
    return NextResponse.redirect(new URL(fallback, req.url))
  }

  const protectedPath = Object.keys(ROUTE_PERMISSIONS).find((path) =>
    pathname.startsWith(path)
  )

  if (!protectedPath) return NextResponse.next()

  // 🔄 Try refresh if access token missing
  if (!accessToken && refreshToken) {
    const refreshed = await tryRefreshToken(req)

    if (!refreshed) {
      return clearSessionAndRedirect(req, pathname)
    }
    return NextResponse.next()
  }

  if (!refreshToken) {
    return clearSessionAndRedirect(req, pathname)
  }

  if (!role) {
    return clearSessionAndRedirect(req, pathname)
  }

  const allowedRoles = ROUTE_PERMISSIONS[protectedPath]

  if (!allowedRoles.includes(role)) {
    const fallback = role === "doctor" ? "/doctor/appointments" : "/patient/doctors"
    return NextResponse.redirect(new URL(fallback, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*"],
};
async function tryRefreshToken(req: NextRequest): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/refresh-token`,
      {
        method: 'POST',
        headers: {
          cookie: req.headers.get('cookie') ?? '',
        },
        credentials: 'include',
      }
    )

    return res.ok
  } catch {
    return false
  }
}

function redirectToLogin(req: NextRequest, pathname: string) {
  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

function clearSessionAndRedirect(req: NextRequest, pathname: string) {
  const res = redirectToLogin(req, pathname)

  res.cookies.set('access_token', '', { maxAge: 0 })
  res.cookies.set('refresh_token', '', { maxAge: 0 })
  res.cookies.set('role', '', { maxAge: 0 })

  return res
}
async function validateSession(req: NextRequest): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/validate`, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
    })

    return res.ok
  } catch {
    return false
  }
}
