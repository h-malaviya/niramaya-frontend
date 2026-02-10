import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NavBar from '../components/common/NavBar'


export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const token = (await cookies()).get('refresh_token')?.value

    if (!token) redirect('/login')

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <NavBar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
