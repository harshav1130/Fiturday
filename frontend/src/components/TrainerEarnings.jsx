import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Wallet, ArrowUpRight } from 'lucide-react';

export default function TrainerEarnings() {
    const [earningsData, setEarningsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchEarnings = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const { data } = await axios.get('http://localhost:5000/api/trainers/earnings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEarningsData(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch trainer earnings', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);

    if (loading) {
        return <div className="text-green-500 animate-pulse font-bold p-8 text-center">Loading Earnings Data...</div>;
    }

    if (!earningsData) {
        return <div className="text-red-500 p-8 text-center font-bold">Failed to load earnings profile. Ensure you have created a Trainer Profile first.</div>;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h2 className="text-2xl font-black text-white">Earnings Dashboard</h2>
                <p className="text-gray-400 text-sm">Track your completed sessions and automatic payouts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-900/20 p-6 rounded-2xl border border-green-500/30 relative overflow-hidden">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 flex items-center gap-2"><DollarSign size={16} /> Total Earned (All Time)</p>
                    <h4 className="text-4xl font-black text-white">₹{earningsData?.totalEarned?.toFixed(2) || '0.00'}</h4>
                    <div className="mt-6 p-4 bg-black/40 rounded-xl border border-green-500/10">
                        <p className="text-[10px] text-green-500/70 font-black uppercase tracking-[0.2em] mb-1">Payment Status</p>
                        <p className="text-xs text-white/80 leading-relaxed font-medium">All completed sessions are automatically processed and credited to your linked bank account.</p>
                    </div>
                </div>

                <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Activity</p>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <span className="text-gray-400">Total Active Monthly Clients</span>
                            <span className="text-white font-black">{earningsData.totalSessions} Clients</span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mt-8 mb-4">Recent Transactions</h3>
            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
                {earningsData.recentTransactions.length === 0 ? (
                    <div className="text-gray-500 p-8 text-center text-sm italic">No recent transactions.</div>
                ) : (
                    earningsData.recentTransactions.map((txn, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${txn.isOut ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                    {txn.isOut ? <ArrowUpRight size={20} /> : <DollarSign size={20} />}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{txn.client}</p>
                                    <p className="text-gray-500 text-xs font-mono">{txn.id} • {txn.date}</p>
                                </div>
                            </div>
                            <span className={`font-black ${txn.isOut ? 'text-white' : 'text-green-500'}`}>{txn.amount}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
