import { AuthForm } from '@/app/components/auth/AuthForm'
import { AuthLayout } from '@/app/components/auth/AuthLayout'
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
export default async function LoginPage() {
  const refreshToken = (await cookies()).get("refresh_token")?.value;
  const role = (await cookies()).get("role")?.value;

  // If authenticated, server redirect before rendering UI
  if (refreshToken && role) {
    const destination = role === 'doctor'
      ? '/doctor/appointments'
      : '/patient/doctors';

    return redirect(destination);
  }
  return (
    <AuthLayout title="Welcome back" subtitle="Login to your Niramaya account">
       <AuthForm mode="login" />
    </AuthLayout>
  )
}