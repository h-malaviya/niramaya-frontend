import React from "react";
import DoctorCard from "./Doctorcard";
import LoadingState from "./Loadingstate";
import EmptyState from "./Emptystate";
import { DoctorsApiResponse } from "./types";

interface DoctorsListProps {
  data: DoctorsApiResponse;
  isLoading?: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export default function DoctorsList({ 
  data, 
  isLoading = false, 
  hasActiveFilters,
  onResetFilters 
}: DoctorsListProps) {
  const doctors = Array.isArray(data?.doctors) ? data.doctors : []
  // Results Header
  const ResultsHeader = () => (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          {data.pagination.total_results} Doctors Found
        </h2>
        {hasActiveFilters && (
          <p className="text-sm text-slate-600 mt-1">
            Showing filtered results
          </p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (data.doctors.length === 0) {
    return (
      <EmptyState
        hasFilters={hasActiveFilters}
        onReset={onResetFilters}
      />
    );
  }
  return (
    <>
      <ResultsHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </>
  );
}