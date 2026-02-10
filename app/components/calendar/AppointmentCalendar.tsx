"use client";

import React, { useState, useMemo } from "react";
import { addMonths, subMonths, startOfDay, isBefore, isSameDay, format } from "date-fns";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import DetailsSidebar from "./Detailssidebar";
import { DoctorSlotsRangeResponse } from "./Types";
import { buildSlotsByDate } from "./slots";
import api, { getErrorMessage } from "@/app/lib/apiClient";
import { useToastContext } from "@/app/lib/hooks/useToast";
import CalendarOverlayLoader from "./CalendarOverlayLoader";

interface AppointmentCalendarProps {
  data: DoctorSlotsRangeResponse | null
}

export default function AppointmentCalendar({
  data,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null)
  const [isHolding, setIsHolding] = useState(false)
  const { success, error: showError } = useToastContext();
  const [isLoadingSlots, setIsLoadingSlots] = useState(!data)

  const [slotsData, setSlotsData] = useState<DoctorSlotsRangeResponse | null>(data)
  const slotsByDate = useMemo(
    () => buildSlotsByDate(data),
    [slotsData]
  )
  const onDateClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;
    setSelectedDate(day);
    setSelectedSlot(null);
  };
  const canShowForm = Boolean(appointmentId)

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null
    const key = format(selectedDate, "yyyy-MM-dd")
    return slotsByDate[key] ?? null
  }, [selectedDate, slotsByDate])
  const fetchSlots = async () => {
  try {
    setIsLoadingSlots(true)
    const res = await api.get(
      `/doctors/${data?.doctor_id}/slots/range`
    )
    setSlotsData(res.data)
  } catch (err) {
    console.error("Failed to refresh slots", err)
  }finally {
    setIsLoadingSlots(false)
  }
}

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleCloseDetails = () => setSelectedDate(null);
  const handleSlotSelect = async (
    slotKey: string,
    slotStart: string,
    slotEnd: string
  ) => {
    if (!selectedDate || isHolding) return

    setIsHolding(true)

    try {
      const formData = new FormData()
      formData.append("doctor_id", data!.doctor_id)
      formData.append(
        "appointment_date",
        format(selectedDate, "yyyy-MM-dd")
      )
      formData.append("start_time", slotStart) // "10:00:00"
      formData.append("end_time", slotEnd)     // "10:20:00"

      const res = await api.post(
        "/appointments/hold",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      setSelectedSlot(slotKey)
      setAppointmentId(res.data.appointment_id)
      setHoldExpiresAt(new Date(res.data.lock_expires_at))

      success("Slot held for 10 minutes")
      await fetchSlots()

    } catch (err: any) {
      showError(getErrorMessage(err))

      setSelectedSlot(null)
      setAppointmentId(null)
      setHoldExpiresAt(null)
      await fetchSlots()

    } finally {
      setIsHolding(false)
    }
  }

  const handleConfirmBooking = async () => {
    if (!appointmentId) return

    try {
      const formData = new FormData()
      if (description) {
        formData.append("description", description)
      }

      files.forEach(file => {
        formData.append("files", file)
      })

      await api.post(
        `/appointments/${appointmentId}/request-booking`,
        formData
      )

      success("Booking request sent to doctor")

      // cleanup
      setAppointmentId(null)
      setSelectedSlot(null)
      setDescription("")
      setFiles([])

    } catch (err: any) {

      showError(getErrorMessage(err))
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 p-4 lg:p-6 gap-6 font-sans text-slate-800 overflow-hidden">
      {isLoadingSlots && <CalendarOverlayLoader />}
      {/* Main Calendar Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 flex flex-col h-full overflow-hidden">
        <CalendarHeader
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <CalendarGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onDateClick={onDateClick}
          slotsByDate={slotsByDate}
        />
      </div>

      {/* Details Sidebar */}
      <DetailsSidebar
        selectedDate={selectedDate}
        dayAvailability={selectedDayData}
        selectedSlot={selectedSlot}
        description={description}
        files={files}
        canShowForm={canShowForm}
        onDescriptionChange={setDescription}
        onFilesChange={setFiles}
        onClose={handleCloseDetails}
        onSlotSelect={handleSlotSelect}
        onConfirmBooking={handleConfirmBooking}

      />


    </div>
  );
}