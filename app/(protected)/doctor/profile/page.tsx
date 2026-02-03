// Doctor Profile page with server-side rendering

import { Suspense } from 'react';
import ProfileForm from '../../../components/profile/ProfileForm';
import { ProfileSkeleton } from '../../../components/ui/LoadingSkeleton';
import { ProfileErrorBoundary } from '../../../components/ui/ErrorBoundary';

export default async function DoctorProfilePage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Doctor Profile Settings</h1>
              <p className="mt-2 text-blue-100">
                Manage your professional information and patient-facing details
              </p>
            </div>
          </div>

          <div className="px-8 py-10">
            <ProfileErrorBoundary>
              <Suspense fallback={<ProfileSkeleton />}>
                <ProfileForm  />
              </Suspense>
            </ProfileErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}