export const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  role: string
) => {
  const cookieOptions = "path=/; SameSite=Lax";
  
  document.cookie = `access_token=${accessToken}; ${cookieOptions}`;
  document.cookie = `refresh_token=${refreshToken}; ${cookieOptions}`;
  document.cookie = `role=${role}; ${cookieOptions}`;
};

/**
 * Clear authentication cookies on the client side
 */
export const clearAuthCookies = () => {
  const cookieOptions = "path=/; max-age=0; SameSite=Lax";
  
  document.cookie = `access_token=; ${cookieOptions}`;
  document.cookie = `refresh_token=; ${cookieOptions}`;
  document.cookie = `role=; ${cookieOptions}`;
};