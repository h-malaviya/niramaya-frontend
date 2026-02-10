export type SlotState = "available" | "hold" | "booked"

export interface DoctorSlot {
  start_time: string        // "10:00:00"
  end_time: string          // "10:20:00"
  state: SlotState
  hold_expires_at: string | null // ISO string or null
}
export interface DoctorDayAvailability {
  available_date: string   // "2026-02-06" (YYYY-MM-DD)
  is_active: boolean
  start_time: string       // "10:00:00"
  end_time: string         // "17:00:00"
  break_start: string | null
  break_end: string | null
  slot_duration: number    // minutes
  slots: DoctorSlot[]
}
export interface DoctorSlotsRangeResponse {
  doctor_id: string
  days: DoctorDayAvailability[]
}
