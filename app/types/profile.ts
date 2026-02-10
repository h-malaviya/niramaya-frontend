export type Gender = "male" | "female" | "other"

export interface UserProfile {
  country: string
  state: string
  city: string
  address: string
  phone_number: string
  id: string
  email: string
  first_name: string
  last_name: string
  gender: Gender
  date_of_birth?: string
  profile_image_url?: string
}

export interface DoctorProfile {
  about: string
  consultation_fee: number
  id: string
  qualifications: string
  experience_years: number
  category_names?: string[]
}

export interface ProfileResponse {
  user: UserProfile
  doctor_profile?: DoctorProfile
}

export interface UpdateProfilePayload {
  user?: {
    first_name?: string
    last_name?: string
    phone_number?: string
    address?: string
    city?: string
    state?: string
    country?: string
    gender?: string
    date_of_birth?: string
    profile_image_url?:string
  }
  doctor?: {
    experience_years?: number
    consultation_fee?: number
    about?: string
    qualifications?: string[]
  }
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string

  // doctor only
  experience?: number
  about?: string
  fees?: number
  category?: string
}

// Define the allowed variants for the toast (success, error, etc.)
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Define the structure of a Toast object
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // Optional duration in milliseconds
}