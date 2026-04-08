import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, Target, AlertTriangle, CheckCircle2, Search, Dumbbell, Award, Clock, Star, Eye } from 'lucide-react';
import { workouts } from '../data/workoutData';

export default function WorkoutComponent() {
    const [selectedMuscle, setSelectedMuscle] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [assignedPlan, setAssignedPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);

    const muscles = ['All', 'Chest', 'Back', 'Shoulders', 'Quadriceps', 'Hamstrings & Back', 'Biceps', 'Triceps', 'Core'];

    useEffect(() => {
        const fetchAssignedPlan = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const { data } = await axios.get('http://localhost:5000/api/tracking/workout', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssignedPlan(data);
            } catch (error) {
                console.error('Failed to fetch assigned plan', error);
            } finally {
                setLoadingPlan(false);
            }
        };
        fetchAssignedPlan();
    }, []);

    const filteredWorkouts = workouts.filter(w => {
        const matchMuscle = selectedMuscle === 'All' || w.targetMuscle.includes(selectedMuscle);
        const matchSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchMuscle && matchSearch;
    });

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Dumbbell className="text-emerald-500" /> Interactive Workouts
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Master your form with step-by-step animated guides.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>



                {/* Muscle Group Filter */}
                <div className="flex flex-wrap gap-2">
                    {muscles.map(muscle => (
                        <button
                            key={muscle}
                            onClick={() => setSelectedMuscle(muscle)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedMuscle === muscle
                                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-emerald-500/50'
                                }`}
                        >
                            {muscle}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout: Grid of Exercises vs Active Video Panel */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left: Exercise List */}
                <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden h-[600px] flex flex-col">
                    <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                        <h3 className="text-white font-bold">Exercise Library</h3>
                        <p className="text-xs text-emerald-500">{filteredWorkouts.length} movements found</p>
                    </div>
                    <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredWorkouts.map(workout => (
                            <div
                                key={workout.id}
                                onClick={() => setActiveWorkout(workout)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${activeWorkout?.id === workout.id
                                    ? 'bg-emerald-500/10 border-emerald-500/50 -translate-y-1 shadow-lg'
                                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-white font-bold text-sm">{workout.title}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${workout.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                        workout.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {workout.difficulty}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Target size={12} className="text-emerald-500" /> {workout.targetMuscle}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Active Workout Viewer */}
                <div className="lg:col-span-2">
                    {activeWorkout ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-fade-in slide-up">
                            {/* Cinematic "Video" Header */}
                            <div className="bg-black aspect-video relative flex items-center justify-center border-b border-gray-800 group">
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80 z-0"></div>
                                {/* Workout Animation Display */}
                                <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-900">
                                    <img
                                        key={activeWorkout.id}
                                        src={activeWorkout.animationUrl}
                                        alt={activeWorkout.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-contain opacity-60 mix-blend-screen pt-4 pb-12"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                        onLoad={(e) => {
                                            e.target.style.display = 'block';
                                            e.target.nextSibling.style.display = 'none';
                                        }}
                                    />
                                    <div className="hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-500">
                                        <PlayCircle className="w-16 h-16 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm font-mono">[Animation Unavailable]</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 z-10">
                                    <h2 className="text-3xl font-black text-white drop-shadow-lg">{activeWorkout.title}</h2>
                                    <div className="flex gap-2 mt-2">
                                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold backdrop-blur-md border border-emerald-500/30">
                                            {activeWorkout.equipment}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Instructions */}
                            <div className="p-8 grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="text-emerald-500" size={20} /> Correct Form Guide
                                    </h3>
                                    <ul className="space-y-4">
                                        {activeWorkout.instructions.map((step, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-gray-300">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold border border-gray-700">
                                                    {idx + 1}
                                                </span>
                                                <span className="pt-0.5 leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle className="text-yellow-500" size={20} /> Common Mistakes
                                    </h3>
                                    <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-5 space-y-3">
                                        {activeWorkout.commonMistakes.map((mistake, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm text-red-300">
                                                <span className="text-red-500 mt-1">✕</span>
                                                <span>{mistake}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                        <h4 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Pro Tip</h4>
                                        <p className="text-sm text-emerald-400 italic">Always start with a lighter weight to perfect the neural pathway and movement mechanics before progressively overloading.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl h-[600px] flex flex-col items-center justify-center text-center p-8">
                            <Dumbbell className="text-gray-700 w-24 h-24 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-500 mb-2">Select an Exercise</h3>
                            <p className="text-gray-600 max-w-sm">Choose a workout from the left panel to view detailed animated form guides and instructions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
