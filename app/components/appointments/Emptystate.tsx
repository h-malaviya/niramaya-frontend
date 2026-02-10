import { Calendar, Clock, FileText, Sparkles } from "lucide-react";

export interface EmptyStateProps {
  type: 'pending' | 'upcoming' | 'history';
}

export default function EmptyState({ type }: EmptyStateProps) {
  const config = {
    pending: {
      icon: Clock,
      title: "No Pending Payments",
      description: "You're all caught up! No payment requests at the moment.",
      gradient: "from-amber-400 to-orange-500",
      bg: "from-amber-50 to-orange-50",
    },
    upcoming: {
      icon: Calendar,
      title: "No Upcoming Appointments",
      description: "You don't have any scheduled appointments. Book one to get started!",
      gradient: "from-cyan-400 to-blue-500",
      bg: "from-cyan-50 to-blue-50",
    },
    history: {
      icon: FileText,
      title: "No Appointment History",
      description: "Your past appointments will appear here once you've had your first consultation.",
      gradient: "from-purple-400 to-pink-500",
      bg: "from-purple-50 to-pink-50",
    },
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <div className={`flex items-center justify-center min-h-[400px] p-8`}>
      <div className="text-center max-w-md">
        {/* Animated Icon */}
        <div className={`relative mx-auto mb-6 w-32 h-32 bg-gradient-to-br ${current.bg} rounded-3xl flex items-center justify-center`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl" />
          <div className={`w-24 h-24 bg-gradient-to-br ${current.gradient} rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          
          {/* Floating sparkles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-pulse" />
          <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-blue-400 animate-pulse delay-150" />
        </div>

        {/* Text */}
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          {current.title}
        </h3>
        <p className="text-slate-500 leading-relaxed">
          {current.description}
        </p>
      </div>
    </div>
  );
}