import React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface SidebarFooterProps {
  selectedDate: Date | null
  selectedSlot: string | null
  onConfirmBooking: () => void
}


export default function SidebarFooter({ selectedSlot, onConfirmBooking, selectedDate }: SidebarFooterProps) {
  if (!selectedDate) {
    return null
  }
  return (
    <div className="p-5 border-t border-gray-100 bg-gray-50 lg:rounded-b-2xl">
      <button
        disabled={!selectedSlot}
        className={cn(
          "w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-sm",
          selectedSlot
            ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:scale-[1.01]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
        onClick={onConfirmBooking}
      >
        {selectedSlot ? "Confirm Booking" : "Select a Slot"}
        {selectedSlot && <CheckCircle2 className="w-5 h-5" />}
      </button>
    </div>
  );
}