import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage('Success! Check your email for the 6-digit OTP code.');
            setTimeout(() => navigate('/reset-password', { state: { email } }), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset OTP');
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
                <h2 className="text-3xl font-extrabold text-white mb-2 text-center tracking-tight">Forgot Password</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">Enter your email and we'll send you an OTP to reset your password.</p>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm text-center font-medium">{error}</div>}
                {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded mb-4 text-sm text-center font-medium">{message}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset OTP'}
                    </button>
                </form>
            </div>
        </div>
    );
}
