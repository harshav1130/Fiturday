import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart as BarChartIcon, CheckCircle2, UserCheck, Search, Info, Camera } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

export default function AttendanceManager() {
    const { user } = useContext(AuthContext);
    const [gymId, setGymId] = useState(null);
    const [attendanceData, setAttendanceData] = useState({ today: [], weeklyTrend: [] });
    const [loading, setLoading] = useState(true);
    const [manualUserId, setManualUserId] = useState('');
    const [actionStatus, setActionStatus] = useState(null); // 'Present' | 'Absent'
    const [scannerActive, setScannerActive] = useState(false);

    // Fetch the Gym ID owned by this user
    useEffect(() => {
        const fetchGym = async () => {
            try {
                const token = user?.token || localStorage.getItem('accessToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/gyms', config);
                // Find gym owned by this user
                const ownedGym = data.find(g => g.ownerId === user._id || g.ownerId._id === user._id);
                if (ownedGym) {
                    setGymId(ownedGym._id);
                    fetchAttendance(ownedGym._id, config);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchGym();
    }, [user._id]);

    const fetchAttendance = async (id, configOverride) => {
        try {
            const token = user?.token || localStorage.getItem('accessToken');
            const config = configOverride || { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/api/attendance/gym/${id}`, config);

            // Format dates for charts
            const formattedTrends = data.weeklyTrend.map(t => {
                const parts = t._id.split('-'); // YYYY-MM-DD
                const date = new Date(parts[0], parts[1] - 1, parts[2]);
                return {
                    name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    count: t.count
                };
            });

            setAttendanceData({ ...data, weeklyTrend: formattedTrends });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (targetId, statusType) => {
        try {
            const token = user?.token || localStorage.getItem('accessToken');
            await axios.post('/api/attendance/gym/mark', {
                gymId,
                targetUserId: targetId,
                status: statusType
            }, { headers: { Authorization: `Bearer ${token}` } });

            fetchAttendance(gymId);
            return true;
        } catch (error) {
            alert(error.response?.data?.message || 'Error marking attendance.');
            return false;
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        const success = await handleMarkAttendance(manualUserId, actionStatus);
        if (success) {
            setManualUserId('');
            alert(`Successfully marked user as ${actionStatus}`);
        }
    };

    // Initialize QR code scanner
    useEffect(() => {
        if (!scannerActive) return;

        const html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
            false
        );

        html5QrcodeScanner.render(
            async (decodedText) => {
                // Try parsing the decoded text as JSON from UserQRCard
                try {
                    const parsedData = JSON.parse(decodedText);
                    if (parsedData.userId) {
                        html5QrcodeScanner.pause(true); // Pause scanning

                        // Mark as Present immediately upon scan
                        const success = await handleMarkAttendance(parsedData.userId, 'Present');

                        if (success) {
                            alert(`Scanned successfully: marked ${parsedData.name || 'User'} as Present!`);
                        }

                        // Resume scanning after a brief delay
                        setTimeout(() => html5QrcodeScanner.resume(), 2000);
                    }
                } catch (e) {
                    // Not valid JSON payload, might be a raw ID
                    if (decodedText.length === 24) { // MongoDB ID length
                        html5QrcodeScanner.pause(true);
                        const success = await handleMarkAttendance(decodedText, 'Present');
                        if (success) alert(`Scanned User ID: ${decodedText} as Present`);
                        setTimeout(() => html5QrcodeScanner.resume(), 2000);
                    } else {
                        console.error("Invalid QR format scanned", decodedText);
                    }
                }
            },
            (err) => {
                // Ignored - fires continuously until a QR code is detected
            }
        );

        return () => {
            html5QrcodeScanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, [scannerActive, gymId]);

    if (loading) return <div className="text-green-500 font-bold animate-pulse">Loading Attendance Data...</div>;

    if (!gymId) return (
        <div className="text-yellow-500 font-bold p-8 border border-yellow-500/30 bg-yellow-500/10 rounded-xl flex items-center gap-3">
            <Info /> You do not seem to own a registered gym yet.
        </div>
    );

    const presentsToday = attendanceData.today.filter(a => a.status === 'Present').length;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2"><UserCheck /> Attendance Manager</h2>
                    <p className="text-gray-400 text-sm mt-1">Track daily check-ins with the QR Scanner or map analytics.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Present Today</p>
                    <p className="text-4xl font-black text-green-500">{presentsToday}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Input Panel */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 lg:col-span-1 shadow-lg h-fit">

                    {/* QR Scanner */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Camera size={18} /> Live QR Scanner</h3>
                            <button
                                onClick={() => setScannerActive(!scannerActive)}
                                className={`text-xs font-bold px-3 py-1 rounded transition ${scannerActive ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}
                            >
                                {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
                            </button>
                        </div>

                        {scannerActive ? (
                            <div className="bg-black border border-gray-700 rounded-xl overflow-hidden min-h-[250px] relative">
                                <div id="reader" width="100%"></div>
                            </div>
                        ) : (
                            <div className="bg-gray-900/50 border border-dashed border-gray-700 rounded-xl min-h-[150px] flex items-center justify-center text-gray-500 flex-col gap-2 cursor-pointer hover:bg-gray-900 transition" onClick={() => setScannerActive(true)}>
                                <Camera size={32} className="opacity-50" />
                                <span className="text-xs font-bold tracking-widest uppercase">Click to Enable Camera</span>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-gray-700 my-6"></div>

                    {/* Manual Entry */}
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-white">Manual Entry</p>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Type User ID..."
                                    value={manualUserId}
                                    onChange={(e) => setManualUserId(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 font-mono text-sm focus:border-green-500 outline-none"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    onClick={() => setActionStatus('Present')}
                                    className="flex-1 bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500 hover:text-black font-bold py-2 rounded-lg transition"
                                >
                                    Mark Present
                                </button>
                                <button
                                    type="submit"
                                    onClick={() => setActionStatus('Absent')}
                                    className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white font-bold py-2 rounded-lg transition"
                                >
                                    Mark Absent
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Analytics Chart */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 lg:col-span-2 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChartIcon size={18} /> Last 7 Days Trend</h3>
                    <div className="h-64">
                        {attendanceData.weeklyTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData.weeklyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#1f2937' }}
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} name="Check-ins" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 italic border border-dashed border-gray-700 rounded-xl">
                                Not enough data gathered in the last 7 days.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Today's Roster */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">Today's Roster</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-900 text-gray-300 uppercase font-black tracking-wider text-xs border-b border-gray-700">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">User</th>
                                <th className="px-4 py-3">Member ID</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-tr-lg">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.today.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 italic">No attendance records for today.</td>
                                </tr>
                            )}
                            {attendanceData.today.map((record) => (
                                <tr key={record._id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition">
                                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-green-500">
                                            {record.userId?.name?.charAt(0) || 'U'}
                                        </div>
                                        {record.userId?.name || 'Unknown User'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{record.userId?._id}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${record.status === 'Present' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
