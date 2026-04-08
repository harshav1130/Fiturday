import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageModal({ isOpen, onClose, images, currentIndex, setCurrentIndex }) {
    if (!isOpen) return null;

    const handlePrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
            onClick={onClose}
        >
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-[110]"
            >
                <X size={24} />
            </button>

            {images.length > 1 && (
                <>
                    <button 
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110]"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110]"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                <img 
                    src={images[currentIndex].startsWith('http') ? images[currentIndex] : `http://localhost:5000${images[currentIndex]}`} 
                    alt="Gallery item" 
                    className="max-w-full max-h-[85vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white/80 text-xs font-bold border border-white/10">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>
        </div>
    );
}
