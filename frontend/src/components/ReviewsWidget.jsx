import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare, X, Send, Camera, ChevronDown } from 'lucide-react';

export default function ReviewsWidget({ targetId, targetModel }) {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`/api/reviews/${targetId}`);
            setReviews(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch reviews', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [targetId]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append('targetId', targetId);
            formData.append('targetModel', targetModel);
            formData.append('rating', rating);
            formData.append('comment', comment);
            images.forEach(img => formData.append('images', img));

            const token = localStorage.getItem('accessToken');
            await axios.post('/api/reviews', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setComment('');
            setRating(5);
            setImages([]);
            setImagePreviews([]);
            fetchReviews();
        } catch (error) {
            alert(error.response?.data?.message || 'Error posting review. Make sure you have a confirmed booking!');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-gray-800/60 mt-10 shadow-2xl overflow-hidden">
            {/* Clickable header — toggles section open/closed */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-gray-800/30 transition-colors duration-200 group"
            >
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                        <MessageSquare size={24} />
                    </div>
                    Experiences
                </h3>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                        {reviews.length} Feedbacks
                    </div>
                    <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Collapsible content */}
            {isOpen && <div className="px-6 md:px-8 pb-6 md:pb-8">

            {/* Post Review Form */}
            <form onSubmit={handleSubmit} className="mb-12 bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500 transform -translate-x-full group-focus-within:translate-x-0 transition-transform duration-300"></div>
                
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Rate your experience:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={24}
                                onClick={() => setRating(star)}
                                className={`cursor-pointer transition-all duration-200 transform hover:scale-125 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your thoughts... What did you love about the facility?"
                        className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-xl p-4 text-sm focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none resize-none mb-4 transition-all"
                        rows="4"
                    ></textarea>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
                        {imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-700 group">
                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl cursor-pointer transition text-xs font-bold border border-gray-700">
                            <Camera size={16} className="text-green-500" />
                            Add Photos
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        <span className="text-[10px] text-gray-500 font-medium">Max 5 photos allowed</span>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isPosting || !comment.trim()}
                        className="w-full sm:w-auto bg-green-500 text-black px-8 py-3 rounded-xl text-sm font-black hover:bg-green-400 transition transform active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                    >
                        {isPosting ? 'Posting...' : <><Send size={16} /> Post Experience</>}
                    </button>
                </div>
            </form>

            <hr className="border-gray-800/50 mb-10" />

            {/* List Reviews */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-800/20 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/10 rounded-3xl border border-dashed border-gray-800">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                        <Star size={32} />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No reviews yet. Be the first to share your journey!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {reviews.map(rev => (
                        <div key={rev._id} className="relative group animate-slide-up">
                            <div className="flex gap-4 md:gap-6">
                                <div className="shrink-0">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center text-lg font-black text-green-500 relative shadow-inner overflow-hidden">
                                        {rev.userId?.avatar ? (
                                            <img src={rev.userId.avatar.startsWith('/uploads/') ? `/api${rev.userId.avatar}` : rev.userId.avatar} className="w-full h-full object-cover" />
                                        ) : (rev.userId?.name?.charAt(0) || 'U')}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-3">
                                        <div>
                                            <h4 className="text-white font-bold group-hover:text-green-500 transition-colors uppercase tracking-tight">{rev.userId?.name || 'Anonymous User'}</h4>
                                            <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">{new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div className="flex text-yellow-500 bg-yellow-500/5 px-2 py-1 rounded-lg border border-yellow-500/10 w-fit">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={12} 
                                                    fill={i < rev.rating ? 'currentColor' : 'none'} 
                                                    className={i < rev.rating ? 'text-yellow-500' : 'text-gray-700'} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{rev.comment}"</p>

                                    {/* Review Images */}
                                    {rev.images && rev.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {rev.images.map((img, idx) => (
                                                <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border border-gray-800 group-hover:border-gray-700 transition cursor-pointer">
                                                    <img src={img.startsWith('/uploads/') ? `/api${img}` : img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="review evidence" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>}
        </div>
    );
}
