 import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart as BarChartIcon, DollarSign, TrendingUp, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueReports() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const { data } = await axios.get('http://localhost:5000/api/analytics/owner', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch revenue stats', error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-green-500 font-bold animate-pulse text-center p-8">Loading Revenue Data...</div>;
    if (!stats) return <div className="text-gray-500 text-center p-8">Failed to load revenue data</div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h2 className="text-2xl font-black text-white">Revenue Reports</h2>
                <p className="text-gray-400 text-sm">Track your facility's financial performance and payouts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Net Revenue</p>
                        <h4 className="text-3xl font-black text-white">₹{stats.ownerRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</h4>
                    </div>
                    <DollarSign size={100} className="absolute -right-4 -bottom-4 text-green-500/5 rotate-12" />
                </div>

                <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 flex flex-col justify-center relative overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Memberships</p>
                    <h4 className="text-3xl font-black text-white">{stats.totalConfirmedBookings || 0}</h4>
                    <p className="text-gray-500 text-[10px] font-bold mt-2 uppercase tracking-tighter">Active subscriptions</p>
                </div>

                <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Platform Health</p>
                    <h4 className="text-xl font-bold text-green-500 mt-2">Active</h4>
                    <p className="text-gray-400 text-sm mt-2">Refunds automatically deducted.</p>
                </div>
            </div>

            <div className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700/50 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Revenue Overview</h3>
                        <p className="text-sm text-gray-400">Monthly gross income over the last 6 months</p>
                    </div>
                </div>

                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={(stats.monthlyData && stats.monthlyData.length > 0) ? stats.monthlyData : [
                                { name: 'Jan', revenue: 0 },
                                { name: 'Feb', revenue: 0 },
                                { name: 'Mar', revenue: 0 },
                                { name: 'Apr', revenue: 0 },
                                { name: 'May', revenue: 0 },
                                { name: 'Jun', revenue: 0 }
                            ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} tickFormatter={(value) => `$${value}`} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
            </div>
        </div>
    );
}
