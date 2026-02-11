
import React, { useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";

import SidebarHeader from "./Sidebarheader";
import SidebarFooter from "./SIdebarfooter";
import { cn } from "@/app/lib/utils";
import SidebarContent from "./Sidebarcontent";

import { DoctorDayAvailability } from "./Types"

interface DetailsSidebarProps {
  selectedDate: Date | null
  dayAvailability: DoctorDayAvailability | null
  selectedSlot: string | null
  description: string
  files: File[]


  onDescriptionChange: (v: string) => void
  onFilesChange: (files: File[]) => void
  canShowForm: boolean
  onClose: () => void
  isHolding:boolean
  isConfirming:boolean
  onSlotSelect: (
    slotKey: string,
    start: string,
    end: string
  ) => void
  onConfirmBooking: () => void
}


export default function DetailsSidebar({
  selectedDate,
  selectedSlot,
  isHolding,
  onClose,
  canShowForm,
  dayAvailability,
  onSlotSelect,
  onConfirmBooking,
  description,
  files,
  onDescriptionChange,
  onFilesChange
}: DetailsSidebarProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity",
          selectedDate ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0  h-full w-[80%] max-w-[400px] bg-white shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-in-out transform",
        "lg:static lg:w-[400px] lg:h-auto lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-200 lg:translate-x-0",
        selectedDate ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <SidebarHeader
          selectedDate={selectedDate}
          onClose={onClose}
        />

        <SidebarContent
          selectedDate={selectedDate}
          dayAvailability={dayAvailability}
          selectedSlot={selectedSlot}
          onSlotSelect={onSlotSelect}
          canShowForm={canShowForm}
          description={description}
          isHolding={isHolding}
          files={files}
          onDescriptionChange={onDescriptionChange}
          onFilesChange={onFilesChange}
        />

        <SidebarFooter
          selectedDate={selectedDate}
          isConfirming={isConfirming}
          selectedSlot={selectedSlot}
          onConfirmBooking={onConfirmBooking}
        />
      </div>
    </>
  );
}