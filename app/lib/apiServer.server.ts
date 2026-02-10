import "server-only";
import { cookies } from "next/headers"

export async function serverFetch(
  url: string,
  options: RequestInit = {}
) {
  const cookieStore =await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  const headers = new Headers(options.headers)

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`,
    {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store", 
    }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw {
      status: res.status,
      message: body?.detail ?? "Something went wrong",
    }
  }

  return res.json()
}
