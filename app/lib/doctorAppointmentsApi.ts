import api from "./apiClient"

export const getUpcomingAppointments = async (filters: any) => {
  const res = await api.get("/doctors/upcoming-appointments", {
    params: {
      status: filters.status,
      start_date: filters.startDate,
      end_date: filters.endDate,
      search: filters.search
    }
  })
  return res.data
}

export const acceptAppointment = async (id: string) => {
  await api.post(`/appointments/${id}/accept`)
}

export const rejectAppointment = async (id: string) => {
  await api.post(`/appointments/${id}/reject`)
}
