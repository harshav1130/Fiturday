import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Search, Star, Award, ChevronRight, ChevronLeft, X, Calendar, Loader2 } from 'lucide-react';
import ReviewsWidget from './ReviewsWidget';
import PaymentCheckoutModal from './PaymentCheckoutModal';
import { AuthContext } from '../context/AuthContext';

export default function TrainerMarketplace() {
    const { user } = useContext(AuthContext);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExpertise, setSelectedExpertise] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [myBookings, setMyBookings] = useState([]);

    // Booking modal state
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingTrainer, setBookingTrainer] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const categories = ['All', 'Weight Loss', 'Muscle Gain', 'Rehab', 'HIIT', 'Yoga'];

    const fetchTrainers = async () => {
        try {
            let url = 'http://localhost:5000/api/trainers';
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedExpertise && selectedExpertise !== 'All') params.append('expertise', selectedExpertise);
            if (params.toString()) url += `?${params.toString()}`;

            const token = localStorage.getItem('accessToken');
            const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setTrainers(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch trainers', err);
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const { data } = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const now = new Date();
            setMyBookings(data.filter(b => 
                b.status === 'Confirmed' && 
                b.type === 'Trainer' && 
                (!b.endDate || new Date(b.endDate) > now)
            ));
        } catch (err) {
            console.error('Failed to fetch my bookings', err);
        }
    };

    useEffect(() => {
        fetchTrainers();
        fetchMyBookings();
    }, [searchQuery, selectedExpertise]);

    const handleBookNow = (trainer) => {
        setBookingTrainer(trainer);
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async () => {
        if (!bookingTrainer) return;
        setIsBooking(true);
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const monthlyPrice = bookingTrainer.monthlyPrice;

            const { data: booking } = await axios.post('http://localhost:5000/api/bookings', {
                trainerId: bookingTrainer._id,
                type: 'Trainer',
                planType: 'Monthly'
            }, config);

            const { data: order } = await axios.post('http://localhost:5000/api/payments/orders', {
                amount: monthlyPrice,
                bookingId: booking._id
            }, config);

            setPaymentData({ booking, order });
            setShowBookingModal(false);
        } catch (error) {
            console.error('Trainer booking failed', error);
            alert(error.response?.data?.message || 'Failed to initiate booking');
        }
        setIsBooking(false);
    };

    // Trainer Detail View
    if (selectedTrainer) {
        const monthlyPrice = selectedTrainer.monthlyPrice;
        return (
            <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
                    <button onClick={() => setSelectedTrainer(null)} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white">{selectedTrainer.userId?.name || 'Trainer'}</h2>
                        <span className="text-xs text-green-500 uppercase tracking-widest font-bold">Trainer Profile</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-900 border-2 border-green-500">
                                    {selectedTrainer.userId?.avatar
                                        ? <img src={`http://localhost:5000${selectedTrainer.userId.avatar}`} alt="Trainer" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-green-500 font-black text-2xl uppercase">{selectedTrainer.userId?.name?.charAt(0) || 'T'}</div>
                                    }
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">{selectedTrainer.userId?.name || 'Unknown Trainer'}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm mt-1">
                                        <Star size={14} fill="currentColor" /> {selectedTrainer.rating || 0}
                                        <span className="text-gray-500 font-normal text-xs ml-1">({selectedTrainer.reviewsCount || 0} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{selectedTrainer.bio || 'No bio provided.'}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedTrainer.expertise?.map((tag, idx) => (
                                <span key={idx} className="bg-gray-800 border border-green-500/30 text-gray-300 text-xs px-3 py-1.5 rounded-full font-bold">{tag}</span>
                            ))}
                        </div>

                        {selectedTrainer.certifications?.length > 0 && (
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                                <Award size={16} className="text-green-500" />
                                {selectedTrainer.certifications.join(', ')}
                            </div>
                        )}

                        <ReviewsWidget targetId={selectedTrainer._id} targetModel="Trainer" />
                    </div>

                    <div>
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
                            <div className="text-3xl font-black text-white">₹{monthlyPrice}<span className="text-sm text-gray-500 font-normal">/mo</span></div>
                            <p className="text-xs text-gray-500">Unlimited sessions for 30 days</p>
                            <hr className="border-gray-800" />
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                                <Calendar size={20} className="text-green-500 mx-auto mb-1" />
                                <p className="text-xs font-bold text-green-400">Monthly Subscription</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Focus on long-term goals</p>
                            </div>
                            <button
                                onClick={() => {
                                    const isBooked = myBookings.some(b => b.trainerId?._id === selectedTrainer._id || b.trainerId === selectedTrainer._id);
                                    if (!isBooked) handleBookNow(selectedTrainer);
                                }}
                                disabled={myBookings.some(b => b.trainerId?._id === selectedTrainer._id || b.trainerId === selectedTrainer._id)}
                                className={`w-full py-3.5 rounded-xl font-black transition-all shadow-lg text-sm ${
                                    myBookings.some(b => b.trainerId?._id === selectedTrainer._id || b.trainerId === selectedTrainer._id)
                                    ? 'bg-gray-800 text-green-500 border border-green-500/50 cursor-default'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-black hover:from-green-400 hover:to-emerald-400 hover:scale-[1.02]'
                                }`}
                            >
                                {myBookings.some(b => b.trainerId?._id === selectedTrainer._id || b.trainerId === selectedTrainer._id) 
                                 ? '✅ Active Membership' 
                                 : '🏅 Book Monthly Plan'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking Confirmation Modal */}
                {showBookingModal && bookingTrainer && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-black text-white">Confirm Booking</h3>
                                <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4 mb-4">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Trainer</p>
                                <p className="text-white font-bold">{bookingTrainer.userId?.name}</p>
                                <hr className="border-gray-700 my-3" />
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Plan</p>
                                <p className="text-white font-bold">Monthly Subscription</p>
                                <hr className="border-gray-700 my-3" />
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Amount</p>
                                <p className="text-green-400 text-2xl font-black">₹{bookingTrainer.monthlyPrice}</p>
                            </div>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={isBooking}
                                className="w-full py-3 bg-green-500 text-black font-black rounded-xl hover:bg-green-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isBooking ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : '✅ Confirm & Pay'}
                            </button>
                        </div>
                    </div>
                )}

                <PaymentCheckoutModal
                    isOpen={!!paymentData}
                    onClose={() => setPaymentData(null)}
                    onSuccess={() => { setPaymentData(null); setSelectedTrainer(null); alert('Trainer booked successfully!'); }}
                    gym={{ name: selectedTrainer.userId?.name }}
                    booking={paymentData?.booking}
                    order={paymentData?.order}
                />
            </div>
        );
    }

    // Trainer List View
    if (loading) {
        return <div className="text-green-500 font-bold p-8 text-center animate-pulse">Loading Trainers...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Search & Filters */}
            <div className="bg-gray-900 p-4 border border-gray-800 rounded-2xl shadow-lg space-y-4">
                <h2 className="text-xl font-black text-white">Trainer Marketplace</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search trainers by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedExpertise(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition border ${selectedExpertise === cat || (cat === 'All' && !selectedExpertise)
                                    ? 'bg-green-500 text-black border-green-500'
                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trainer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.length === 0 && (
                    <div className="col-span-full text-center p-12 text-gray-500 italic border border-dashed border-gray-700 rounded-xl">
                        No trainers match your criteria.
                    </div>
                )}
                {trainers.map((trainer, idx) => (
                    <div
                        key={trainer._id}
                        className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 flex flex-col hover:-translate-y-2 hover:border-green-500 hover:shadow-[0_10px_30px_rgba(34,197,94,0.15)] transition-all duration-300 relative overflow-hidden animate-slide-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/0 via-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-900 border-2 border-green-500 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-shadow shrink-0">
                                {trainer.userId?.avatar
                                    ? <img src={`http://localhost:5000${trainer.userId.avatar}`} alt="Trainer" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-green-500 font-bold text-xl uppercase">{trainer.userId?.name?.charAt(0) || 'T'}</div>
                                }
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white group-hover:text-green-400 transition-colors">{trainer.userId?.name || 'Unknown Trainer'}</h3>
                                <div className="flex items-center gap-2 text-sm text-yellow-500 font-bold">
                                    <Star size={14} fill="currentColor" /> {trainer.rating || 0}
                                    <span className="text-gray-500 font-normal text-xs">({trainer.reviewsCount || 0} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-4 line-clamp-3 flex-1 relative z-10">{trainer.bio || 'No bio provided.'}</p>

                        <div className="flex flex-wrap gap-1 mb-4 relative z-10">
                            {trainer.expertise?.map((tag, idx) => (
                                <span key={idx} className="bg-gray-900 text-gray-300 text-[10px] px-2 py-1 rounded border border-gray-700 font-semibold uppercase tracking-wider group-hover:border-green-500/30 transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {trainer.certifications?.length > 0 && (
                            <div className="text-xs text-gray-500 flex items-center gap-2 mb-4 border-t border-gray-700/50 pt-3 relative z-10">
                                <Award size={14} className="text-green-500" />
                                {trainer.certifications[0]}{trainer.certifications.length > 1 && ` +${trainer.certifications.length - 1} more`}
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-gray-700/50 pt-4 mt-auto relative z-10">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Monthly Plan</span>
                                <span className="text-lg font-black text-white group-hover:text-green-400 transition-colors">
                                    ₹{trainer.monthlyPrice}<span className="text-xs text-gray-500 font-normal">/mo</span>
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedTrainer(trainer)}
                                    className="bg-gray-700 text-white border border-gray-600 font-bold px-3 py-2 rounded-lg text-xs hover:bg-gray-600 transition"
                                >
                                    View
                                </button>
                                {myBookings.some(b => b.trainerId?._id === trainer._id || b.trainerId === trainer._id) ? (
                                    <div className="bg-green-500/10 text-green-500 border border-green-500/30 font-black px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        Joined
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleBookNow(trainer)}
                                        className="bg-green-500/20 text-green-500 border border-green-500/50 group-hover:bg-green-500 group-hover:text-black font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1 transition-all duration-300"
                                    >
                                        Book <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Confirmation Modal (list view) */}
            {showBookingModal && bookingTrainer && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-black text-white">Confirm Booking</h3>
                            <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Trainer</p>
                                <p className="text-white font-bold">{bookingTrainer.userId?.name}</p>
                            </div>
                            <hr className="border-gray-700" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Plan</p>
                                <p className="text-white font-bold flex items-center gap-2"><Calendar size={14} className="text-green-500" /> Monthly Subscription</p>
                            </div>
                            <hr className="border-gray-700" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Total</p>
                                <p className="text-green-400 text-2xl font-black">₹{bookingTrainer.monthlyPrice}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleConfirmBooking}
                            disabled={isBooking}
                            className="w-full py-3 bg-green-500 text-black font-black rounded-xl hover:bg-green-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isBooking ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : '✅ Confirm & Pay'}
                        </button>
                    </div>
                </div>
            )}

            <PaymentCheckoutModal
                isOpen={!!paymentData}
                onClose={() => setPaymentData(null)}
                onSuccess={() => { setPaymentData(null); fetchMyBookings(); }}
                gym={{ name: bookingTrainer?.userId?.name }}
                booking={paymentData?.booking}
                order={paymentData?.order}
            />
        </div>
    );
}
