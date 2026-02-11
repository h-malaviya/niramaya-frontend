export const dynamic = "force-dynamic";

import React from "react";
import { Stethoscope } from "lucide-react";
import DoctorsPageClient from "@/app/components/doctor/Doctorspageclient";
import { DoctorsApiParams } from "@/app/components/doctor/types";
import { buildQueryString } from "@/app/components/doctor/helpers";
import { fetchDoctorsFromServer } from "@/app/lib/doctorApi.server";

// Server Component - fetches initial data
export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const paramsObj = await searchParams
  const page = Number(paramsObj.page) || 1
  const search = (paramsObj.search as string) || ""
  const per_page = Number(paramsObj.per_page) || 6
 
  const fees_min = paramsObj.fees_min ? Number(paramsObj.fees_min) : undefined;
  const fees_max = paramsObj.fees_max ? Number(paramsObj.fees_max) : undefined;
  const category = paramsObj.category 
    ? Array.isArray(paramsObj.category) 
      ? paramsObj.category 
      : [paramsObj.category]
    : undefined;
  const location = (paramsObj.location as string) || undefined;
  const experience_min = paramsObj.experience_min ? Number(paramsObj.experience_min) : undefined;
  const experience_max = paramsObj.experience_max ? Number(paramsObj.experience_max) : undefined;
  const gender = paramsObj.gender
    ? Array.isArray(paramsObj.gender)
      ? paramsObj.gender
      : [paramsObj.gender]
    : undefined;

  const params: DoctorsApiParams = {
    page,
    search,
    per_page: 6,
    fees_min,
    fees_max,
    category,
    location,
    experience_min,
    experience_max,
    gender,
  };

  // Fetch doctors data on server
  const initialData = await fetchDoctorsFromServer(params);
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-cyan-50/30 to-blue-50/30">
      {/* Header - Server Component */}
      <Header />

      {/* Main Content - Pass to Client Component */}
      <DoctorsPageClient initialData={initialData} initialParams={params} />

      {/* Footer - Server Component */}
      <Footer />
    </div>
  );
}

// Header Server Component
function Header() {
  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Find Your Doctor</h1>
            <p className="text-slate-600 text-sm font-medium">
              Book appointments with verified healthcare professionals
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

// Footer Server Component
function Footer() {
  return (
    <footer className="mt-20 bg-white border-t-2 border-slate-200 py-8">
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 text-sm">
        <p>© 2024 Healthcare Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}