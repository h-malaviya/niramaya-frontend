import { cn } from "@/app/lib/utils"
import { Clock } from "lucide-react"
import { DoctorSlot } from "./Types"


export default function SlotButton({
  slot,
  isSelected,
  isHolding,
  onClick,
}: {
  slot: DoctorSlot
  isSelected: boolean
  isHolding: boolean
  onClick: () => void
}) {
  const isAvailable = slot.state === "available"
  const isBooked = slot.state === "booked"
  const isBlocked = slot.state === "hold"
  if (isHolding) {
    console.debug("is holding : ", isHolding)
  }
  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={cn(
        "relative py-3 px-4 rounded-xl border flex flex-col items-start transition-all duration-200",

        // ✅ Available
        isAvailable &&
        !isSelected &&
        "bg-green-50 border-green-300 hover:border-green-500 hover:shadow-md cursor-pointer",

        // ✅ Selected
        isSelected &&
        "bg-blue-600 border-blue-600 ring-2 ring-blue-200 z-10",

        // ✅ Booked (Red)
        isBooked &&
        "bg-red-50 border-red-300 cursor-not-allowed",

        // ✅ Blocked (Gray)
        isBlocked &&
        "bg-gray-100 border-gray-300 cursor-not-allowed"
      )}
    >
      <div className="flex justify-between w-full items-center mb-1">
        {isHolding ? (
          <span className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            Holding...
          </span>
        ) : (
          <>
            <Clock className="w-4 h-4 text-slate-400" />
            {!isAvailable && (
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {slot.state === "booked" ? "Booked" : "Blocked"}
              </span>
            )}
          </>
        )}
      </div>
      <span
        className={cn(
          "text-sm font-bold",
          isSelected
            ? "text-white"
            : isBooked
              ? "text-red-600"
              : isBlocked
                ? "text-gray-500"
                : "text-green-700"
        )}
      >
        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
      </span>
    </button>
  )
}
