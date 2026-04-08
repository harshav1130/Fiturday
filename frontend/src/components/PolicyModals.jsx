import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin } from 'lucide-react';

export default function PolicyModal({ isOpen, onClose, title, children }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-white/5">
                            <h3 className="text-2xl font-black tracking-tighter text-white">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto text-gray-400 leading-relaxed custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function ContactContent() {
    return (
        <div className="space-y-6">
            <p className="text-lg">We'd love to hear from you. Whether you have a question about our platform as a gym owner, trainer, or member, our team is ready to help.</p>
            <div className="grid gap-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
                        <Mail size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Email Us</p>
                        <p className="text-white font-semibold">sriharsha@gmail.com</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
                        <Phone size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Call Us</p>
                        <p className="text-white font-semibold">+91 1234567890</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors group">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Location</p>
                        <p className="text-white font-semibold">Rajahmundry, Andhra Pradesh, India</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PrivacyContent() {
    return (
        <div className="space-y-4">
            <h4 className="text-white font-bold text-lg">1. Data Collection</h4>
            <p>We collect information you provide directly to us, such as when you create an account, book a slot, or communicate with us.</p>
            <h4 className="text-white font-bold text-lg">2. How We Use Data</h4>
            <p>Your data is used to provide, maintain, and improve our services, including processing bookings and providing AI-driven diet recommendations.</p>
            <h4 className="text-white font-bold text-lg">3. Security</h4>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.</p>
            <p className="pt-4 border-t border-white/5 text-sm text-gray-500 italic">Last updated: March 2026</p>
        </div>
    );
}

export function TermsContent() {
    return (
        <div className="space-y-4">
            <h4 className="text-white font-bold text-lg">1. Acceptance of Terms</h4>
            <p>By using Fit ur Day, you agree to comply with and be bound by these Terms of Service.</p>
            <h4 className="text-white font-bold text-lg">2. User Accounts</h4>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            <h4 className="text-white font-bold text-lg">3. Booking Policy</h4>
            <p>Users must adhere to gym-specific rules and slot timings. Cancellations are subject to the specific gym's policy.</p>
            <p className="pt-4 border-t border-white/5 text-sm text-gray-500 italic">Last updated: March 2026</p>
        </div>
    );
}
