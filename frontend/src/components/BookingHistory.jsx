import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, XCircle, CheckCircle2, AlertCircle, Mail, MessageSquare, Trash2, Dumbbell, Activity, Award, Star, Utensils } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ChatComponent from './ChatComponent';

export default function BookingHistory({ initialChat, onChatOpened }) {
    const { user } = React.useContext(AuthContext); 
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null); 
    const [assignedWorkout, setAssignedWorkout] = useState(null);
    const [assignedDiet, setAssignedDiet] = useState(null);

    useEffect(() => {
        if (initialChat && initialChat.bookingId) {
            setActiveChat({
                bookingId: initialChat.bookingId,
                receiverId: initialChat.sender?._id,
                receiverName: initialChat.sender?.name || 'Trainer'
            });
            if (onChatOpened) onChatOpened();
        }
    }, [initialChat]);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/bookings/my-bookings', config);
            setBookings(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
            setLoading(false);
        }
    };

    const fetchAssignedPlans = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const { data: wPlan } = await axios.get('http://localhost:5000/api/tracking/workout', config);
            setAssignedWorkout(wPlan);

            const { data: dPlan } = await axios.get('http://localhost:5000/api/tracking/diet', config);
            setAssignedDiet(dPlan);
        } catch (error) {
            console.error('Failed to fetch assigned plans', error);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchAssignedPlans();
        // Clear active chat if user changes (e.g. via tab sync)
        setActiveChat(null);
    }, [user?._id]);

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`, {}, config);
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || 'Error cancelling booking');
        }
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, config);
            fetchBookings();
        } catch (error) {
            console.error('Deletion failed', error);
            alert(error.response?.data?.message || 'Failed to delete booking');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Confirmed': return 'text-green-500 bg-green-500/10 border-green-500/30';
            case 'Pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'Cancelled': return 'text-red-500 bg-red-500/10 border-red-500/30';
            default: return 'text-gray-400 bg-gray-800 border-gray-700';
        }
    };

    if (loading) return <div className="text-green-500 text-center animate-pulse py-8 font-bold">Loading Bookings...</div>;

    return (
        <div className="flex flex-col gap-6 p-2">
            <h2 className="text-xl font-black text-white">My Bookings</h2>

            {bookings.length === 0 ? (
                <div className="text-gray-500 p-12 text-center border border-dashed border-gray-700 rounded-xl bg-gray-800/20">
                    No bookings found. Start exploring gyms to book a slot.
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((b) => (
                        <div key={b._id} className="bg-gray-800/50 border border-gray-700/50 p-5 rounded-2xl flex flex-col md:flex-row gap-6 md:items-center justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${getStatusStyle(b.status)}`}>
                                        {b.status}
                                    </span>
                                    <span className="text-xs text-gray-500">Booked on {new Date(b.createdAt).toLocaleDateString()}</span>
                                </div>

                                {b.type === 'Gym' && (
                                    <>
                                        <h3 className="text-lg font-black text-white">{b.slotId?.gymId?.name || b.gymId?.name || 'Unknown Gym'}</h3>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-400 font-medium">
                                            {b.planType === 'Session' ? (
                                                <>
                                                    <span className="flex items-center gap-1"><Calendar size={14} className="text-green-500" /> {new Date(b.slotId?.date).toDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock size={14} className="text-yellow-500" /> {b.slotId?.startTime} - {b.slotId?.endTime}</span>
                                                </>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <AlertCircle size={14} className="text-green-500" /> 
                                                    {b.planType} Membership Pass ({b.gymId?.address || 'Partner Branch'})
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}

                                {b.type === 'Trainer' && b.trainerId && (
                                    <>
                                        <h3 className="text-lg font-black text-white">Trainer: {b.trainerId.userId?.name || 'Unknown'}</h3>
                                        {b.trainerId.userId?.email && (
                                            <p className="text-sm text-green-500 font-medium flex items-center gap-1">
                                                <Mail size={14} /> {b.trainerId.userId.email}
                                            </p>
                                        )}
                                        {b.planType === 'Monthly' || b.planType === 'Yearly' ? (
                                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-400 font-medium">
                                                <span className="flex items-center gap-1 text-green-500 font-bold">
                                                    <AlertCircle size={14} /> {b.planType} Subscription
                                                </span>
                                                {b.endDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-gray-500" /> 
                                                        Active until {new Date(b.endDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            b.slotId && (
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1"><Calendar size={14} className="text-green-500" /> {new Date(b.slotId.date).toDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock size={14} className="text-yellow-500" /> {b.slotId.startTime} - {b.slotId.endTime}</span>
                                                </div>
                                            )
                                        )}

                                        {/* Assigned Plans Mini-View */}
                                        {(assignedWorkout || assignedDiet) && b.status === 'Confirmed' && (
                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-700/50">
                                                {assignedWorkout && (
                                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Dumbbell size={14} className="text-emerald-500" />
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Routine</span>
                                                            </div>
                                                            <span className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black">{assignedWorkout.goal}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {assignedWorkout.exercises.map((ex, i) => (
                                                                <p key={i} className="text-[10px] text-gray-400 truncate flex justify-between">
                                                                    <span>{ex.name}</span>
                                                                    <span className="text-emerald-500/70">{ex.sets}x{ex.reps}</span>
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {assignedDiet && (
                                                    <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-xl">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <Activity size={14} className="text-green-500" />
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Diet Plan</span>
                                                            </div>
                                                            <span className="text-[8px] bg-green-500 text-black px-1.5 py-0.5 rounded font-black">{assignedDiet.goal}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {assignedDiet.meals.map((meal, i) => (
                                                                <p key={i} className="text-[10px] text-gray-400 truncate flex justify-between">
                                                                    <span className="font-bold text-green-500/70">{meal.type}:</span>
                                                                    <span className="truncate ml-2">{Array.isArray(meal.items) ? meal.items.join(', ') : meal.items}</span>
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {b.status !== 'Cancelled' && (
                                    <button
                                        onClick={() => handleCancel(b._id)}
                                        className="text-xs font-bold px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 bg-transparent rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                                
                                {b.status === 'Confirmed' && b.type === 'Trainer' && b.trainerId?.userId && (() => {
                                    const isExpired = b.endDate && new Date(b.endDate) < new Date();
                                    if (isExpired) return null;
                                    
                                    return (
                                        <button
                                            onClick={() => {
                                                const rId = b.trainerId?.userId?._id || b.slotId?.trainerId?.userId?._id;
                                                const rName = b.trainerId?.userId?.name || b.slotId?.trainerId?.userId?.name || 'Trainer';
                                                setActiveChat({
                                                    bookingId: b._id,
                                                    receiverId: rId,
                                                    receiverName: rName
                                                });
                                            }}
                                            className="text-xs font-bold px-4 py-2 bg-green-500 text-black hover:bg-green-600 rounded-lg transition flex items-center gap-2"
                                        >
                                            <MessageSquare size={14} /> Chat
                                        </button>
                                    );
                                })()}

                                {(() => {
                                    const isExpired = (b.endDate && new Date(b.endDate) < new Date()) || 
                                                     (b.slotId && new Date(b.slotId.date) < new Date());
                                    const isCancelled = b.status === 'Cancelled';
                                    
                                    if (isCancelled || isExpired) {
                                        return (
                                            <button
                                                onClick={() => handleDelete(b._id)}
                                                title="Delete from history"
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}
                                {b.status === 'Cancelled' && b.paymentId && (
                                    <div className={`text-xs flex items-center gap-1 max-w-[120px] text-right font-bold ${b.paymentId?.status === 'Refunded' ? 'text-blue-500' : 'text-gray-500'}`}>
                                        <CheckCircle2 size={14} /> 
                                        {b.paymentId?.status === 'Refunded' ? 'Refunded' : 'Cancelled (No Refund)'}
                                    </div>
                                )}
                                {b.status === 'Pending' && (
                                    <div className="text-xs text-yellow-500 flex items-center gap-1 max-w-[120px] text-right font-bold">
                                        <AlertCircle size={14} /> Pending Payment
                                        {b.expiresAt && <div className="block mt-1 text-[10px] text-gray-500 font-medium">Expires {new Date(b.expiresAt).toLocaleTimeString()}</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeChat && (
                <ChatComponent 
                    isOpen={!!activeChat}
                    onClose={() => setActiveChat(null)}
                    bookingId={activeChat.bookingId}
                    receiverId={activeChat.receiverId}
                    receiverName={activeChat.receiverName}
                />
            )}
        </div>
    );
}
