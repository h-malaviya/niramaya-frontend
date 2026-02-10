"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search doctors by name, speciality, location...",
  defaultValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={cn(
        "relative flex items-center bg-white border-2 rounded-2xl transition-all duration-300 overflow-hidden",
        isFocused 
          ? "border-cyan-500 shadow-lg shadow-cyan-100" 
          : "border-slate-200 hover:border-slate-300"
      )}>
        <div className="pl-5 pr-3 py-4">
          <Search className={cn(
            "w-5 h-5 transition-colors",
            isFocused ? "text-cyan-600" : "text-slate-400"
          )} />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 py-4 pr-4 text-slate-700 placeholder-slate-400 bg-transparent outline-none font-medium text-[15px]"
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-3 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
        
        <button
          type="submit"
          className="mr-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          Search
        </button>
      </div>
    </form>
  );
}