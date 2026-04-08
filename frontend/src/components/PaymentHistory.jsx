import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const FILTERS = ['All', 'Successful', 'Pending', 'Failed'];

export default function PaymentHistory({ onRebook }) {
    const { user } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const token = user?.token || localStorage.getItem('accessToken');
            const { data } = await axios.get('http://localhost:5000/api/payments/my-payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(data);
        } catch (err) {
            console.error('Failed to load payment history', err);
            // If the endpoint doesn't exist yet, try bookings with payment data
            try {
                const token = user?.token || localStorage.getItem('accessToken');
                const { data: bookings } = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Map bookings that have a paymentId to a payment-like structure
                const withPayment = bookings
                    .filter(b => b.paymentId || b.status === 'Confirmed' || b.status === 'Cancelled')
                    .map(b => ({
                        _id: b._id,
                        orderId: b.paymentId || b._id,
                        amount: 118, // approximate with GST
                        status: b.status === 'Confirmed' ? 'Captured' : b.status === 'Cancelled' ? 'Failed' : 'Created',
                        createdAt: b.createdAt,
                        gym: b.slotId?.gymId?.name || 'Gym Session',
                        slot: b.slotId ? `${b.slotId.startTime} – ${b.slotId.endTime}` : '',
                        date: b.slotId?.date,
                        bookingId: b._id,
                        bookingStatus: b.status
                    }));
                setPayments(withPayment);
            } catch (e) {
                console.error('Fallback also failed', e);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p => {
        if (filter === 'All') return true;
        if (filter === 'Successful') return p.status === 'Captured' || p.status === 'Confirmed';
        if (filter === 'Pending') return p.status === 'Created' || p.status === 'Pending';
        if (filter === 'Failed') return p.status === 'Failed' || p.status === 'Cancelled';
        return true;
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Captured':
            case 'Confirmed':
                return {
                    label: 'Captured',
                    icon: <CheckCircle2 size={13} />,
                    cls: 'text-green-400 bg-green-500/10 border-green-500/20'
                };
            case 'Created':
            case 'Pending':
                return {
                    label: 'Pending',
                    icon: <Clock size={13} />,
                    cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                };
            case 'Failed':
            case 'Cancelled':
                return {
                    label: 'Failed',
                    icon: <XCircle size={13} />,
                    cls: 'text-red-400 bg-red-500/10 border-red-500/20'
                };
            default:
                return {
                    label: status,
                    icon: <AlertCircle size={13} />,
                    cls: 'text-gray-400 bg-gray-800 border-gray-700'
                };
        }
    };

    const formatDate = (d) => {
        if (!d) return '–';
        try {
            return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return '–';
        }
    };

    const formatAmount = (amt) => {
        if (amt === null || amt === undefined) return '₹0.00';
        try {
            return `₹${parseFloat(amt).toFixed(2)}`;
        } catch (e) {
            return '₹0.00';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-8 w-48 bg-gray-800 rounded-xl" />
                <div className="flex gap-2">
                    {FILTERS.map(f => <div key={f} className="h-8 w-24 bg-gray-800 rounded-full" />)}
                </div>
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-800 rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <CreditCard size={20} className="text-green-500" /> Payment History
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">All your transactions on Fit Ur Day</p>
                </div>
                <button
                    onClick={fetchPayments}
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filter === f
                            ? 'bg-green-500/15 border-green-500/40 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.12)]'
                            : 'bg-gray-800/60 border-gray-700/50 text-gray-500 hover:text-gray-300 hover:border-gray-600'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Payment Cards */}
            {filteredPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-5 py-16 border border-dashed border-gray-700 rounded-2xl bg-gray-800/20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                        <CreditCard size={28} className="text-gray-600" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">No payments found</p>
                        <p className="text-gray-500 text-sm mt-1">
                            {filter === 'All'
                                ? "You haven't made any payments yet."
                                : `No ${filter.toLowerCase()} payments.`}
                        </p>
                    </div>
                    <button
                        onClick={() => { }}
                        className="px-6 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold hover:bg-green-500/20 transition-all"
                    >
                        Discover Gyms →
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPayments.map((p, idx) => {
                        const statusCfg = getStatusConfig(p.status || p.bookingStatus);
                        const isFailed = p.status === 'Failed' || p.status === 'Cancelled';

                        return (
                            <div
                                key={p._id}
                                className="group bg-gray-800/40 border border-gray-700/40 hover:border-gray-600/60 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-all duration-200 hover:bg-gray-800/60"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Left: Info */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${statusCfg.cls}`}>
                                        {statusCfg.icon}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-sm">{p.gym || 'Gym Session'}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusCfg.cls}`}>
                                                {statusCfg.icon} {statusCfg.label}
                                            </span>
                                        </div>
                                        {p.slot && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={11} className="text-gray-600" /> {p.slot}
                                                {p.date && <> · <span className="text-gray-600">{formatDate(p.date)}</span></>}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-gray-600 font-mono mt-0.5 truncate max-w-[200px]">
                                            {typeof p.orderId === 'string' ? p.orderId.slice(0, 24) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Amount + Date + Action */}
                                <div className="flex items-center gap-4 ml-auto">
                                    <div className="text-right">
                                        <p className="text-green-400 font-black text-base">{formatAmount(p.amount)}</p>
                                        <p className="text-gray-600 text-[10px]">{formatDate(p.createdAt)}</p>
                                    </div>
                                    {isFailed && onRebook && (
                                        <button
                                            onClick={() => onRebook && onRebook()}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
                                        >
                                            <RefreshCw size={12} /> Re-book
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredPayments.length > 0 && (
                <p className="text-center text-xs text-gray-600">
                    Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
