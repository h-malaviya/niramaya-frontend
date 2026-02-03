import { AuthForm } from '@/app/components/auth/AuthForm'
import { AuthLayout } from '@/app/components/auth/AuthLayout'

export default function SignupPage() {
  return (
    <AuthLayout
      title="Get your free account now."
      subtitle="Let’s get you all set up so you can verify your personal account and begin setting up your profile."
    >
       <AuthForm mode="signup" />
    </AuthLayout>
  )
}