import { Calendar, Clock, AlertCircle, CreditCard } from "lucide-react";
import { PendingPaymentRequest } from "./patient-types";
import { useRouter } from "next/navigation";

interface PendingPaymentCardProps {
  payment: PendingPaymentRequest;
}

export default function PendingPaymentCard({ payment }: PendingPaymentCardProps) {
  const router = useRouter();

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

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const handlePayNow = () => {
    router.push(`/patient/appointments/payments/${payment.appointment_id}`);
  };

  const timeRemaining = getTimeRemaining(payment.expires_at);
  const isExpiringSoon = new Date(payment.expires_at).getTime() - new Date().getTime() < 3600000; // 1 hour

  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200 shadow-lg shadow-amber-100/50 overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
      
      {/* Urgent badge */}
      {isExpiringSoon && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" />
          URGENT
        </div>
      )}

      {/* Header */}
      <div className="relative mb-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-1">PAYMENT REQUIRED</p>
            <h3 className="font-bold text-slate-900 text-xl">
              Dr. {payment.doctor_name}
            </h3>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="relative grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-2.5 p-3 bg-white/80 backdrop-blur rounded-xl border border-amber-100">
          <Calendar className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-xs text-amber-700 font-medium">Date</p>
            <p className="text-sm font-bold text-slate-900">{formatDate(payment.date)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 p-3 bg-white/80 backdrop-blur rounded-xl border border-amber-100">
          <Clock className="w-4 h-4 text-orange-600" />
          <div>
            <p className="text-xs text-orange-700 font-medium">Time</p>
            <p className="text-sm font-bold text-slate-900">
              {formatTime(payment.start_time)} - {formatTime(payment.end_time)}
            </p>
          </div>
        </div>
      </div>

      {/* Expiry Warning */}
      <div className={`relative mb-5 p-4 rounded-2xl border-2 ${
        isExpiringSoon 
          ? 'bg-red-50 border-red-300' 
          : 'bg-white/80 backdrop-blur border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={`w-5 h-5 ${isExpiringSoon ? 'text-red-600' : 'text-amber-600'}`} />
          <div>
            <p className={`text-xs font-semibold ${isExpiringSoon ? 'text-red-700' : 'text-amber-700'}`}>
              Payment expires in
            </p>
            <p className={`text-lg font-bold ${isExpiringSoon ? 'text-red-900' : 'text-slate-900'}`}>
              {timeRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handlePayNow}
        className="relative w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-xl shadow-amber-300/50 hover:shadow-2xl hover:shadow-amber-400/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pay Now
        </span>
      </button>
    </div>
  );
}