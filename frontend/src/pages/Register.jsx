import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Register() {
    const { register, verifyRegistration } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Info, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, role);
            setStep(2);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyRegistration(email, otp);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
             <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors z-20 font-bold">
                <ArrowLeft size={18} /> Back to Home
            </Link>

            {/* Mesh Gradient Background Accents */}
            <div className="absolute top-[-10%] left-[-5%] w-[50rem] h-[50rem] bg-green-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

            <div className="relative bg-white/[0.03] backdrop-blur-2xl p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] w-full max-w-md border border-white/10 z-10 transition-all hover:border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-3xl pointer-events-none"></div>

                <h2 className="text-4xl font-black text-white mb-2 text-center tracking-tighter">
                    {step === 1 ? 'Join' : 'Verify Email'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{step === 1 ? 'Fit ur Day' : ''}</span>
                </h2>
                <p className="text-center text-gray-400 mb-8 text-sm font-medium">
                    {step === 1 ? 'Create an account to start your journey' : `We've sent a 6-digit code to ${email}`}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm text-center font-medium animate-pulse">{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-600"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-600"
                                placeholder="hello@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Role</label>
                            <select
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={loading}
                            >
                                <option value="User">Regular User</option>
                                <option value="Trainer">Personal Trainer</option>
                                <option value="Gym Owner">Gym Owner</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black py-4 rounded-lg transition-all transform hover:scale-[1.02] mt-6 shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider text-center">One-Time Password</label>
                            <input
                                type="text"
                                maxLength="6"
                                placeholder="000000"
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-xl px-4 py-4 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-800"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-3">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)] cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Register'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1 font-bold"
                            >
                                <ArrowLeft size={12} /> Edit Details
                            </button>
                        </div>
                    </form>
                )}

                <p className="text-center text-gray-400 text-sm mt-8">
                    {step === 1 ? (
                        <>Already have an account? <Link to="/login" className="text-green-500 hover:text-green-400 font-semibold transition-colors">Sign In</Link></>
                    ) : (
                        <>Didn't receive the code? <button onClick={handleSubmit} className="text-green-500 hover:text-green-400 font-semibold transition-colors">Resend OTP</button></>
                    )}
                </p>
            </div>
        </div>
    );
}
