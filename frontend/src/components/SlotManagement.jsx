import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, Users, PlusCircle, Trash2 } from 'lucide-react';

export default function SlotManagement() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [myGym, setMyGym] = useState(null);
    const [slots, setSlots] = useState([]);

    // Form State
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [capacity, setCapacity] = useState('');
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const { data: gyms } = await axios.get('http://localhost:5000/api/gyms');
            // Safely compare user IDs regardless of being a populated object vs string
            const ownedGym = gyms.find(g => 
                g.ownerId?._id?.toString() === user._id?.toString() || 
                g.ownerId?.toString() === user._id?.toString()
            );

            if (ownedGym) {
                setMyGym(ownedGym);
                // Fetch slots for this gym
                const { data: slotsData } = await axios.get(`http://localhost:5000/api/slots/gym/${ownedGym._id}`);
                setSlots(slotsData);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user._id]);

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const { data } = await axios.post('http://localhost:5000/api/slots', {
                gymId: myGym._id,
                date,
                startTime,
                endTime,
                capacity: parseInt(capacity)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSlots([...slots, data]);
            setDate('');
            setStartTime('');
            setEndTime('');
            setCapacity('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create slot');
        }
    };

    if (loading) return <div className="text-green-500 animate-pulse">Loading Slot Management...</div>;

    if (!myGym) {
        return (
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 text-center">
                <h3 className="text-xl font-bold text-white mb-2">No Gym Profile Found</h3>
                <p className="text-gray-400">You must create a Gym Profile in the "Gym Overview" tab before managing slots.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white">Slot Management</h2>
                    <p className="text-gray-400 text-sm">Create and manage bookable time slots for {myGym.name}.</p>
                </div>
                <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-lg font-bold border border-green-500/30">
                    {slots.length} Active Slots
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Slot Form */}
                <div className="lg:col-span-1 bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><PlusCircle size={18} className="text-green-500" /> New Slot</h3>

                    {error && <div className="bg-red-500/10 text-red-500 p-2 text-sm rounded mb-4 font-bold border border-red-500/30">{error}</div>}

                    <form onSubmit={handleCreateSlot} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</label>
                            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-green-500 focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Start Time</label>
                                <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-green-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">End Time</label>
                                <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-green-500 focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Capacity (Max Users)</label>
                            <input type="number" min="1" required value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 focus:border-green-500 focus:outline-none" placeholder="e.g. 20" />
                        </div>
                        <button type="submit" className="w-full bg-green-500 text-black font-bold py-2.5 rounded-lg hover:bg-green-400 transition-colors mt-2">
                            Add Slot
                        </button>
                    </form>
                </div>

                {/* Slots List */}
                <div className="lg:col-span-2">
                    {slots.length === 0 ? (
                        <div className="bg-gray-800/30 p-12 rounded-2xl border border-gray-700/50 text-center flex flex-col items-center">
                            <CalendarIcon size={48} className="text-gray-600 mb-4" />
                            <h4 className="text-lg font-bold text-white">No Slots Created</h4>
                            <p className="text-gray-400 text-sm mt-1">Use the form to create your first bookable time slot.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {slots.sort((a, b) => new Date(a.date) - new Date(b.date)).map((slot) => (
                                <div key={slot._id} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 flex flex-col sm:flex-row justify-between items-center hover:border-gray-600 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 text-center w-32">
                                            <p className="text-xs text-gray-500 uppercase font-bold">{new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                            <p className="text-sm text-white font-bold">{new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold flex items-center gap-2 mb-1"><Clock size={16} className="text-green-500" /> {slot.startTime} - {slot.endTime}</p>
                                            <p className="text-sm text-gray-400 flex items-center gap-2"><Users size={16} /> {slot.bookedCount} / {slot.capacity} Booked</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${slot.status === 'Available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {slot.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
