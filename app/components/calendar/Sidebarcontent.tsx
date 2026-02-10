// import React from "react";
// import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";

// import TimeSlotSection from "./Timeslotsection";
// import { DoctorDayAvailability } from "./Types";
// import SidebarBookingForm from "./SidebarBookingForm";


// interface SidebarContentProps {
//   selectedDate: Date | null
//   dayAvailability: DoctorDayAvailability | null
//   selectedSlot: string | null
//   canShowForm: boolean
//   description: string
//   files: File[]
//   onDescriptionChange: (v: string) => void
//   onFilesChange: (f: File[]) => void
//   onSlotSelect: (
//     slotKey: string,
//     start: string,
//     end: string
//   ) => void
// }

// export default function SidebarContent({
//   selectedDate,
//   dayAvailability,
//   selectedSlot,
//   onSlotSelect,
//   canShowForm,
//   description,
//   files,
//   onDescriptionChange,
//   onFilesChange,
  
// }: SidebarContentProps) {
//   if (!selectedDate) {
//     return (
//       <div className="flex-1 p-5 overflow-y-auto bg-white">
//         <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
//           <CalendarIcon className="w-16 h-16 opacity-20" />
//           <p>Select a date to view slots.</p>
//         </div>
//       </div>
//     )
//   }
//   if (!dayAvailability || !dayAvailability.is_active || dayAvailability.slots.length === 0) {
//     return (
//       <div className="flex-1 p-5 overflow-y-auto bg-white">
//         <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center">
//           <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
//           <h3 className="font-bold text-amber-800 mb-1">No Availability</h3>
//           <p className="text-sm text-amber-600">
//             The doctor is unavailable on this date.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   const availableSlots = dayAvailability.slots.filter(
//     s => s.state === "available"
//   )


//   if (dayAvailability?.slots.length === 0) {
//     return (
//       <div className="flex-1 p-5 overflow-y-auto bg-white">
//         <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center">
//           <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
//           <h3 className="font-bold text-amber-800 mb-1">No Availability</h3>
//           <p className="text-sm text-amber-600">The doctor is unavailable on this date.</p>
//         </div>
//       </div>
//     );
//   }
//   if (selectedSlot && !canShowForm) {
//     return (
//       <div className="flex-1 p-5 overflow-y-auto bg-white">
//         <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center">
//           <p className="text-sm text-slate-500 text-center">
//             Holding slot…
//           </p>
//         </div>
//       </div>
//     )
//   }
//   return (
//     <div className="flex-1 p-5 overflow-y-auto bg-white">
//       <div className="space-y-6">
//         {canShowForm && (
//           <SidebarBookingForm
//             description={description}
//             files={files}
//             onDescriptionChange={onDescriptionChange}
//             onFilesChange={onFilesChange}
//           />
//         )}

//         <TimeSlotSection
//           title="Morning"
//           slots={dayAvailability?.slots.slice(0, 3) || []}
//           selectedSlot={selectedSlot}
//           onSlotSelect={onSlotSelect}
//         />

//         <TimeSlotSection
//           title="Afternoon"
//           slots={dayAvailability?.slots.slice(3) || []}
//           selectedSlot={selectedSlot}
//           onSlotSelect={onSlotSelect}
//         />
//       </div>
//     </div>
//   );
// }
'use client'
import React from "react"
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import TimeSlotSection from "./Timeslotsection"
import SidebarBookingForm from "./SidebarBookingForm"
import { DoctorDayAvailability } from "./Types"

interface SidebarContentProps {
  selectedDate: Date | null
  dayAvailability: DoctorDayAvailability | null
  selectedSlot: string | null
  canShowForm: boolean
  description: string
  files: File[]
  onDescriptionChange: (v: string) => void
  onFilesChange: (f: File[]) => void
  onSlotSelect: (slotKey: string, start: string, end: string) => void
}

export default function SidebarContent({
  selectedDate,
  dayAvailability,
  selectedSlot,
  onSlotSelect,
  canShowForm,
  description,
  files,
  onDescriptionChange,
  onFilesChange,
}: SidebarContentProps) {

  // 1️⃣ No date selected
  if (!selectedDate) {
    return (
      <div className="flex-1 p-5 flex items-center justify-center text-slate-400 text-center">
        <div className="space-y-3">
          <CalendarIcon className="w-14 h-14 mx-auto opacity-20" />
          <p className="text-sm">Select a date to view available slots</p>
        </div>
      </div>
    )
  }

  // 2️⃣ No availability
  if (!dayAvailability || !dayAvailability.is_active || dayAvailability.slots.length === 0) {
    return (
      <div className="flex-1 p-5">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-amber-800">No Availability</h3>
          <p className="text-sm text-amber-700 mt-1">
            The doctor is unavailable on this date.
          </p>
        </div>
      </div>
    )
  }

  // 3️⃣ Holding slot loader (nice UX)
  if (selectedSlot && !canShowForm) {
    return (
      <div className="flex-1 p-5 flex items-center justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center animate-pulse">
          <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3 animate-spin" />
          <h3 className="font-bold text-blue-900">Holding your slot...</h3>
          <p className="text-sm text-blue-700 mt-1">
            Please wait a moment
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-5 overflow-y-auto bg-white space-y-6">

      {/* 4️⃣ Booking Form (Primary Focus after hold) */}
      {canShowForm && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-emerald-900">Slot Reserved for You</h4>
          </div>

          <SidebarBookingForm
            description={description}
            files={files}
            onDescriptionChange={onDescriptionChange}
            onFilesChange={onFilesChange}
          />
        </div>
      )}

      {/* 5️⃣ Slots (Secondary after hold, disabled look) */}
      <div className={canShowForm ? "opacity-60 pointer-events-none" : ""}>
        <TimeSlotSection
          title="Morning"
          slots={dayAvailability.slots.slice(0, 3)}
          selectedSlot={selectedSlot}
          onSlotSelect={onSlotSelect}
        />

        <TimeSlotSection
          title="Afternoon"
          slots={dayAvailability.slots.slice(3)}
          selectedSlot={selectedSlot}
          onSlotSelect={onSlotSelect}
        />
      </div>
    </div>
  )
}
