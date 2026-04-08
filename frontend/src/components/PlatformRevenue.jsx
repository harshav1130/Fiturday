import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Download, ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';

export default function PlatformRevenue() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState('all');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const { data } = await axios.get(`/api/payments/all?t=${Date.now()}`, { withCredentials: true });
                setTransactions(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch payments", err);
                setError("Failed to load transaction history.");
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const filterTransactions = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.filter(txn => {
            const txnDate = new Date(txn.createdAt);
            if (timeFilter === 'month') {
                return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
            } else if (timeFilter === 'year') {
                return txnDate.getFullYear() === currentYear;
            }
            return true; // 'all'
        });
    };

    const filteredTransactions = filterTransactions();

    const totalGross = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const netProfit = filteredTransactions.reduce((sum, tx) => tx.status === 'Captured' ? sum + tx.amount : sum, 0);
    const totalRefunded = filteredTransactions.reduce((sum, tx) => tx.status === 'Refunded' ? sum + tx.amount : sum, 0);
    const platformFees = netProfit * 0.1;

    const handleExportCSV = () => {
        console.log("Exporting CSV for", filteredTransactions.length, "transactions");
        if (filteredTransactions.length === 0) {
            alert("No transactions to export.");
            return;
        }

        const headers = ["Date", "Order ID", "User", "Email", "Gym", "Type", "Status", "Amount"];
        const rows = filteredTransactions.map(txn => [
            new Date(txn.createdAt).toLocaleDateString(),
            txn.orderId,
            txn.userName,
            txn.userEmail,
            txn.gymName || 'N/A',
            txn.bookingType,
            txn.status,
            txn.amount
        ]);

        // Escape commas and wrap in quotes for CSV safety
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        try {
            // Include UTF-8 BOM
            const encodedUri = encodeURI("data:text/csv;charset=utf-8,\uFEFF" + csvContent);
            const link = document.createElement("a");
            const filename = `fiturday_revenue_${new Date().toISOString().split('T')[0]}.csv`;
            
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            link.target = "_blank";
            link.style.display = "none";
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup after a short delay
            setTimeout(() => {
                document.body.removeChild(link);
                console.log("CSV Export link removed");
            }, 1000);

            console.log("CSV Export triggered with Data URI");
        } catch (err) {
            console.error("CSV Export failed", err);
            alert("Failed to export CSV. Please check the console.");
        }
    };

    if (loading) return <div className="flex items-center justify-center p-20 text-green-500 font-bold animate-pulse"><Loader className="animate-spin mr-2" /> Loading Transactions...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Platform Revenue</h2>
                    <p className="text-gray-400 text-sm">Financial tracking, payouts, and transaction history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={timeFilter} 
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold border border-gray-700 focus:outline-none focus:border-green-500 cursor-pointer text-sm"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>

                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition-colors border border-gray-700 text-sm"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center font-bold mb-6">{error}</div>}

            {/* Quick Financial Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl">
                    <p className="text-sm text-gray-400 font-bold mb-1">Gross Volume</p>
                    <h3 className="text-3xl font-black text-white">₹{totalGross.toLocaleString()}</h3>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/5 border border-green-500/30 p-6 rounded-2xl">
                    <p className="text-sm text-green-400 font-bold mb-1">Net Profit</p>
                    <h3 className="text-4xl font-black text-white">₹{netProfit.toLocaleString()}</h3>
                    <p className="text-xs text-red-400 flex items-center gap-1 mt-2 font-bold">-₹{totalRefunded.toLocaleString()} Refunded</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl">
                    <p className="text-sm text-gray-400 font-bold mb-1">Commission (10%)</p>
                    <h3 className="text-3xl font-bold text-white">₹{platformFees.toLocaleString()}</h3>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl">
                    <p className="text-sm text-gray-400 font-bold mb-1">Total Txns</p>
                    <h3 className="text-3xl font-bold text-yellow-500">{filteredTransactions.length}</h3>
                </div>
            </div>

            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Detailed Transaction History</h3>
                <div className="space-y-3">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center p-12 text-gray-500 italic">No transactions found in history.</div>
                    ) : (
                        filteredTransactions.map((txn, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${txn.status === 'Captured' ? 'bg-green-500/10 text-green-500' : txn.status === 'Refunded' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{txn.userName}</p>
                                        <p className="text-xs text-gray-500">{txn.orderId} • {txn.bookingType} {txn.gymName ? `@ ${txn.gymName}` : ''}</p>
                                        <p className="text-[10px] text-gray-600 font-mono">{txn.userEmail}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black ${txn.status === 'Refunded' ? 'text-red-400' : 'text-white'}`}>
                                        {txn.status === 'Refunded' ? '-' : ''}₹{txn.amount}
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${txn.status === 'Captured' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-400'}`}>
                                        {txn.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
