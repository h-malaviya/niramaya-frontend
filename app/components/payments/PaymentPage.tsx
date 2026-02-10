'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CreditCard,
    Calendar,
    Clock,
    User,
    IndianRupee,
    AlertCircle,
    X,
    Shield,
    CheckCircle,
    Loader2
} from 'lucide-react';
import api, { getErrorMessage } from '@/app/lib/apiClient';
import { PaymentInfo } from './payment-types';

interface PaymentPageProps {
    appointmentId: string;
}

export default function PaymentPage({ appointmentId }: PaymentPageProps) {
    const router = useRouter();
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPaymentInfo();
    }, [appointmentId]);

    const fetchPaymentInfo = async () => {
        try {
            
            setLoading(true);
            setError(null);
            const response = await api.get(`/appointments/${appointmentId}/payment-info`);
            setPaymentInfo(response.data);
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPayment = async () => {
        if (!confirm('Are you sure you want to cancel this payment? This action cannot be undone.')) {
            return;
        }

        try {
            setCancelling(true);
            await api.post(`/appointments/${appointmentId}/cancel-payment`);
            router.push('/patient/appointments?cancelled=true');
        } catch (err: any) {
            setError(getErrorMessage(err));
            setCancelling(false);
        }
    };

    const handlePayNow = async () => {
        try {
            setProcessing(true);
            const response = await api.get(`/appointments/${appointmentId}/payment-link`);
            const paymentUrl = response.data.checkout_url;

            if (paymentUrl) {
                // Redirect to payment gateway
                window.location.href = paymentUrl;
            } else {
                throw new Error('Payment URL not received');
            }
        } catch (err: any) {
            setError(getErrorMessage(err));
            setProcessing(false);
        }
    };

    const getTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    // Auto-update countdown
    useEffect(() => {
        if (!paymentInfo) return;

        const interval = setInterval(() => {
            const remaining = getTimeRemaining(paymentInfo.expires_at);
            if (remaining === 'Expired') {
                clearInterval(interval);
                setError('Payment session has expired. Please request a new payment link.');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [paymentInfo]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-semibold">Loading payment information...</p>
                </div>
            </div>
        );
    }

    if (error && !paymentInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border-2 border-red-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">Error Loading Payment</h2>
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

    if (!paymentInfo) return null;

    const isExpiringSoon = new Date(paymentInfo.expires_at).getTime() - new Date().getTime() < 300000; // 5 minutes

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/patient/appointments')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-4 transition-colors"
                    >
                        <X className="w-5 h-5" />
                        Back to Appointments
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">Complete Payment</h1>
                    <p className="text-slate-500 mt-1">Secure your appointment with a quick payment</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold text-red-900">Error</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Main Payment Card */}
                <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden mb-6">
                    {/* Countdown Timer Bar */}
                    <div className={`p-4 ${isExpiringSoon ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600'} text-white`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span className="font-semibold">Payment Expires In:</span>
                            </div>
                            <div className="text-xl font-bold">
                                {getTimeRemaining(paymentInfo.expires_at)}
                            </div>
                        </div>
                        {isExpiringSoon && (
                            <p className="text-sm text-white/90 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                Hurry! Payment session expiring soon
                            </p>
                        )}
                    </div>

                    {/* Payment Amount */}
                    <div className="p-8 bg-gradient-to-br from-cyan-50 to-blue-50 border-b-2 border-slate-100">
                        <div className="text-center">
                            <p className="text-sm font-semibold text-cyan-700 mb-2">AMOUNT TO PAY</p>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <IndianRupee className="w-10 h-10 text-slate-900" />
                                <span className="text-6xl font-bold text-slate-900">
                                    {(paymentInfo.amount / 100).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border-2 border-cyan-200">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-semibold text-slate-700">Secure Payment</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="p-8">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-cyan-600" />
                            Payment Details
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <span className="text-slate-600">Appointment ID</span>
                                <span className="font-mono text-sm text-slate-900">{paymentInfo.appointment_id.slice(0, 8)}...</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <span className="text-slate-600">Currency</span>
                                <span className="font-bold text-slate-900 uppercase">{paymentInfo.currency}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <span className="text-slate-600">Payment Method</span>
                                <span className="font-semibold text-slate-900">Card / UPI / Wallet</span>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-emerald-900 mb-1">Secure Payment Gateway</p>
                                    <p className="text-sm text-emerald-700">
                                        Your payment information is encrypted and secure. We never store your card details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={handleCancelPayment}
                        disabled={cancelling || processing}
                        className="py-4 px-6 bg-white border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {cancelling ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            <>
                                <X className="w-5 h-5" />
                                Cancel Payment
                            </>
                        )}
                    </button>

                    <button
                        onClick={handlePayNow}
                        disabled={processing || cancelling}
                        className="py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-cyan-200 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Pay Now
                            </>
                        )}
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        By proceeding, you agree to our{' '}
                        <a href="/terms" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}