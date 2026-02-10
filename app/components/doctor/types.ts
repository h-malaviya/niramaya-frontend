// Types for Doctors Listing Page


export interface Doctor {
  id: string
  first_name: string
  last_name: string
  gender: string
  city: string | null
  state: string | null
  profile_image_url: string | null
  consultation_fee: number | null
  experience_years: number
  about: string | null
  categories: string[]
  qualifications: string[]
}

export interface PaginationState {
  page: number
  per_page: number
  total_results: number
  total_pages: number
}

export interface DoctorsApiResponse {
  doctors: Doctor[]
  pagination: PaginationState
}

export interface DoctorsApiParams {
  page?: number
  per_page?: number
  search?: string
  fees_min?: number
  fees_max?: number
  category?: string[]
  location?: string
  experience_min?: number
  experience_max?: number
  gender?: string[]
}

export interface FilterState {
  fees_min: number;
  fees_max: number;
  category: string[];
  location: string;
  experience_min: number;
  experience_max: number;
  gender: string[];
}

