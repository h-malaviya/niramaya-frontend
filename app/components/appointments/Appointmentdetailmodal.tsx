import { X, Calendar, Clock, User, Mail, FileText, IndianRupee, MapPin, Phone } from "lucide-react";
import { AppointmentHistory, UpcomingAppointment } from "./patient-types";

interface AppointmentDetailModalProps {
  appointment: AppointmentHistory | UpcomingAppointment | null;
  type: 'patient' | 'doctor';
  onClose: () => void;
}

export default function AppointmentDetailModal({ appointment, type, onClose }: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatAmount = (amount: number, currency: string) => {
    return `₹${(amount / 100).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return 'bg-emerald-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-slate-400';
      default:
        return 'bg-amber-500';
    }
  };

  const contactPerson = type === 'patient' 
    ? (appointment as AppointmentHistory).doctor 
    : (appointment as AppointmentHistory).patient;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all animate-slideUp">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-3xl shadow-xl">
              <img src={contactPerson?.profile_image_url} alt={`${contactPerson?.name} profile image`} />
            </div>``
            <div>
              <p className="text-cyan-100 text-sm font-semibold mb-1">
                {type === 'patient' ? 'DOCTOR' : 'PATIENT'}
              </p>
              <h2 className="text-2xl font-bold">
                {type === 'patient' ? 'Dr. ' : ''}{contactPerson?.name}
              </h2>
              <p className="text-cyan-100 text-sm mt-1">{contactPerson?.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`} />
            <span className="font-bold text-slate-900 text-lg capitalize">{appointment.status}</span>
            {appointment.payment && (
              <>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <span className={`font-semibold ${
                  appointment.payment.status === 'succeeded' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {appointment.payment.status === 'succeeded' ? 'Payment Completed' : 'Payment Pending'}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {appointment.description && (
            <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-cyan-50/30 rounded-2xl border-2 border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Appointment Details
              </h3>
              <p className="text-slate-700 leading-relaxed">{appointment.description}</p>
            </div>
          )}

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase">Date</span>
              </div>
              <p className="text-slate-900 font-bold text-lg">{formatDate(appointment.date)}</p>
            </div>

            <div className="p-5 bg-purple-50 rounded-2xl border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-bold text-purple-700 uppercase">Time</span>
              </div>
              <p className="text-slate-900 font-bold text-lg">
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          {appointment.payment && (
            <div className="mb-6 p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase">Payment Amount</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatAmount(appointment.payment.amount, appointment.payment.currency)}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full ${
                  appointment.payment.status === 'succeeded' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-amber-500 text-white'
                }`}>
                  <span className="font-bold text-sm">
                    {appointment.payment.status === 'succeeded' ? '✓ Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Medical Reports */}
          {appointment.report_urls && appointment.report_urls.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                Medical Reports ({appointment.report_urls.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {appointment.report_urls.map((url, index) => {
                  const isPdf = url.toLowerCase().includes('.pdf');
                  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)/i);
                  
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 rounded-xl transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isPdf ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <FileText className={`w-5 h-5 ${isPdf ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">
                          {isPdf ? 'PDF Report' : 'Image Report'} {index + 1}
                        </p>
                        <p className="text-xs text-slate-500">Click to view</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Appointment ID */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold mb-1">Appointment ID</p>
            <p className="text-sm font-mono text-slate-700">{appointment.appointment_id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Add these styles to your global CSS or tailwind config
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
`;