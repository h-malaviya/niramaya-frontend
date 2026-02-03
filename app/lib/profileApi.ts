import { DoctorProfile, ProfileResponse, UpdateDoctorProfilePayload, UpdateUserProfilePayload, UserProfile } from "../types/profile"
import api from "./apiClient"

export const getMyProfile = async (): Promise<ProfileResponse> => {
  const res = await api.get("/profile/me")
  return res.data
}

export const updateUserProfile = async (
  payload: UpdateUserProfilePayload
): Promise<UserProfile> => {
  const res = await api.put("/profile/me", payload)
  return res.data
}

export const updateDoctorProfile = async (
  payload: UpdateDoctorProfilePayload
): Promise<DoctorProfile> => {
  const res = await api.put("/profile/doctor", payload)
  return res.data
}

export const uploadProfileImage = async (
  file: File
): Promise<{ message: string; image_url: string }> => {
  const formData = new FormData()
  formData.append("file", file)

  const res = await api.put("/profile/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return res.data
}
