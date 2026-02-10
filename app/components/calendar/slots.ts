import { DoctorSlotsRangeResponse, DoctorDayAvailability } from "./Types"

export function buildSlotsByDate(
  data: DoctorSlotsRangeResponse | null
): Record<string, DoctorDayAvailability> {
  if (!data) return {}

  return data.days.reduce((acc, day) => {
    acc[day.available_date] = day
    return acc
  }, {} as Record<string, DoctorDayAvailability>)
}