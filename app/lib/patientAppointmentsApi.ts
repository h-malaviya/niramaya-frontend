import api from "./apiClient"

export const getPendingPayments = async () => {
  const res = await api.get("/patients/pending-payments")
  return res.data
}

export const getUpcomingAppointments = async () => {
  const res = await api.get("/patients/upcoming-appointments")
  return res.data
}

export const getAppointmentHistory = async () => {
  const res = await api.get("/patients/appointments/history")
  return res.data
}
