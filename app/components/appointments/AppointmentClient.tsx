"use client";

import React, { useState, useEffect } from "react";
import { Search, Calendar, CheckCircle, XCircle, FileText, ChevronRight, MapPin, Clock, X, Download, Eye, CalendarDays, Mail } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, isToday, isTomorrow } from "date-fns";
import { cn } from "@/app/lib/utils";
import { PatientRequest } from "@/app/components/appointments/types";
import SkeletonLoader from "@/app/components/appointments/SkeletonLoader";
import { acceptAppointment, getUpcomingAppointments, rejectAppointment } from "@/app/lib/doctorAppointmentsApi";

const defaultFilters = {
    status: 'approved' as 'pending' | 'approved',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    search: ""
};

export default function AppointmentClient({ initialFilters }: { initialFilters: any }) {
    const [filters, setFilters] = useState(initialFilters || defaultFilters);
    const [searchValue, setSearchValue] = useState(initialFilters?.search || "");
    const [requests, setRequests] = useState<PatientRequest[]>([]);
    const [allPendingCount, setAllPendingCount] = useState(0);
    const [allApprovedCount, setAllApprovedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<PatientRequest | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', request: PatientRequest } | null>(null);
    const [successMessage, setSuccessMessage] = useState<{ type: 'approved' | 'rejected', name: string } | null>(null);
    const [activeQuickFilter, setActiveQuickFilter] = useState<'today' | 'tomorrow' | 'week' | null>(null);
    const todayISO = new Date().toISOString().split('T')[0]
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                const data = await getUpcomingAppointments(filters)

                const mapped = data.map((a: any) => ({
                    id: a.appointment_id,
                    date: a.date,
                    start_time: a.start_time,
                    end_time: a.end_time,
                    status: filters.status,
                    first_name: a.patient.first_name,
                    last_name: a.patient.last_name,
                    email: a.patient.email,
                    city: a.patient.city,
                    state: a.patient.state,
                    profile_url: a.patient["profile_image_url"],
                    description: a.description,
                    report_urls: a.report_urls
                }))

                setRequests(mapped)
            } catch (err) {
                console.error(err)
                alert("Failed to load appointments")
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [filters])


    useEffect(() => {
        const t = setTimeout(() => {
            setFilters({ ...filters, search: searchValue });
        }, 500); // debounce 500ms

        return () => clearTimeout(t);
    }, [searchValue]);

    // Check if current date filters match quick filters
    useEffect(() => {
        const today = new Date();
        const startDate = new Date(filters.startDate);
        const endDate = new Date(Math.min(new Date(filters.endDate).getTime(), startDate.getTime()));

        if (isToday(startDate) && isToday(endDate)) {
            setActiveQuickFilter('today');
        } else if (isTomorrow(startDate) && isTomorrow(endDate)) {
            setActiveQuickFilter('tomorrow');
        } else if (
            format(startDate, 'yyyy-MM-dd') === format(startOfWeek(today), 'yyyy-MM-dd') &&
            format(endDate, 'yyyy-MM-dd') === format(endOfWeek(today), 'yyyy-MM-dd')
        ) {
            setActiveQuickFilter('week');
        } else {
            setActiveQuickFilter(null);
        }
    }, [filters.startDate, filters.endDate]);

    const handleQuickDate = (type: 'today' | 'tomorrow' | 'week') => {
        const today = new Date();
        let start = today;
        let end = today;

        if (type === 'tomorrow') {
            start = addDays(today, 1);
            end = addDays(today, 1);
        } else if (type === 'week') {
            start = startOfWeek(today);
            end = endOfWeek(today);
        }

        setFilters({
            ...filters,
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd')
        });
        setActiveQuickFilter(type);
    };

    const handleActionClick = (type: 'approve' | 'reject', request: PatientRequest, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setConfirmAction({ type, request });
    };

    const processAction = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            setIsProcessing(true);
            if (newStatus === "approved") {
                await acceptAppointment(id)
            } else {
                await rejectAppointment(id)
            }

            setRequests(prev => prev.filter(r => r.id !== id))
            setConfirmAction(null)
            setSelectedRequest(null)

            setSuccessMessage({
                type: newStatus,
                name: `${selectedRequest?.first_name} ${selectedRequest?.last_name}`
            })

            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err: any) {
            console.error(err)
            alert("Failed to update appointment. Please try again.")
        } finally {
            setIsProcessing(false);
        }
    }


    const handleStartDateChange = (newStartDate: string) => {
        // If new start date is greater than current end date, update end date to match
        if (newStartDate > filters.endDate) {
            setFilters({ ...filters, startDate: newStartDate, endDate: newStartDate });
        } else {
            setFilters({ ...filters, startDate: newStartDate });
        }
    };

    return (
        <div className="space-y-6">

            {/* Header with Search & Date Range */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                {/* Search Bar */}
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search by patient name, city, or notes..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Quick Filters & Date Range */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Quick Date Filters */}
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl">
                        {[
                            { key: 'today', label: 'Today' },
                            { key: 'tomorrow', label: 'Tomorrow' },
                            { key: 'week', label: 'This Week' }
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => handleQuickDate(item.key as any)}
                                className={cn(
                                    "flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                    activeQuickFilter === item.key
                                        ? "bg-emerald-600 text-white shadow-md"
                                        : "text-slate-600 hover:bg-white hover:shadow-sm"
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Range */}
                    <div className="flex items-center gap-3 lg:ml-auto">
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                            <CalendarDays className="w-4 h-4 text-slate-500" />
                            <input
                                type="date"
                                min={todayISO}
                                value={filters.startDate}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="bg-transparent text-sm font-medium text-slate-700 outline-none w-[130px]"
                            />
                        </div>
                        <span className="text-slate-400 font-medium">to</span>
                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                            <CalendarDays className="w-4 h-4 text-slate-500" />
                            <input
                                type="date"
                                min={filters.startDate}
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="bg-transparent text-sm font-medium text-slate-700 outline-none w-[130px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs for Pending/Approved */}
            <div className="flex gap-6 border-b m-2 border-slate-200">
                {[
                    { key: 'pending', label: 'Pending Requests', color: 'amber', count: allPendingCount },
                    { key: 'approved', label: 'Approved Requests', color: 'emerald', count: allApprovedCount }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilters({ ...filters, status: tab.key as 'pending' | 'approved' })}
                        className={cn(
                            "relative pb-3 px-2 text-sm md:text-base font-semibold transition-all",
                            filters.status === tab.key
                                ? "text-slate-900"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {tab.label}

                        {filters.status === tab.key && (
                            <div className={cn(
                                "absolute bottom-0 left-0 right-0 h-0.5 rounded-full",
                                tab.key === 'pending' ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                        )}
                    </button>
                ))}
            </div>

            {/* Loading State or Grid View */}
            {isLoading ? (
                <SkeletonLoader />
            ) : (
                <>
                    {/* Appointment Cards Grid */}
                    {requests.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-600 mb-2">No {filters.status} appointments</h3>
                            <p className="text-slate-500">There are no {filters.status} appointments for the selected date range</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    onClick={() => setSelectedRequest(request)}
                                    className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                >
                                    {/* Top Section: Avatar, Name & Date Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3">
                                            <img
                                                src={request.profile_url}
                                                alt={request.first_name}
                                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-emerald-200 transition-all"
                                            />
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight">
                                                    {request.first_name} {request.last_name}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {request.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                                                {format(new Date(request.date), 'MMM dd')}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {request.start_time}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}

                                    <div className="mb-4">
                                        {request.description ? (
                                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                                {request.description}
                                            </p>
                                        ) : (
                                            <div className="min-h-[44px]" />
                                        )}
                                    </div>
                                    {/* Bottom Section: Location & Reports */}
                                    {/* Bottom Section (layout stable) */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 min-h-[32px]">
                                        {request.city ? (
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">{request.city}</span>
                                            </div>
                                        ) : (
                                            <div className="w-[90px]" />
                                        )}

                                        {request.report_urls?.length > 0 ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">
                                                    {request.report_urls.length} report{request.report_urls.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-[90px]" />
                                        )}
                                    </div>
                                    {/* Action Buttons (Only for pending) */}
                                    {filters.status === 'pending' && (
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={(e) => handleActionClick('reject', request, e)}
                                                className="flex-1 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all active:scale-95"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={(e) => handleActionClick('approve', request, e)}
                                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all active:scale-95"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Detail Drawer */}
            {selectedRequest && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 animate-fade-in"
                        onClick={() => setSelectedRequest(null)}
                    />

                    {/* Drawer */}
                    <div className="fixed inset-y-0 right-0 w-full lg:w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-emerald-50 to-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Patient Details</h2>
                                <p className="text-sm text-slate-600 mt-1">Appointment information</p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 hover:bg-slate-200 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Profile Section */}
                            <section className="flex items-center gap-4">
                                <img
                                    src={selectedRequest.profile_url}
                                    alt={selectedRequest.first_name}
                                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-100"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {selectedRequest.first_name} {selectedRequest.last_name}
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" />
                                        {selectedRequest.email}
                                    </p>
                                </div>
                            </section>

                            {/* Appointment Details */}
                            <section className="bg-emerald-50 rounded-2xl p-5 space-y-3">
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-3">Appointment Info</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Date</p>
                                        <p className="font-semibold text-slate-900">
                                            {format(new Date(selectedRequest.date), 'MMMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Time</p>
                                        <p className="font-semibold text-slate-900">
                                            {selectedRequest.start_time} - {selectedRequest.end_time}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Location</p>
                                        <p className="font-semibold text-slate-900">{selectedRequest.city}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Description */}
                            <section>
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-3">Notes</h4>
                                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">
                                    {selectedRequest.description}
                                </p>
                            </section>

                            {/* Medical Reports */}
                            <section>
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide mb-3">Medical Reports</h4>
                                {selectedRequest.report_urls.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedRequest.report_urls.map((url: string, i: number) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                                            >
                                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-all">
                                                    <FileText className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">Report_{i + 1}.pdf</p>
                                                    <p className="text-xs text-slate-500">Click to view</p>
                                                </div>
                                                <Eye className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-all" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl">
                                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">No reports uploaded</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Footer Actions */}
                        {selectedRequest.status === 'pending' && (
                            <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleActionClick('reject', selectedRequest)}
                                        className="flex-1 py-4 font-semibold text-red-600 bg-white border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleActionClick('approve', selectedRequest)}
                                        className="flex-1 py-4 font-semibold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                                    >
                                        Accept Request
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center animate-scale-in">
                        <div className={cn(
                            "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6",
                            confirmAction.type === 'approve'
                                ? "bg-emerald-100"
                                : "bg-red-100"
                        )}>
                            {confirmAction.type === 'approve' ? (
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            ) : (
                                <XCircle className="w-10 h-10 text-red-600" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Action</h2>
                        <p className="text-slate-600 mb-8">
                            Are you sure you want to{' '}
                            <span className={cn(
                                "font-bold",
                                confirmAction.type === 'approve' ? "text-emerald-600" : "text-red-600"
                            )}>
                                {confirmAction.type}
                            </span>
                            {' '}the appointment for{' '}
                            <span className="font-semibold text-slate-900">
                                {confirmAction.request.first_name} {confirmAction.request.last_name}
                            </span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                disabled={isProcessing}
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 py-3.5 font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={() =>
                                    processAction(
                                        confirmAction.request.id,
                                        confirmAction.type === 'approve' ? 'approved' : 'rejected'
                                    )
                                }
                                className={cn(
                                    "flex-1 py-3.5 font-semibold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
                                    confirmAction.type === 'approve'
                                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                                        : "bg-red-600 hover:bg-red-700 shadow-red-200",
                                    isProcessing && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Yes, {confirmAction.type}</>
                                )}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="fixed bottom-6 right-6 z-[70] animate-slide-up">
                    <div className={cn(
                        "flex items-center gap-4 p-6 rounded-2xl shadow-2xl border-2",
                        successMessage.type === 'approved'
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-red-50 border-red-200"
                    )}>
                        <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            successMessage.type === 'approved' ? "bg-emerald-600" : "bg-red-600"
                        )}>
                            {successMessage.type === 'approved' ? (
                                <CheckCircle className="w-7 h-7 text-white" />
                            ) : (
                                <XCircle className="w-7 h-7 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-1">
                                Appointment {successMessage.type === 'approved' ? 'Accepted' : 'Rejected'}!
                            </h3>
                            <p className="text-sm text-slate-600">
                                Request for {successMessage.name} has been {successMessage.type}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}