import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}
export const getCookie = (name: string): string | null => {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
  return match ? match.split('=')[1] : null
}

export const passwordRegex = /^.{6,}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const DEFAULT_PROFILE_IMAGE ="https://cdn-icons-png.flaticon.com/512/387/387561.png"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}