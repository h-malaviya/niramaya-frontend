// Patient appointment types

export interface PendingPaymentRequest {
  appointment_id: string;
  doctor_name: string;
  date: string;
  start_time: string;
  end_time: string;
  expires_at: string;
}

export interface UpcomingAppointment {
  appointment_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'paid';
  doctor: {
    id: string;
    name: string;
    email: string;
    profile_image_url: string,
    city: string,
    state: string
  };
  description: string;
  report_urls: string[];
  payment: {
    amount: number;
    currency: string;
    status: string;
  };
}

export interface AppointmentHistory {
  appointment_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'expired' | 'paid' | 'cancelled';
  doctor?: {
    id: string;
    name: string;
    email: string;
    profile_image_url:string;
  };
  patient?: {
    id: string;
    name: string;
    email: string;
    profile_image_url:string;
  };
  description: string;
  report_urls: string[];
  payment: {
    amount: number;
    currency: string;
    status: string;
  };
  created_at: string;
  
}

export type AppointmentTab = 'pending' | 'upcoming' | 'history';