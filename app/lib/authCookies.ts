export const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  role: string
) => {
  document.cookie = `access_token=${accessToken}; path=/`
  document.cookie = `refresh_token=${refreshToken}; path=/`
  document.cookie = `role=${role}; path=/`
}

export const clearAuthCookies = () => {
  document.cookie = 'access_token=; path=/; max-age=0'
  document.cookie = 'refresh_token=; path=/; max-age=0'
  document.cookie = 'role=; path=/; max-age=0'
}

