"use client";

import React, { useState } from "react";
import { Filter, X, DollarSign, Briefcase, MapPin, Users, Award } from "lucide-react";
import { cn } from "@/app/lib/utils";

const CATEGORIES = ["Family Physician", "ENT Specialist", "Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic", "Neurologist", "Gynecologist"];

export default function FilterPanel({ filters, onFiltersChange, onApply, onReset }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = filters.category.length + filters.gender.length + (filters.location ? 1 : 0);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div className={cn("fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setIsOpen(false)} />

      <div className={cn(
        "bg-white rounded-2xl border-2 border-slate-200 flex flex-col shadow-sm",
        "fixed lg:sticky top-0 right-0 h-full lg:h-[calc(100vh-140px)] w-[300px] lg:w-full z-50 lg:z-auto",
        "transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-slate-800">Filters</span>
            {activeFiltersCount > 0 && <span className="bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>}
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 hover:bg-slate-200 rounded-md"><X className="w-5 h-5" /></button>
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Category */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Briefcase className="w-3 h-3" /> Speciality
            </label>
            <div className="grid grid-cols-1 gap-1">
              {CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-2 p-2 rounded-lg hover:bg-cyan-50 cursor-pointer group transition-colors">
                  <input 
                    type="checkbox" 
                    checked={filters.category.includes(cat)} 
                    onChange={() => {
                      const next = filters.category.includes(cat) ? filters.category.filter((c: string) => c !== cat) : [...filters.category, cat];
                      onFiltersChange({...filters, category: next});
                    }}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-cyan-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fees */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Max Consultation Fee
            </label>
            <input 
              type="range" min="0" max="5000" step="500" 
              value={filters.fees_max} 
              onChange={(e) => onFiltersChange({...filters, fees_max: Number(e.target.value)})}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>₹0</span>
              <span className="text-cyan-600 px-2 py-1 bg-cyan-50 rounded">Up to ₹{filters.fees_max}</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Location
            </label>
            <input 
              type="text" 
              placeholder="Search city..." 
              value={filters.location}
              onChange={(e) => onFiltersChange({...filters, location: e.target.value})}
              className="w-full p-2 text-sm border text-slate-800 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex gap-2">
          <button onClick={onReset} className="flex-1 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Reset</button>
          <button onClick={() => { onApply(); setIsOpen(false); }} className="flex-1 py-2 text-sm font-bold text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 shadow-md shadow-cyan-200 transition-colors">Apply</button>
        </div>
      </div>

      {/* Mobile FAB */}
      <button onClick={() => setIsOpen(true)} className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 animate-bounce">
        <Filter className="w-6 h-6" />
        {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-white">{activeFiltersCount}</span>}
      </button>
    </>
  );
}