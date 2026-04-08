import React, { useState } from 'react';
import axios from 'axios';
import { ChevronLeft, Star, MapPin, Clock, ImageIcon, Activity, X } from 'lucide-react';
import PaymentCheckoutModal from './PaymentCheckoutModal';
import ReviewsWidget from './ReviewsWidget';
import ImageModal from './ImageModal';

export default function GymDetail({ gym, onBack, isActive }) {
    const [bookingData, setBookingData] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    const [showPackages, setShowPackages] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const handleSubscriptionBooking = async (planType, price) => {
        setIsBooking(true);
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data: booking } = await axios.post('http://localhost:5000/api/bookings', {
                gymId: gym._id,
                type: 'Gym',
                planType
            }, config);

            const { data: order } = await axios.post('http://localhost:5000/api/payments/orders', {
                amount: price,
                bookingId: booking._id
            }, config);

            setBookingData({ booking, order });
            setShowPackages(false);
        } catch (error) {
            console.error('Subscription booking failed', error);
            alert(error.response?.data?.message || 'Failed to initiate subscription');
        }
        setIsBooking(false);
    };

    return (
        <div className="h-full relative overflow-hidden">
            <div className="flex flex-col gap-6 h-full p-2 animate-fade-in overflow-y-auto custom-scrollbar pb-10">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-800 pb-4 sticky top-0 bg-[#0B0F19] z-10 pt-2">
                    <button onClick={onBack} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                        <ChevronLeft size={20} className="text-white" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white">{gym.name}</h2>
                        <span className="text-xs text-green-500 uppercase tracking-widest font-bold">Gym Profile</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Photos + Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[400px]">
                            {gym.photos && gym.photos.length > 0 ? (
                                <>
                                    {/* Main Photo */}
                                    <div className="md:col-span-2 h-full">
                                        <img 
                                            src={`http://localhost:5000${gym.photos[0]}`} 
                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                            alt="Gym Main" 
                                            onClick={() => { setLightboxIndex(0); setShowLightbox(true); }}
                                        />
                                    </div>
                                    
                                    {/* Side Photos Grid */}
                                    <div className="md:col-span-2 grid grid-cols-2 gap-2 h-full">
                                        {[1, 2, 3, 4].map((idx) => (
                                            <div key={idx} className="h-full relative overflow-hidden bg-gray-800">
                                                {gym.photos[idx] ? (
                                                    <img 
                                                        src={`http://localhost:5000${gym.photos[idx]}`} 
                                                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                                                        alt={`Gym ${idx + 1}`} 
                                                        onClick={() => { setLightboxIndex(idx); setShowLightbox(true); }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                        <ImageIcon size={24} opacity={0.3} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-4 bg-gray-800 flex flex-col items-center justify-center text-gray-500">
                                    <ImageIcon size={48} className="mb-2 opacity-50" />
                                    <span>No Photos Available</span>
                                </div>
                            )}
                        </div>

                        <ImageModal 
                            isOpen={showLightbox}
                            onClose={() => setShowLightbox(false)}
                            images={gym.photos || []}
                            currentIndex={lightboxIndex}
                            setCurrentIndex={setLightboxIndex}
                        />

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">About this Facility</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{gym.description}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Activity size={18} className="text-green-500" /> Amenities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {gym.amenities.map((item, idx) => (
                                    <span key={idx} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full font-bold">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <ReviewsWidget targetId={gym._id} targetModel="Gym" />
                    </div>

                    {/* Right: Pricing Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500">
                                <Clock size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-3xl font-black text-white mb-1">
                                    ₹{gym.pricePerMonth}<span className="text-sm text-gray-500 font-medium tracking-normal">/mo</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-yellow-500 mb-4">
                                    <Star size={16} fill="currentColor" /> {gym.rating || 4.8} ({gym.reviewsCount || 120} reviews)
                                </div>

                                <hr className="border-gray-800 my-4" />

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-300">{gym.address || 'Address not listed. Please check maps.'}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-300">Open: {gym.openTime || '5:00 AM'} – {gym.closeTime || '11:00 PM'}</span>
                                    </div>
                                </div>

                                {/* === STEP 1: Book Now CTA → STEP 2: Package Picker === */}
                                {!showPackages ? (
                                    isActive ? (
                                        <div className="space-y-3">
                                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 text-center">
                                                <p className="text-xs font-bold text-green-400">✅ ACTIVE MEMBERSHIP</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">You have full access to this facility.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowPackages(true)}
                                                className="w-full py-2.5 bg-gray-800 text-white font-bold rounded-xl border border-gray-700 hover:bg-gray-700 transition-all text-sm"
                                            >
                                                Extend Plan
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowPackages(true)}
                                            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-black rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-[1.02] text-sm tracking-wide"
                                        >
                                            🏋️ Book Now
                                        </button>
                                    )
                                ) : (
                                    <div className="animate-fade-in">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-sm font-bold text-white">Select a Plan</p>
                                            <button onClick={() => setShowPackages(false)} className="text-gray-500 hover:text-white transition">
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                disabled={isBooking}
                                                onClick={() => handleSubscriptionBooking('Monthly', gym.pricePerMonth)}
                                                className="bg-gray-800 border-2 border-green-500 rounded-xl p-3 flex flex-col items-center hover:bg-green-500/10 transition disabled:opacity-50"
                                            >
                                                <span className="text-green-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Monthly</span>
                                                <span className="text-white text-xl font-black">₹{gym.pricePerMonth}</span>
                                                <span className="text-gray-500 text-[10px] mt-1">per month</span>
                                            </button>
                                            <button
                                                disabled={isBooking}
                                                onClick={() => handleSubscriptionBooking('Yearly', gym.pricePerYear || gym.pricePerMonth * 10)}
                                                className="bg-gray-800 border-2 border-transparent hover:border-green-500 transition rounded-xl p-3 flex flex-col items-center group hover:bg-green-500/10 disabled:opacity-50"
                                            >
                                                <span className="text-gray-400 group-hover:text-green-400 text-[10px] font-bold uppercase mb-1 tracking-wider transition-colors">Yearly</span>
                                                <span className="text-white text-xl font-black">₹{gym.pricePerYear || (gym.pricePerMonth * 10).toFixed(0)}</span>
                                                <span className="text-gray-500 text-[10px] mt-1">per year</span>
                                            </button>
                                        </div>
                                        {isBooking && (
                                            <p className="text-xs text-green-500 text-center mt-3 animate-pulse font-bold">Processing booking...</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentCheckoutModal
                isOpen={!!bookingData}
                onClose={() => setBookingData(null)}
                onSuccess={() => {
                    setBookingData(null);
                }}
                gym={gym}
                booking={bookingData?.booking}
                order={bookingData?.order}
            />
        </div>
    );
}
