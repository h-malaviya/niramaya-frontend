'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  XCircle, 
  RefreshCw, 
  Home,
  AlertTriangle,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import api, { getErrorMessage } from '@/app/lib/apiClient';

interface PaymentFailureProps {
  appointmentId: string;
}

export default function PaymentFailure({ appointmentId }: PaymentFailureProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    confirmFailure();
  }, [appointmentId]);

  const confirmFailure = async () => {
    try {
      setConfirming(true);
      // Still call confirm-payment to update the state as failed
      await api.post(`/appointments/${appointmentId}/confirm-payment`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  const handleRetryPayment = async () => {
    setRetrying(true);
    // Redirect back to payment page
    router.push(`/patient/appointments/payment/${appointmentId}`);
  };

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold text-lg">Processing payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Failure Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6">
              <XCircle className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Payment Failed</h1>
          <p className="text-lg text-slate-600">We couldn't process your payment</p>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-200 overflow-hidden mb-6">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-red-500 to-orange-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-red-100 text-sm font-semibold mb-1">TRANSACTION FAILED</p>
                <p className="text-xl font-bold">Payment could not be completed</p>
              </div>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="p-8">
            <h3 className="font-bold text-slate-900 mb-4">Common reasons for payment failure:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Insufficient funds</p>
                  <p className="text-sm text-slate-600">Please ensure your account has sufficient balance</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Card declined</p>
                  <p className="text-sm text-slate-600">Your bank may have declined the transaction</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Incorrect details</p>
                  <p className="text-sm text-slate-600">Card number, CVV, or expiry date may be incorrect</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Network issues</p>
                  <p className="text-sm text-slate-600">Connection problems during transaction</p>
                </div>
              </li>
            </ul>

            {/* What to Do Next */}
            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3">What to do next:</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Check your bank account balance and card details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Contact your bank if the issue persists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Try again with a different payment method</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Contact our support team if you need assistance</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-slate-50 border-t-2 border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/patient/appointments')}
              className="py-3 px-6 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Appointments
            </button>

            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {retrying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </>
              )}
            </button>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="tel:+911234567890"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700">CALL US</p>
                <p className="font-bold text-slate-900">+91 123 456 7890</p>
              </div>
            </a>

            <a 
              href="mailto:support@example.com"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700">EMAIL US</p>
                <p className="font-bold text-slate-900">support@example.com</p>
              </div>
            </a>
          </div>
        </div>

        {/* Additional Note */}
        {error && (
          <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> {error}
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Your appointment slot is still reserved. Please complete the payment soon.
          </p>
        </div>
      </div>
    </div>
  );
}