import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

// Disable caching for auth pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;