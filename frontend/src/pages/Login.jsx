import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
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
            <div className="absolute top-[-10%] right-[-5%] w-[50rem] h-[50rem] bg-green-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute top-[20%] left-[10%] w-[30rem] h-[30rem] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

            <div className="relative bg-white/[0.03] backdrop-blur-2xl p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] w-full max-w-md border border-white/10 z-10 transition-all hover:border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-3xl pointer-events-none"></div>
                
                <h2 className="text-4xl font-black text-white mb-2 text-center tracking-tighter">
                    Welcome Back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Fit ur Day</span>
                </h2>
                <p className="text-center text-gray-400 mb-10 text-sm font-medium">
                    Enter your details to sign in to your account
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-4 text-sm text-center font-medium animate-pulse">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-black/50 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-600 font-medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider">Password</label>
                            <Link to="/forgot-password" size="sm" className="text-xs text-green-500 hover:text-green-400 font-medium transition-colors">Forgot Password?</Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-black/50 text-white border border-gray-700 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-600 font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-black py-3.5 rounded-lg transition-all transform hover:scale-[1.02] mt-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer flex items-center justify-center ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-8">
                    Don't have an account? <Link to="/register" className="text-green-500 hover:text-green-400 font-semibold transition-colors">Sign Up for free</Link>
                </p>
            </div>
        </div>
    );
}
