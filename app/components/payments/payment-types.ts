// Payment page types

export interface PaymentInfo {
  appointment_id: string;
  amount: number;
  currency: string;
  expires_at: string;
  client_secret: string;
}

export interface AppointmentPaymentDetails {
  appointment_id: string;
  doctor_name: string;
  date: string;
  start_time: string;
  end_time: string;
  description?: string;
  amount: number;
  currency: string;
  expires_at: string;
}