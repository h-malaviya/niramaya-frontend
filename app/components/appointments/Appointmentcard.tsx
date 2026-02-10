import { Calendar, Clock, FileText, User, IndianRupee, AlertCircle } from "lucide-react";
import { AppointmentHistory } from "./patient-types";

interface AppointmentCardProps {
  appointment: AppointmentHistory;
  type: 'patient' | 'doctor';
  onViewDetails?: (appointment: AppointmentHistory) => void;
}

export default function AppointmentCard({ appointment, type, onViewDetails }: AppointmentCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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
    return `${(amount / 100).toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'succeeded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'expired':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const contactPerson = type === 'patient' ? appointment.doctor : appointment.patient;

  return (
    <div
      className="group bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100/50 transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails?.(appointment)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <img src={contactPerson?.profile_image_url} alt={`${contactPerson?.name} profile image`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">
              {contactPerson?.name || 'Unknown'}
            </h3>
            <p className="text-slate-500 text-sm mt-0.5">{contactPerson?.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(appointment.status)}`}>
            {appointment.status.toUpperCase()}
          </span>
          {appointment.payment && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(appointment.payment.status)}`}>
              {appointment.payment.status === 'succeeded' ? '✓ Paid' : 'Unpaid'}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-5">
        {appointment.description ? (
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">
              {appointment.description}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-transparent rounded-2xl min-h-[64px]" />
        )}
      </div>

      {/* Date & Time Info */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl">
          <Calendar className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Date</p>
            <p className="text-sm font-bold text-slate-900">{formatDate(appointment.date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 bg-purple-50 rounded-xl">
          <Clock className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-xs text-purple-600 font-medium">Time</p>
            <p className="text-sm font-bold text-slate-900">
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment & Reports */}
      {/* Payment & Reports (layout stable) */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 min-h-[40px]">
        {appointment.payment ? (
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-900 text-lg">
              {formatAmount(appointment.payment.amount, appointment.payment.currency)}
            </span>
          </div>
        ) : (
          <div className="w-[90px]" />
        )}

        {appointment.report_urls && appointment.report_urls.length > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 rounded-full">
            <FileText className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold text-cyan-700">
              {appointment.report_urls.length} Report{appointment.report_urls.length > 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <div className="w-[90px]" />
        )}
      </div>

    </div>
  );
}