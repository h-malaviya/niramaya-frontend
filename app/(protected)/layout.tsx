import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import NavBar from '../components/home/NavBar'
export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const token = (await cookies()).get('refresh_token')?.value

    if (!token) redirect('/login')

    const res = await fetch('http://127.0.0.1:8000/validate', {
        method: 'GET',
        headers: {
            Cookie: `refresh_token=${token}`,
        },
        cache: 'no-store',
    })

    if (!res.ok) {
        redirect('/login')
    }

    return (
        <>
            <NavBar />
            {children}
        </>
    )
}
