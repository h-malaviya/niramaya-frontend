"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { PaginationState } from "./types";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  isPending?: boolean;
}

export default function Pagination({ pagination, onPageChange, isPending = false }: PaginationProps) {
  const { page, total_pages } = pagination;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (total_pages <= maxVisible) {
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(total_pages);
      } else if (page >= total_pages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = total_pages - 4; i <= total_pages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(total_pages);
      }
    }

    return pages;
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-2 border-slate-200 rounded-2xl p-6 transition-opacity",
      isPending && "opacity-50 pointer-events-none"
    )}>
      
      {/* Results Info */}
      <div className="text-sm text-slate-600 font-medium">
        Showing page <span className="font-bold text-slate-900">{page}</span> of{" "}
        <span className="font-bold text-slate-900">{total_pages}</span>
      </div>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1 || isPending}
          className={cn(
            "p-2 rounded-lg transition-all",
            page === 1 || isPending
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
          )}
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || isPending}
          className={cn(
            "p-2 rounded-lg transition-all",
            page === 1 || isPending
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum, idx) => (
            <React.Fragment key={idx}>
              {pageNum === "..." ? (
                <span className="px-3 py-2 text-slate-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(pageNum as number)}
                  disabled={isPending}
                  className={cn(
                    "min-w-[40px] px-3 py-2 rounded-lg font-bold text-sm transition-all",
                    pageNum === page
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100",
                    isPending && "cursor-not-allowed"
                  )}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile: Current Page Indicator */}
        <div className="sm:hidden px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">
          {page}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === total_pages || isPending}
          className={cn(
            "p-2 rounded-lg transition-all",
            page === total_pages || isPending
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(total_pages)}
          disabled={page === total_pages || isPending}
          className={cn(
            "p-2 rounded-lg transition-all",
            page === total_pages || isPending
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-600"
          )}
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}