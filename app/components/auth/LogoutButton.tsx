'use client'

import { logoutUser } from '@/app/lib/authApi'
import { clearAuthCookies } from '@/app/lib/authCookies'

export const LogoutButton = () => {
  const handleLogout = async () => {
    try {

      const refreshToken = localStorage.getItem('refresh_token')
      
      if(refreshToken){
        await logoutUser(refreshToken.toString())
      }
      clearAuthCookies()
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('role')
      window.location.href = '/login'
    
    } catch (err) {
      
      console.error('Session already expired')
    } finally{

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
