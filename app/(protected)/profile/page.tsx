'use client';

import { useEffect } from 'react';

export default async function ProfileRedirectPage() {

  useEffect(() => {
    const redirectToRoleProfile = async () => {
      try {
        const userRole = localStorage.getItem('role');
        if (userRole === 'doctor') {
          window.location.href = '/doctor/profile';
        } else {
          window.location.href = '/patient/profile';
        }

      } catch (error) {
        // Default to patient profile on error
        window.location.href = '/patient/profile';
      }
    };

    redirectToRoleProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Redirecting to your profile...</p>
      </div>
    </div>
  );
}