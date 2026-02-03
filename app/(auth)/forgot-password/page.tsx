import { AuthLayout } from '@/app/components/auth/AuthLayout'
import ForgotPasswordForm from '@/app/components/auth/ForgetPasswordForm'

export default function ForgotPasswordPage() {
  
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter the email address associated with your account and we'll send you a link to reset your password."
    >
      <ForgotPasswordForm/>
    </AuthLayout>
  )
}