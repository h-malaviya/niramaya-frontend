'use client'

import { useState } from 'react'
import { logoutUser, validateSession } from '@/app/lib/authApi'
import { clearAuthCookies } from '@/app/lib/authCookies'

export const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)

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
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`px-4 py-2 text-sm font-medium text-white rounded
        ${isLoading
          ? 'bg-red-400 cursor-not-allowed'
          : 'bg-red-500 hover:bg-red-600'
        }`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Logging out...
        </span>
      ) : (
        'Logout'
      )}
    </button>
  )
}
