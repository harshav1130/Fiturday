import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Dumbbell, Calendar, Users, Salad, ChevronRight, Activity, ShieldCheck, Zap } from 'lucide-react';
import PolicyModal, { ContactContent, PrivacyContent, TermsContent } from '../components/PolicyModals';

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null); // 'privacy', 'terms', 'contact'
    const { scrollYProgress } = useScroll();

    // 3D Parallax Effects based on scroll
    // Simplified Parallax Effects
    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const scaleHero = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
    const rotateXHero = useTransform(scrollYProgress, [0, 0.5], [0, 10]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="loader"
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden"
                >
                    <motion.div
                        initial={{ scale: 6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tighter drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">
                            FIT UR <span className="text-white font-light">DAY</span>
                        </h1>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1.0 }}
                            className="mt-8 flex gap-2"
                        >
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black overflow-x-hidden"
                >
                    {/* Navigation */}
                    <motion.nav
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="fixed top-0 w-full z-40 bg-black/50 backdrop-blur-md border-b border-white/5"
                    >
                        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                FIT UR <span className="text-white font-light">DAY</span>
                            </h2>
                            <div className="flex gap-4 items-center">
                                <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">Sign In</Link>
                                <Link to="/register" className="text-sm font-bold bg-green-500 text-black px-5 py-2 rounded-full hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)]">
                                    Join Free
                                </Link>
                            </div>
                        </div>
                    </motion.nav>

                    {/* Hero Section (3D Parallax) */}
                    <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden h-screen flex items-center justify-center [perspective:1000px]">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Purple/Green Glow behind Hero */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[120px] pointer-events-none"></div>

                <motion.div
                    style={{ y: yHero, opacity: opacityHero, scale: scaleHero, rotateX: rotateXHero }}
                    className="relative max-w-7xl mx-auto px-6 text-center z-10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight tracking-tight">
                            Redefine Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">Fitness Ecosystem</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                            A unified platform connecting Gym Owners, Trainers, and Fitness Enthusiasts. Book slots, track progressive overload, and access AI-driven diets in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/register" className="group flex items-center gap-2 px-8 py-4 bg-green-500 text-black font-black text-lg rounded-full hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] hover:-translate-y-1">
                                Get Started <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-8 py-4 bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-full hover:bg-gray-800 transition-all hover:-translate-y-1">
                                Explore Features
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Features Section with Scroll Animations */}
            <section id="features" className="py-32 relative bg-black z-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-6">What We Provide</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to manage a gym facility, scale a personal training business, or achieve your dream physique.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Calendar, title: "Smart Bookings", desc: "Real-time gym slot booking to prevent overcrowding with automated attendance.", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                            { icon: Users, title: "Trainer Marketplace", desc: "Discover certified PTs, read dynamic reviews, and book 1-on-1 sessions securely.", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                            { icon: Salad, title: "AI Diet Plans", desc: "Engineered local & Indian macro-counted recipes tailored strictly to your goals.", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
                            { icon: Dumbbell, title: "Interactive Workouts", desc: "3D animated form checks and step-by-step guides to master every gym movement.", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                whileHover={{ y: -10, rotateY: 5, rotateX: 5 }}
                                className={`p-8 rounded-3xl bg-gray-900 shadow-xl border ${feature.border} transform-gpu perspective-[1000px] transition-all`}
                            >
                                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Performance Stats Section (Parallax visual) */}
            <section className="py-32 relative overflow-hidden bg-gray-900/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-black mb-16"
                    >
                        Built for <span className="text-green-500">Performance</span>
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { i: Activity, value: "< 50ms", label: "Latency" },
                            { i: ShieldCheck, value: "100%", label: "Secure Payments" },
                            { i: Zap, value: "24/7", label: "Uptime" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.2 }}
                                className="flex flex-col items-center"
                            >
                                <stat.i size={40} className="text-green-500 mb-4" />
                                <h4 className="text-5xl font-black text-white mb-2">{stat.value}</h4>
                                <p className="text-gray-400 font-semibold tracking-widest uppercase">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
                            FIT UR <span className="text-white font-light">DAY</span>
                        </h2>
                        <p className="text-gray-500 text-sm">© 2026 Fit ur Day. All rights reserved.</p>
                    </div>
                    <div className="flex gap-6 text-sm font-semibold text-gray-400">
                        <button onClick={() => setActiveModal('privacy')} className="hover:text-green-500 transition-colors cursor-pointer">Privacy Policy</button>
                        <button onClick={() => setActiveModal('terms')} className="hover:text-green-500 transition-colors cursor-pointer">Terms of Service</button>
                        <button onClick={() => setActiveModal('contact')} className="hover:text-green-500 transition-colors cursor-pointer">Contact</button>
                    </div>
                </div>
            </footer>

            <PolicyModal 
                isOpen={activeModal === 'privacy'} 
                onClose={() => setActiveModal(null)} 
                title="Privacy Policy"
            >
                <PrivacyContent />
            </PolicyModal>

            <PolicyModal 
                isOpen={activeModal === 'terms'} 
                onClose={() => setActiveModal(null)} 
                title="Terms of Service"
            >
                <TermsContent />
            </PolicyModal>

            <PolicyModal 
                isOpen={activeModal === 'contact'} 
                onClose={() => setActiveModal(null)} 
                title="Contact Us"
            >
                <ContactContent />
            </PolicyModal>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
