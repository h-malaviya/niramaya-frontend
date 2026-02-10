import { Calendar, Clock, FileText, MapPin, Video, Phone } from "lucide-react";
import { UpcomingAppointment } from "./patient-types";

interface UpcomingAppointmentCardProps {
    appointment: UpcomingAppointment;
    onViewDetails?: (appointment: UpcomingAppointment) => void;
}

export default function UpcomingAppointmentCard({ appointment, onViewDetails }: UpcomingAppointmentCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
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

    const getDaysUntil = (dateStr: string) => {
        const appointmentDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);

        const diffTime = appointmentDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 7) return `In ${diffDays} days`;
        return null;
    };

    const formatAmount = (amount: number) => {
        return `₹${(amount / 100).toLocaleString('en-IN')}`;
    };

    const daysUntil = getDaysUntil(appointment.date);
    
    return (
        <div
            className="group bg-white rounded-3xl p-6 border-2 border-cyan-100 hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-200/50 transition-all duration-300 cursor-pointer overflow-hidden relative"
            onClick={() => onViewDetails?.(appointment)}
        >
            {/* Background gradient decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity" />

            {/* Days until badge */}
            {daysUntil && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-bold shadow-lg">
                    {daysUntil}
                </div>
            )}

            {/* Header */}
            <div className="relative flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl group-hover:scale-110 transition-transform">
                    <img src={appointment.doctor?.profile_image_url} alt={`${appointment.doctor?.name} profile image`} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-xl leading-tight mb-1">
                        Dr. {appointment.doctor.name}
                    </h3>
                    <p className="text-slate-500 text-sm">{appointment.doctor.email}</p>
                </div>
            </div>

            {/* Description */}
            {appointment.description && (
                <div className="relative mb-5 p-4 bg-gradient-to-br from-slate-50 to-cyan-50/50 rounded-2xl border border-slate-100">
                    <p className="text-slate-700 text-sm leading-relaxed">
                        {appointment.description}
                    </p>
                </div>
            )}

            {/* Date & Time - Prominent */}
            <div className="relative mb-5 p-5 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-cyan-600" />
                        <div>
                            <p className="text-xs text-cyan-700 font-semibold mb-0.5">APPOINTMENT DATE</p>
                            <p className="text-lg font-bold text-slate-900">{formatDate(appointment.date)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <div className="text-right">
                            <p className="text-xs text-blue-700 font-semibold mb-0.5">TIME SLOT</p>
                            <p className="text-lg font-bold text-slate-900">
                                {formatTime(appointment.start_time)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            

            {/* Footer */}
            <div className="relative flex items-center justify-between pt-4 border-t-2 border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-emerald-700">Confirmed</span>
                </div>

                {appointment.report_urls && appointment.report_urls.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-purple-700">
                            {appointment.report_urls.length} Report{appointment.report_urls.length > 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}