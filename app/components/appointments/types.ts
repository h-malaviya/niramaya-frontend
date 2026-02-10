
export interface PatientRequest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date: string;
  start_time: string;
  end_time: string;
  report_urls: string[]; // Cloudinary links
  profile_url: string;
  city: string;
  state: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AppointmentFilters {
  startDate: string;
  endDate: string;
  search: string;
  status: 'pending' | 'approved';
}