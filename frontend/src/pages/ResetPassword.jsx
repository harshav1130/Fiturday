import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Key, Loader2 } from 'lucide-react';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('/api/auth/reset-password', { email, otp, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            <Link to="/login" className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors z-20 font-bold">
                <ArrowLeft size={18} /> Back to Login
            </Link>
            
            <div className="relative bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800 z-10">
                <h2 className="text-3xl font-extrabold text-white mb-2 text-center tracking-tight">Set New Password</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">Enter the OTP sent to your email and your new password.</p>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm text-center font-medium">{error}</div>}
                {success && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded mb-4 text-sm text-center font-medium animate-bounce">Password updated successfully! Redirecting...</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-black/20 text-gray-400 border border-gray-800 rounded-lg px-4 py-3 cursor-not-allowed"
                            value={email}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">OTP Code</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 transition-all font-mono tracking-[0.5em] text-center"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                placeholder="000000"
                            />
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">New Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 transition-all"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || success}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
