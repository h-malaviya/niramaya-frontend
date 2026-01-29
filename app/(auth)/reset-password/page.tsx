'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/app/components/auth/AuthLayout'
import ResetPasswordForm from '@/app/components/auth/ResetPasswordForm'
import { passwordRegex } from '@/app/lib/utils'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

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

    if (!token) {
      setErrors({ form: 'Invalid or missing reset token.' })
      return
    }

    setStatus('loading')

    try {
      // 4. API Call to backend
      const res = await fetch('YOUR_BACKEND_API/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          newPassword: formData.password 
        }),
      })

      if (!res.ok) throw new Error('Failed to reset password')

      setStatus('success')
      
      // Optional: Redirect after 2 seconds
      setTimeout(() => router.push('/login'), 3000)

    } catch (error) {
      setStatus('error')
    }
  }

  // 5. Success State UI
  if (status === 'success') {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
        <p className="text-gray-600 mb-6">Your password has been reset successfully.</p>
        <Link href="/login" className="btn-primary w-full block text-center">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <AuthLayout
          title="Reset Password"
          subtitle="Enter the email address associated with your account and we'll send you a link to reset your password."
        >
          <ResetPasswordForm/>
    </AuthLayout>
  )
}