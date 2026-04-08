import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Target, Activity, Flame, Dumbbell, Trophy, Plus } from 'lucide-react';

export default function ProgressTracker() {
    const { user, updateProfile } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [goalWeight, setGoalWeight] = useState(user?.goalWeight || '');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    const [muscleMass, setMuscleMass] = useState('');
    const [activeTab, setActiveTab] = useState('weight');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const { data } = await axios.get('/api/tracking/progress', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Format dates for charts
            const formattedData = data.map(log => ({
                ...log,
                readableDate: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            }));

            setLogs(formattedData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch progress logs', error);
            setLoading(false);
        }
    };

    const handleUpdateGoal = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({ goalWeight: Number(goalWeight) });
            alert('Goal Weight Updated!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update Goal Weight');
        }
    };

    const handleLogProgress = async (e) => {
        e.preventDefault();
        try {
            const payload = {};
            if (weight) payload.weight = Number(weight);
            if (bmi) payload.bmi = Number(bmi);
            if (bodyFat) payload.bodyFatPercentage = Number(bodyFat);
            if (muscleMass) payload.muscleMass = Number(muscleMass);

            if (Object.keys(payload).length === 0) return alert('Please enter at least one metric to log.');

            const token = localStorage.getItem('accessToken');
            await axios.post('/api/tracking/progress', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // reset fields
            setWeight(''); setBmi(''); setBodyFat(''); setMuscleMass('');
            fetchLogs();
            alert('Progress logged successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to log progress');
        }
    };

    const latestLog = logs[logs.length - 1] || {};
    const previousLog = logs[logs.length - 2] || {};

    const getDelta = (metric) => {
        if (!latestLog[metric] || !previousLog[metric]) return null;
        const delta = (latestLog[metric] - previousLog[metric]).toFixed(1);
        if (delta > 0) return <span className="text-red-400 text-xs">+{delta} from last log</span>;
        if (delta < 0) return <span className="text-green-400 text-xs">{delta} from last log</span>;
        return <span className="text-gray-500 text-xs">No change</span>;
    };

    const hasReachedGoal = user?.goalWeight && latestLog.weight && latestLog.weight <= user.goalWeight;

    if (loading) return <div className="text-green-500 font-bold animate-pulse text-center p-8">Loading Progress...</div>;

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header & Goal Setup */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-6 transition-colors shadow-lg
                ${hasReachedGoal ? 'bg-gradient-to-r from-green-900/50 to-emerald-800/20 border-green-500' : 'bg-gray-900 border-gray-800'}
            `}>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        {hasReachedGoal ? <Trophy className="text-yellow-500" /> : <Activity className="text-green-500" />}
                        Progress Tracker
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {hasReachedGoal
                            ? "Congratulations! You've reached or surpassed your target goal weight! Set a new goal to keep improving."
                            : "Track your body metrics over time to visualize your physical transformation."}
                    </p>
                </div>

                <form onSubmit={handleUpdateGoal} className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-xl border border-gray-700">
                    <Target size={18} className="text-gray-500 ml-2" />
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Goal Weight (kg/lb)"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(e.target.value)}
                        className="bg-transparent border-none text-white font-bold w-32 focus:outline-none text-sm placeholder-gray-600"
                    />
                    <button type="submit" className="bg-green-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-400 transition">
                        Save Goal
                    </button>
                </form>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 flex flex-col justify-between hover:border-green-500 transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(34,197,94,0.15)] animate-slide-up" style={{ animationDelay: '0ms' }}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Weight</span>
                        <Target size={16} className="text-blue-400" />
                    </div>
                    <span className="text-2xl font-black text-white">{latestLog.weight ? `${latestLog.weight}` : '--'}</span>
                    <div className="mt-2">{getDelta('weight')}</div>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 flex flex-col justify-between hover:border-green-500 transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(34,197,94,0.15)] animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">BMI</span>
                        <Activity size={16} className="text-purple-400" />
                    </div>
                    <span className="text-2xl font-black text-white">{latestLog.bmi ? `${latestLog.bmi}` : '--'}</span>
                    <div className="mt-2">{getDelta('bmi')}</div>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 flex flex-col justify-between hover:border-green-500 transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(34,197,94,0.15)] animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Body Fat %</span>
                        <Flame size={16} className="text-red-400" />
                    </div>
                    <span className="text-2xl font-black text-white">{latestLog.bodyFatPercentage ? `${latestLog.bodyFatPercentage}%` : '--'}</span>
                    <div className="mt-2">{getDelta('bodyFatPercentage')}</div>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 flex flex-col justify-between hover:border-green-500 transition-all hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(34,197,94,0.15)] animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Muscle Mass</span>
                        <Dumbbell size={16} className="text-orange-400" />
                    </div>
                    <span className="text-2xl font-black text-white">{latestLog.muscleMass ? `${latestLog.muscleMass}` : '--'}</span>
                    <div className="mt-2">{getDelta('muscleMass')}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Analytics */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:col-span-2 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Metrics Over Time</h3>
                        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                            {['weight', 'bmi', 'bodyFatPercentage', 'muscleMass'].map(metric => (
                                <button
                                    key={metric}
                                    onClick={() => setActiveTab(metric)}
                                    className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition ${activeTab === metric ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {metric.replace('Percentage', '%')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        {logs.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={logs}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="readableDate" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                        cursor={{ stroke: '#374151', strokeWidth: 1 }}
                                    />
                                    {/* Optional Reference Line for Goal Weight */}
                                    {activeTab === 'weight' && user?.goalWeight && (
                                        <Line type="monotone" dataKey={() => user.goalWeight} name="Goal" stroke="#EAB308" strokeDasharray="5 5" dot={false} strokeWidth={2} isAnimationActive={true} animationDuration={1000} />
                                    )}
                                    <Line type="monotone" dataKey={activeTab} name="Metric" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', r: 4 }} activeDot={{ r: 6 }} isAnimationActive={true} animationDuration={2500} animationEasing="ease-in-out" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 italic border border-dashed border-gray-700 rounded-xl">
                                Log your progress to see the chart.
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Entry */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 shadow-lg h-fit">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Plus size={18} /> New Entry</h3>
                    <form onSubmit={handleLogProgress} className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Weight</label>
                            <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 75.5" className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-sm focus:border-green-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">BMI</label>
                            <input type="number" step="0.1" value={bmi} onChange={e => setBmi(e.target.value)} placeholder="e.g. 22.4" className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-sm focus:border-green-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Body Fat %</label>
                            <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="e.g. 15.2" className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-sm focus:border-green-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Muscle Mass</label>
                            <input type="number" step="0.1" value={muscleMass} onChange={e => setMuscleMass(e.target.value)} placeholder="e.g. 40.1" className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-sm focus:border-green-500 outline-none" />
                        </div>
                        <button type="submit" className="w-full bg-green-500 text-black font-black uppercase tracking-widest py-3 rounded-lg mt-2 hover:bg-green-400 transition shadow-lg shadow-green-500/20">
                            Log Progress
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
