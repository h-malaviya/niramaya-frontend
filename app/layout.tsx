import './globals.css'
import { ToastProvider } from './components/providers/ToastProvider'

export default async function Layout({
    children
}: {
    children: React.ReactNode;
}) {
    
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}