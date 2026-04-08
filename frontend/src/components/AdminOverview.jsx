import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminOverview() {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const { data } = await axios.get(`/api/analytics/admin?t=${Date.now()}`, { withCredentials: true });
                setAdminData(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch admin statistics", error);
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, []);

    if (loading) return <div className="text-green-500 font-bold animate-pulse text-center p-12">Loading Admin Dashboard...</div>;

    if (!adminData) return <div className="text-red-500 font-bold text-center p-12">Failed to load platform data. Please try again.</div>;

    const stats = [
        { title: 'Total Users', value: adminData.totalUsers, change: 'Live', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Gym Partners', value: adminData.totalGyms, change: 'Live', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Gross Revenue', value: `₹${adminData.totalRevenue.toFixed(2)}`, change: 'Total', icon: DollarSign, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { title: 'Net Profit', value: `₹${adminData.netRevenue.toFixed(2)}`, change: `-${adminData.totalRefunded} Ref`, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

    // Real chart data from backend
    const chartData = adminData.monthlyData && adminData.monthlyData.length > 0 
        ? adminData.monthlyData 
        : [
            { name: 'Jan', revenue: 0 },
            { name: 'Feb', revenue: 0 },
            { name: 'Mar', revenue: 0 },
            { name: 'Apr', revenue: 0 },
            { name: 'May', revenue: 0 },
            { name: 'Jun', revenue: 0 },
        ];
    
    console.log('Admin Dashboard Stats:', {
        gross: adminData.totalRevenue,
        net: adminData.netRevenue,
        refunded: adminData.totalRefunded,
        chart: chartData
    });


    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Platform Overview</h2>
                <p className="text-gray-400 text-sm">High-level metrics and system performance across Fit ur Day.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{stat.change}</span>
                        </div>
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                        <p className="text-gray-400 text-sm mt-1">{stat.title}</p>
                    </div>
                ))}
            </div>

            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6 mt-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#22c55e', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
