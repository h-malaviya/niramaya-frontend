import { AuthForm } from '@/app/components/auth/AuthForm'
import { AuthLayout } from '@/app/components/auth/AuthLayout'

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Login to your Niramaya account">
       <AuthForm mode="login" />
    </AuthLayout>
  )
}