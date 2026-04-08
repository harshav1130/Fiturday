import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthContext } from '../context/AuthContext';
import PaymentCheckoutModal from './PaymentCheckoutModal';

export default function GymBookingCalendar({ gym, onBack }) {
    const { user } = useContext(AuthContext);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(null);
    const [modalData, setModalData] = useState(null); // stores { slot, booking, order } to pass to modal

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const token = user?.token || localStorage.getItem('accessToken');
            const endpoint = gym.isTrainer 
                ? `/api/slots/trainer/${gym._id}?date=${selectedDate}`
                : `/api/slots/gym/${gym._id}?date=${selectedDate}`;
                
            const { data } = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSlots(data);
        } catch (error) {
            console.error('Failed to fetch slots', error);
        }
        setLoading(false);
    };

    const handleBookSlot = async (slot) => {
        setBookingInProgress(slot._id);
        const token = user?.token || localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            // 1. Create Pending Booking (Locks Slot)
            const { data: booking } = await axios.post('/api/bookings', {
                slotId: slot._id,
                type: gym.isTrainer ? 'Trainer' : 'Gym',
                planType: 'Session'
            }, config);

            const amount = 100; // Fixed per-session cost for demo

            // 2. Create Order (mock or real)
            const { data: order } = await axios.post('/api/payments/orders', {
                amount: amount,
                bookingId: booking._id
            }, config);

            // 3. Open the CheckOut modal
            setModalData({ slot, booking, order });

        } catch (error) {
            alert(error.response?.data?.message || 'Error booking slot');
            setBookingInProgress(null);
        }
    };

    const handleModalSuccess = () => {
        setModalData(null);
        setBookingInProgress(null);
        fetchSlots(); // Refresh slots to reflect new booking
    };

    const handleModalClose = () => {
        setModalData(null);
        setBookingInProgress(null);
        fetchSlots();
    };

    return (
        <>
            <div className="flex flex-col gap-6 h-full p-2 animate-fade-in">
                <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                    <button onClick={onBack} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 hover:-translate-x-1 transition-transform">
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white">{gym.name}</h2>
                        <span className="text-xs text-green-500 uppercase tracking-widest font-bold">Select a Session</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-400 flex items-center gap-2">
                        <CalendarIcon size={16} /> Choose Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-gray-800 border-none text-white rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 cursor-pointer outline-none w-full max-w-xs transition shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    />
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-bold text-white mb-4">Available Slots</h3>
                    {loading ? (
                        <div className="text-green-500 animate-pulse font-bold">Loading slots...</div>
                    ) : slots.length === 0 ? (
                        <div className="text-gray-500 p-8 text-center border border-dashed border-gray-700 rounded-xl bg-gray-800/20">
                            No slots scheduled for this date.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {slots.map((slot, index) => {
                                const available = slot.capacity - (slot.bookedCount + (slot.lockedCount || 0));
                                const isFull = available <= 0;
                                const isLocking = bookingInProgress === slot._id;

                                const style = { animationDelay: `${index * 50}ms` };

                                return (
                                    <div
                                        key={slot._id}
                                        style={style}
                                        className={`p-4 rounded-xl border transition-all duration-300 animate-slide-up bg-gray-800/80 backdrop-blur-sm shadow-lg
                                            ${isFull ? 'bg-gray-900 border-gray-800 opacity-60'
                                                : 'border-gray-700 hover:border-green-500 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(34,197,94,0.15)]'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-white font-black flex items-center gap-2">
                                                <Clock size={16} className={isFull ? 'text-gray-500' : 'text-green-500'} />
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                            {isFull ? (
                                                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">FULL</span>
                                            ) : (
                                                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">{available} Left</span>
                                            )}
                                        </div>
                                        <div className="text-xs font-semibold text-gray-400 mb-4 flex justify-between">
                                            <span>Total: {slot.capacity}</span>
                                            {(slot.lockedCount || 0) > 0 && <span className="text-yellow-500 flex items-center gap-1"><Lock size={12} /> {slot.lockedCount} Locked</span>}
                                        </div>

                                        <button
                                            disabled={isFull || isLocking}
                                            onClick={() => handleBookSlot(slot)}
                                            className={`w-full py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
                                                ${isFull ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                    : isLocking ? 'bg-yellow-500 text-black animate-pulse'
                                                        : 'bg-green-500 text-black hover:bg-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-[1.02]'}`}
                                        >
                                            {isFull ? 'Unavailable' : isLocking ? <><Lock size={16} /> Locking...</> : <><CheckCircle2 size={16} /> Book Slot</>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentCheckoutModal 
                isOpen={!!modalData}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                gym={gym}
                booking={modalData?.booking}
                order={modalData?.order}
            />
        </>
    );
}
