'use client'

import { logoutUser } from '@/app/lib/authApi'
import { clearAuthCookies } from '@/app/lib/authCookies'

export const LogoutButton = () => {
  const handleLogout = async () => {
    try {

      const refreshToken = localStorage.getItem('refresh_token')
      console.log("refresh : ",refreshToken);
      
      if(refreshToken){
        await logoutUser(refreshToken.toString())
      }
      clearAuthCookies()

      window.location.href = '/login'
    
    } catch (err) {
      
      console.error('Session already expired')
    } 
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
    >
      Logout
    </button>
  )
}
