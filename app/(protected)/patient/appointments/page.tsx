'use client';

import { useState, useEffect } from "react";
import { Calendar, Clock, History, CreditCard, Search, Filter } from "lucide-react";
import PendingPaymentCard from "@/app/components/appointments/Pendingpaymentcard";
import UpcomingAppointmentCard from "@/app/components/appointments/Upcomingappointmentcard";
import AppointmentCard from "@/app/components/appointments/Appointmentcard";
import AppointmentDetailModal from "@/app/components/appointments/Appointmentdetailmodal";
import EmptyState from "@/app/components/doctor/Emptystate";
import { 
  PendingPaymentRequest, 
  UpcomingAppointment, 
  AppointmentHistory,
  AppointmentTab 
} from "../../../components/appointments/patient-types";
import { getAppointmentHistory, getPendingPayments, getUpcomingAppointments } from "@/app/lib/patientAppointmentsApi";

export default function PatientAppointments() {
  const [activeTab, setActiveTab] = useState<AppointmentTab>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentHistory | UpcomingAppointment | null>(null);
  
  // Mock data - replace with actual API calls
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentRequest[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulate API calls
  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
  try {
    setLoading(true)

    if (activeTab === 'pending') {
      const data = await getPendingPayments()
      setPendingPayments(data)
    } 
    else if (activeTab === 'upcoming') {
      const data = await getUpcomingAppointments()
      setUpcomingAppointments(data)
    } 
    else {
      const data = await getAppointmentHistory()
      setAppointmentHistory(data)
    }

  } catch (err) {
    console.error("Failed to fetch appointments:", err)
    alert("Failed to load appointments. Please try again.")
  } finally {
    setLoading(false)
  }
}

  const tabs = [
    { 
      id: 'pending' as AppointmentTab, 
      label: 'Pending Payments', 
      icon: CreditCard,
      count: pendingPayments.length,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      activeBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    },
    { 
      id: 'upcoming' as AppointmentTab, 
      label: 'Upcoming', 
      icon: Calendar,
      count: upcomingAppointments.length,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      activeBg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
    },
    { 
      id: 'history' as AppointmentTab, 
      label: 'History', 
      icon: History,
      count: appointmentHistory.length,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      activeBg: 'bg-gradient-to-r from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            My Appointments
          </h1>
          <p className="text-slate-500 text-lg">Manage your healthcare appointments and payments</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-3xl p-2 shadow-lg border-2 border-slate-100">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative p-4 rounded-2xl font-bold transition-all duration-300 ${
                    isActive
                      ? `${tab.activeBg} text-white shadow-xl transform scale-[1.02]`
                      : `${tab.bg} ${tab.color} hover:scale-[1.01]`
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive 
                          ? 'bg-white/30 text-white' 
                          : 'bg-white border-2 ' + tab.border
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border-2 border-slate-100 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-20 bg-slate-100 rounded-2xl mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-slate-100 rounded-xl" />
                    <div className="h-16 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Pending Payments */}
              {activeTab === 'pending' && (
                <>
                  {pendingPayments.length === 0 ? (
                    <EmptyState hasFilters={false} onReset={() => {}}  />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingPayments.map((payment) => (
                        <PendingPaymentCard 
                          key={payment.appointment_id} 
                          payment={payment} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Upcoming Appointments */}
              {activeTab === 'upcoming' && (
                <>
                  {upcomingAppointments.length === 0 ? (
                    <EmptyState  hasFilters={false} onReset={() => {}} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingAppointments.map((appointment) => (
                        <UpcomingAppointmentCard
                          key={appointment.appointment_id}
                          appointment={appointment}
                          onViewDetails={setSelectedAppointment}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* History */}
              {activeTab === 'history' && (
                <>
                  {appointmentHistory.length === 0 ? (
                    <EmptyState  hasFilters={false} onReset={() => {}}/>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {appointmentHistory.map((appointment) => (
                        <AppointmentCard
                          key={appointment.appointment_id}
                          appointment={appointment}
                          type="patient"
                          onViewDetails={setSelectedAppointment}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          type="patient"
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}