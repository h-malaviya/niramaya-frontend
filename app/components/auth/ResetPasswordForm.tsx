'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/app/lib/authApi'
import { passwordRegex } from '@/app/lib/utils'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [showPassword, setShowPassword] = useState(false)

  // 3. Validation Logic
  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return
    if (!token) return setErrors({ form: 'Invalid or missing reset token' })
    setIsLoading(true)
    try {
      setStatus('loading')

      await resetPassword({
        token,
        new_password: formData.password,
      })

      setStatus('success')
      setTimeout(() => router.push('/login'), 2500)
    } catch (err: any) {
      setStatus('error')
      setErrors({ form: err.message || 'Reset failed' })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600">Password Reset</h2>
        <p className="mt-2 text-gray-600">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Global Form Error (e.g. invalid token) */}
      {errors.form && (
        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md border border-red-100">
          {errors.form}
        </div>
      )}

      {status === 'error' && (
        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md border border-red-100">
          Something went wrong. Please try again or request a new link.
        </div>
      )}

      <div>
        <input
          type={showPassword ? 'text' : 'password'}
          className="input w-full"
          placeholder="New Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      <div>
        <input
          type={showPassword ? 'text' : 'password'}
          className="input w-full"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          id="show"
          onChange={() => setShowPassword(!showPassword)}
        />
        <label htmlFor="show" className="cursor-pointer">Show Password</label>
      </div>

      <button
        type="submit"
        disabled={!token || isLoading}
        className="btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Resetting...
          </span>
        ) : (
          'Reset Password'
        )}
      </button>

    </form>

  )
}