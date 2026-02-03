'use client'

import  { Suspense } from 'react'
import { AuthLayout } from '@/app/components/auth/AuthLayout'

import ResetPasswordContent from '@/app/components/auth/ResetPasswordContent'

export default function ResetPasswordPage() {

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter the email address associated with your account and we'll send you a link to reset your password."
    >
      
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  )
}