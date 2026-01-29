import { NextRequest, NextResponse } from "next/server";

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/patient": ["patient"],
  "/doctor": ["doctor"],
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value
  const role = req.cookies.get('role')?.value as string

  const protectedPath = Object.keys(ROUTE_PERMISSIONS).find((path) =>
    pathname.startsWith(path)
  )

  if (!protectedPath) return NextResponse.next()

  if (!refreshToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!role) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const allowedRoles = ROUTE_PERMISSIONS[protectedPath]
  if (!allowedRoles.includes(role)) {
    let fallback = '/login'

    if (role === 'doctor') fallback = '/doctor/home'
    if (role === 'patient') fallback = '/patient/home'

    return NextResponse.redirect(new URL(fallback, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*"],
};