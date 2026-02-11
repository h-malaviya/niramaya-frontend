'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  IndianRupee,
  ArrowRight,
  Loader2,
  Home,
  X
} from 'lucide-react';

import confetti from 'canvas-confetti';
import api, { getErrorMessage } from '@/app/lib/apiClient';

interface PaymentSuccessProps {
  appointmentId: string;
}

export default function PaymentSuccess({ appointmentId }: PaymentSuccessProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  useEffect(() => {
    confirmPayment();
    // Trigger confetti celebration
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#06b6d4', '#3b82f6', '#10b981']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#06b6d4', '#3b82f6', '#10b981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [appointmentId]);

  const confirmPayment = async () => {
    try {
      setConfirming(true);
      const response = await api.post(`/appointments/${appointmentId}/confirm-payment`);
      setAppointmentDetails(response.data);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold text-lg">Confirming your payment...</p>
          <p className="text-slate-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-2 border-red-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">Confirmation Failed</h2>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/patient/appointments')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Payment Successful!</h1>
          <p className="text-lg text-slate-600">Your appointment has been confirmed</p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden mb-6">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-semibold mb-1">APPOINTMENT CONFIRMED</p>
                <p className="text-2xl font-bold">Booking #{appointmentId.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Details */}
          {appointmentDetails && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {appointmentDetails.doctor && (
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase">Doctor</span>
                    </div>
                    <p className="font-bold text-slate-900 text-lg">Dr. {appointmentDetails.doctor.name}</p>
                  </div>
                )}

                {appointmentDetails.date && (
                  <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-bold text-purple-700 uppercase">Date</span>
                    </div>
                    <p className="font-bold text-slate-900 text-lg">
                      {new Date(appointmentDetails.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {appointmentDetails.start_time && (
                  <div className="p-4 bg-cyan-50 rounded-xl border-2 border-cyan-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-cyan-600" />
                      <span className="text-xs font-bold text-cyan-700 uppercase">Time</span>
                    </div>
                    <p className="font-bold text-slate-900 text-lg">
                      {appointmentDetails.start_time} - {appointmentDetails.end_time}
                    </p>
                  </div>
                )}

                {appointmentDetails.payment && (
                  <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                    <div className="flex items-center gap-3 mb-2">
                      <IndianRupee className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase">Amount Paid</span>
                    </div>
                    <p className="font-bold text-slate-900 text-lg">
                      ₹{(appointmentDetails.payment.amount / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation Message */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-900 mb-2">What's Next?</p>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• A confirmation email has been sent to your registered email address</li>
                      <li>• You can view this appointment in your "Upcoming" tab</li>
                      <li>• Join the video call 5 minutes before your appointment time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 bg-slate-50 border-t-2 border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/patient/appointments')}
              className="py-3 px-6 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              View All Appointments
            </button>

          </div>
        </div>

      
      </div>
    </div>
  );
}