import React from "react";
import { Clock } from "lucide-react";
import { DoctorSlot } from "./Types";
import SlotButton from "./SlotButton";

interface TimeSlotSectionProps {
  title: string
  slots: DoctorSlot[]
  selectedSlot: string | null
  isHolding: boolean
  onSlotSelect: (
    slotKey: string,
    start: string,
    end: string
  ) => void
}

export default function TimeSlotSection({
  title,
  slots,
  selectedSlot,
  isHolding,
  onSlotSelect
}: TimeSlotSectionProps) {
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {slots.map(slot => {
          const slotKey = `${slot.start_time}-${slot.end_time}`
          // console.debug("slot ",selectedSlot," |" , slotKey)
          return (
            <SlotButton
              key={slotKey}
              slot={slot}
              isSelected={selectedSlot == slotKey }
              isHolding={isHolding && selectedSlot == slotKey}
              onClick={() =>
                onSlotSelect(slotKey, slot.start_time, slot.end_time)
              }
            />
          )
        })}

      </div>
    </div>
  );
}