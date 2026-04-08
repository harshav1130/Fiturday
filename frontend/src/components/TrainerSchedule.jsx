import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';
import ChatComponent from './ChatComponent';

export default function TrainerSchedule({ initialChat, onChatOpened }) {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trainerStats, setTrainerStats] = useState(null);
    const [activeChat, setActiveChat] = useState(null);

    useEffect(() => {
        if (initialChat && initialChat.bookingId) {
            setActiveChat({
                bookingId: initialChat.bookingId,
                receiverId: initialChat.sender?._id,
                receiverName: initialChat.sender?.name || 'Client'
            });
            if (onChatOpened) onChatOpened();
        }
    }, [initialChat]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchSlots = async () => {
        try {
            // Fetch bookings to match with active subscriptions for chat
            const bookingsRes = await axios.get('/api/bookings/trainer');
            setBookings(bookingsRes.data);

            // Get KPI stats
            const statsRes = await axios.get('/api/analytics/trainer');
            setTrainerStats(statsRes.data);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch trainer schedule or stats', error);
            if (error.response?.status === 404) {
                setTrainerStats('NOT_FOUND');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    if (trainerStats === 'NOT_FOUND') {
        return (
            <div className="text-center p-12 bg-gray-800/20 border border-dashed border-gray-700 rounded-2xl">
                <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Trainer Profile Required</h2>
                <p className="text-gray-400 max-w-sm mx-auto mb-6">You need to complete your professional profile before you can manage your training schedule.</p>
                <button 
                    onClick={() => window.location.href = '/dashboard/settings'} // Or wherever profile creation is
                    className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition"
                >
                    Complete Profile
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">My Schedule</h2>
                    <p className="text-gray-400 text-sm">Manage your monthly subscription clients.</p>
                </div>

                {trainerStats && (
                    <div className="flex gap-4">
                        <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg flex items-center gap-3">
                            <TrendingUp size={18} className="text-blue-500" />
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">Total Bookings</p>
                                <p className="text-sm font-black text-white">{trainerStats.totalBookings}</p>
                            </div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg flex items-center gap-3">
                            <DollarSign size={18} className="text-green-500" />
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">Revenue Generated</p>
                                <p className="text-sm font-black text-white">₹{trainerStats.trainerRevenue?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Active Monthly Memberships Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500" /> Active Monthly Memberships
                </h3>
                {bookings.filter(b => b.planType === 'Monthly' && b.status === 'Confirmed').length === 0 ? (
                    <div className="text-gray-500 border border-dashed border-gray-700 p-8 text-center rounded-xl bg-gray-800/20">
                        No active monthly clients yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings
                            .filter(b => b.planType === 'Monthly' && b.status === 'Confirmed')
                            .map((booking) => {
                                const isExpired = booking.endDate && new Date(booking.endDate) < new Date();
                                return (
                                    <div key={booking._id} className="bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50 flex flex-col gap-4 hover:border-green-500/30 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold border border-green-500/20">
                                                    {booking.userId?.avatar ? <img src={`${booking.userId.avatar}`} className="w-full h-full rounded-full object-cover" /> : (booking.userId?.name?.charAt(0).toUpperCase() || 'U')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white">{booking.userId?.name || 'Client'}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Monthly Plan</p>
                                                </div>
                                            </div>
                                            {isExpired ? (
                                                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-black">EXPIRED</span>
                                            ) : (
                                                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-black">ACTIVE</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-t border-gray-700/50 pt-3">
                                            <span>Starts: {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</span>
                                            <span>Ends: {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</span>
                                        </div>

                                        {!isExpired ? (
                                            <button
                                                onClick={() => setActiveChat({
                                                    bookingId: booking._id,
                                                    receiverId: booking.userId?._id,
                                                    receiverName: booking.userId?.name || 'Client'
                                                })}
                                                className="w-full py-2 bg-green-500 text-black rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare size={14} /> Open Chat
                                            </button>
                                        ) : (
                                            <p className="text-[9px] text-center text-gray-600 font-bold uppercase py-2">Subscription period has ended. Chat disabled.</p>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

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
