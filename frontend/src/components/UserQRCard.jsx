import React, { useContext, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../context/AuthContext';
import { QrCode, ShieldCheck, Activity } from 'lucide-react';
import axios from 'axios';

export default function UserQRCard({ activeBooking }) {
    const { user } = useContext(AuthContext);
    const [attendanceStats, setAttendanceStats] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchAttendance = async () => {
            try {
                const { data } = await axios.get('/api/attendance/monthly', { withCredentials: true });
                setAttendanceStats(data);
            } catch (error) {
                console.error('Failed to fetch attendance stats', error);
            }
        };
        fetchAttendance();
    }, [user]);

    if (!user) return null;

    // The payload we embed in the QR code - now unique to the booking
    const qrData = JSON.stringify({
        userId: user._id,
        bookingId: activeBooking?._id,
        gymId: activeBooking?.gymId?._id || activeBooking?.gymId,
        name: user.name,
        email: user.email
    });

    return (
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-900/20 p-8 rounded-3xl border border-green-500/30 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <QrCode size={120} />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full">
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <ShieldCheck className="text-green-500" /> Digital Member Pass
                </h3>
                {activeBooking?.gymId?.name && (
                    <p className="text-green-400 font-bold mb-2 uppercase tracking-tighter">
                        Active at: {activeBooking.gymId.name}
                    </p>
                )}
                <p className="text-gray-400 text-sm mb-6 max-w-xs">Show this QR code at the gym reception to continuously track your daily attendance and metrics.</p>

                <div className="bg-white p-4 rounded-2xl shadow-xl">
                    <QRCodeSVG
                        value={qrData}
                        size={180}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"Q"}
                    />
                </div>

                <div className="mt-6 flex flex-col items-center">
                    <span className="text-green-500 font-bold tracking-widest uppercase text-xs">Booking ID / Member ID</span>
                    <span className="text-gray-300 font-mono text-sm mt-1 bg-gray-900/50 px-3 py-1 rounded-lg border border-gray-700/50">
                        {activeBooking?._id || user._id}
                    </span>
                </div>

                {attendanceStats && (
                    <div className="mt-6 w-full pt-6 border-t border-green-500/20 flex justify-between items-center text-left">
                        <div>
                            <p className="text-xs text-green-500 uppercase tracking-widest font-bold">This Month</p>
                            <p className="text-sm text-white font-bold flex items-center gap-1 mt-1">
                                <Activity size={14} className="text-green-500" /> {attendanceStats.count} Check-ins
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Consistency</p>
                            <p className="text-2xl font-black text-green-400">{attendanceStats.percentage}%</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
