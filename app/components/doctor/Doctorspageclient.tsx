"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "../common/Searchbar";
import FilterPanel from "./Filterpanel";
import DoctorsList from "./Doctorslist";
import Pagination from "./Pagination";
import { FilterState, DoctorsApiResponse, DoctorsApiParams } from "./types";

const PER_PAGE = 6

const INITIAL_FILTERS: FilterState = {
  fees_min: 0,
  fees_max: 5000,
  category: [],
  location: "",
  experience_min: 0,
  experience_max: 50,
  gender: [],
}

interface Props {
  initialData: DoctorsApiResponse
  initialParams: DoctorsApiParams
}

export default function DoctorsPageClient({ initialData, initialParams }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentPage = Number(searchParams.get("page")) || 1
  const currentSearch = searchParams.get("search") || ""

  const [filters, setFilters] = useState<FilterState>({
    fees_min: initialParams.fees_min || 0,
    fees_max: initialParams.fees_max || 5000,
    category: initialParams.category || [],
    location: initialParams.location || "",
    experience_min: initialParams.experience_min || 0,
    experience_max: initialParams.experience_max || 50,
    gender: initialParams.gender || [],
  })

  const updateURL = (params: Partial<DoctorsApiParams>) => {
    const qs = new URLSearchParams()

    qs.set("page", String(params.page ?? 1))
    qs.set("per_page", String(PER_PAGE))

    if (params.search) qs.set("search", params.search)
    if (params.fees_max && params.fees_max < 5000) qs.set("fees_max", String(params.fees_max))
    if (params.location) qs.set("location", params.location)

    params.category?.forEach((c) => qs.append("category", c))
    params.gender?.forEach((g) => qs.append("gender", g))

    startTransition(() => {
      router.push(`?${qs.toString()}`)
    })
  }

  const handleSearch = (q: string) =>
    updateURL({ page: 1, search: q, ...filters })

  const handleApplyFilters = () =>
    updateURL({ page: 1, search: currentSearch, ...filters })

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS)
    updateURL({ page: 1 })
  }

  const handlePageChange = (page: number) => {
    updateURL({ page, search: currentSearch, ...filters })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.location !== "" ||
    !!currentSearch

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Desktop Sidebar (280px Sticky) */}
        <aside className="hidden lg:block w-[280px] sticky top-28 shrink-0">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Panel (Hidden on Desktop) */}
        <div className="lg:hidden">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white p-2 rounded-2xl shadow-sm border-2 border-slate-100">
            <SearchBar onSearch={handleSearch} defaultValue={currentSearch} />
          </div>

          <div className={isPending ? "opacity-50 transition-opacity" : ""}>
            <DoctorsList
              data={initialData}
              isLoading={isPending} 
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Pagination - Always visible at bottom of content if results exist */}
          {initialData.pagination.total_pages > 1 && (
            <div className="pt-4 pb-12">
              <Pagination
                pagination={initialData.pagination}
                onPageChange={handlePageChange}
                isPending={isPending}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}