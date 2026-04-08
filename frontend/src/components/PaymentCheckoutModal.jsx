import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    X,
    CheckCircle2,
    XCircle,
    Loader2,
    CreditCard,
    MapPin,
    Clock,
    Calendar,
    ShieldCheck,
    AlertTriangle,
    Download,
    RefreshCw
} from 'lucide-react';

// Steps: 0 = Review, 1 = Processing, 2 = Success, 3 = Failed
const STEPS = ['Review', 'Processing', 'Done'];

export default function PaymentCheckoutModal({ isOpen, onClose, onSuccess, gym, slot, booking, order }) {
    const [step, setStep] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const baseAmount = order?.amount ? order.amount / 100 : 0;
    const total = baseAmount;

    const handleConfirmPay = async (simulateFailure = false) => {
        setStep(1); // Processing
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await new Promise((res) => setTimeout(res, 1500)); // simulate processing delay

            if (simulateFailure) {
                throw new Error('Simulated bank decline or network timeout.');
            }

            const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
                razorpay_order_id: order.id,
                razorpay_payment_id: 'pay_mock_' + Date.now(),
                razorpay_signature: 'mock_signature'
            }, config);

            if (verifyRes.data.success || verifyRes.status === 200) {
                setStep(2); // Success
                await new Promise((res) => setTimeout(res, 200));
                // We no longer call onSuccess here to allow the user to see the success screen.
                // onSuccess will be called when they click "Done".
            } else {
                throw new Error('Verification returned non-success status');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Try again.');
            setStep(3); // Failed
        }
    };

    const handleRetry = () => {
        setStep(0);
        setError(null);
    };

    const handleDownloadReceipt = async () => {
        try {
            const { toPng } = await import('html-to-image');
            const element = document.getElementById('receipt-content');
            if (!element) return;
            
            const dataUrl = await toPng(element, {
                backgroundColor: '#090e18',
                pixelRatio: 2,
            });
            
            const link = document.createElement('a');
            link.download = `fiturday-receipt-${order?.id || Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate receipt image', err);
            alert('Could not save image. Please try again.');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div
                className="relative w-full max-w-lg rounded-3xl border border-gray-700/60 shadow-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(17,24,39,0.97) 0%, rgba(9,14,24,0.97) 100%)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 0 80px rgba(34,197,94,0.08), 0 32px 64px rgba(0,0,0,0.7)'
                }}
            >
                {/* Glow accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-gray-800/70">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight">Checkout</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Secured by Fit Ur Day · 256-bit SSL</p>
                    </div>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500
                                        ${i < step || step === 2 ? 'bg-green-500 text-black' :
                                            i === step ? 'bg-green-500/20 border border-green-500 text-green-400' :
                                                'bg-gray-800 text-gray-600 border border-gray-700'}`}>
                                        {i < step || step === 2 ? <CheckCircle2 size={12} /> : i + 1}
                                    </div>
                                    <span className={`text-[9px] font-semibold ${i === step ? 'text-green-400' : 'text-gray-600'}`}>{s}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`w-8 h-px mb-4 transition-all duration-500 ${i < step ? 'bg-green-500' : 'bg-gray-700'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-7 py-6 min-h-[320px] flex flex-col justify-center">

                    {/* STEP 0: Order Review */}
                    {step === 0 && (
                        <div className="animate-fade-in flex flex-col gap-5">
                            {/* Venue Info */}
                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                    <MapPin size={20} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">{gym?.name || 'Session Booking'}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">{booking?.planType === 'Monthly' ? 'Monthly Pass' : booking?.planType === 'Yearly' ? 'Yearly Pass' : 'Single Session'}</p>
                                </div>
                            </div>

                            {/* Slot Details - Only show if it's a session */}
                            {booking?.planType === 'Session' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-800/40 rounded-xl p-3 flex items-center gap-3">
                                        <Clock size={16} className="text-yellow-500 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Time Slot</p>
                                            <p className="text-white text-sm font-bold mt-0.5">{slot?.startTime} – {slot?.endTime}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-800/40 rounded-xl p-3 flex items-center gap-3">
                                        <Calendar size={16} className="text-blue-400 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Date</p>
                                            <p className="text-white text-sm font-bold mt-0.5">{formatDate(slot?.date)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="bg-gray-800/30 border border-gray-700/40 rounded-2xl p-4 flex justify-between items-center">
                                <span className="text-gray-300 font-bold text-lg">Total Amount</span>
                                <span className="text-green-400 text-2xl font-black">₹{total.toFixed(2)}</span>
                            </div>

                            {booking?.planType === 'Session' && (
                                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                    <ShieldCheck size={13} className="text-green-500 shrink-0" />
                                    Your slot is temporarily locked. Complete payment within 10 minutes.
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 1: Processing */}
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center gap-5 py-8 animate-fade-in">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-green-500/20 flex items-center justify-center">
                                    <Loader2 size={36} className="text-green-500 animate-spin" />
                                </div>
                                <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 40px rgba(34,197,94,0.2)', animation: 'pulse 2s infinite' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-lg">Securing your slot…</p>
                                <p className="text-gray-500 text-sm mt-1">Processing payment & confirming booking</p>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-green-500"
                                        style={{ animation: `bounce 1s ${i * 0.2}s infinite` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Success */}
                    {step === 2 && (
                        <div className="flex flex-col items-center py-6 animate-fade-in w-full">
                            <div id="receipt-content" className="flex flex-col items-center w-full p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(9,14,24,1) 100%)' }}>
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center relative z-10">
                                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-scale-in shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                            <CheckCircle2 size={36} className="text-black" />
                                        </div>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-green-500/20 animate-ping opacity-20" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-green-500/10 animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
                                </div>

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">Payment Successful!</h3>
                                    <p className="text-gray-400 text-sm max-w-[280px] mx-auto">
                                        Welcome aboard! Your <span className="text-green-500 font-bold">{booking?.planType}</span> membership has been activated successfully.
                                    </p>
                                </div>

                                <div className="w-full bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="p-5 border-b border-gray-700/50 bg-gray-800/20">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Booking Details</span>
                                            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">Active</span>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-green-500">
                                                {booking?.type === 'Gym' ? <MapPin size={20} /> : <Clock size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm leading-tight">{gym?.name || 'Pro Trainer Session'}</p>
                                                <p className="text-gray-500 text-xs mt-0.5">{booking?.planType} Plan • ₹{total}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-900/40 space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 flex items-center gap-1.5"><ShieldCheck size={14} /> Transaction ID</span>
                                            <span className="text-gray-400 font-mono italic">{order?.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-t border-gray-800 pt-3">
                                            <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={14} /> Confirmation Date</span>
                                            <span className="text-white font-bold">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleDownloadReceipt} className="mt-6 flex items-center gap-2 text-xs text-green-500 font-bold hover:text-green-400 transition-colors group">
                                <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Save Receipt as Image
                            </button>
                        </div>
                    )}

                    {/* STEP 3: Failed */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center gap-5 py-8 animate-fade-in">
                            <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                                <XCircle size={48} className="text-red-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-xl">Payment Failed</p>
                                <p className="text-red-400 text-sm mt-2">{error || 'Something went wrong. Try again.'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
                                <AlertTriangle size={14} className="shrink-0" />
                                Your slot lock will expire in 10 minutes. Retry now to keep it.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-7 pb-7 flex flex-col gap-3">
                    {step === 0 && (
                        <>
                            <button
                                onClick={() => handleConfirmPay(false)}
                                className="w-full py-3.5 rounded-xl font-black text-black text-base bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-[1.01]"
                            >
                                <CreditCard size={18} /> Confirm & Pay ₹{total.toFixed(2)}
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleConfirmPay(true)}
                                    title="Test Error Recovery"
                                    className="flex-1 py-2.5 rounded-xl font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-sm transition-colors flex items-center justify-center gap-1"
                                >
                                    <AlertTriangle size={14}/> Test Fail
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
                                >
                                    Cancel Booking
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <button
                            onClick={() => {
                                if (onSuccess) onSuccess();
                                onClose();
                            }}
                            className="w-full py-3.5 rounded-xl font-black text-black text-base bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                        >
                            <CheckCircle2 size={18} /> Done
                        </button>
                    )}

                    {step === 3 && (
                        <div className="flex gap-3">
                            <button
                                onClick={handleRetry}
                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={15} /> Retry Payment
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
