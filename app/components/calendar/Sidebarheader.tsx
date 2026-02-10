import React from "react";
import { format } from "date-fns";
import { X } from "lucide-react";

interface SidebarHeaderProps {
  selectedDate: Date | null;
  onClose: () => void;
}

export default function SidebarHeader({ selectedDate, onClose }: SidebarHeaderProps) {
  return (
    <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
      <h2 className="text-lg font-bold text-slate-800">
        {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Details"}
      </h2>
      <button 
        onClick={onClose} 
        className="lg:hidden p-2 bg-white text-slate-500 hover:text-slate-800 hover:bg-gray-100 rounded-full shadow-sm border border-gray-100 transition-all"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}