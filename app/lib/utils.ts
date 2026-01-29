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