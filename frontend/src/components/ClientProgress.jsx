import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, Activity, Award, UserCheck, ChevronRight, ArrowLeft, Dumbbell, Trash2 } from 'lucide-react';

export default function ClientProgress() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientLogs, setClientLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [clientWorkoutPlan, setClientWorkoutPlan] = useState(null);
    const [clientDietPlan, setClientDietPlan] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const [showPlanModal, setShowPlanModal] = useState(false);
    const [planType, setPlanType] = useState('workout'); // 'workout' or 'diet'
    const [planData, setPlanData] = useState({
        goal: 'Weight Loss',
        exercises: [{ name: '', sets: 3, reps: 10, restTime: 60 }],
        meals: [{ type: 'Breakfast', items: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]
    });

    const fetchClients = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/trainers/clients', getAuthHeaders());
            setClients(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch clients', error);
            setLoading(false);
        }
    };

    const fetchClientLogs = async (clientId) => {
        setLogsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { Authorization: `Bearer ${token}` };
            
            // Fetch Progress Logs
            const { data: logs } = await axios.get(`http://localhost:5000/api/tracking/client/${clientId}`, { headers });
            setClientLogs(logs);

            // Fetch Current Plans
            const { data: wPlan } = await axios.get(`http://localhost:5000/api/tracking/client/${clientId}/workout`, { headers });
            setClientWorkoutPlan(wPlan);

            const { data: dPlan } = await axios.get(`http://localhost:5000/api/tracking/client/${clientId}/diet`, { headers });
            setClientDietPlan(dPlan);

            setLogsLoading(false);
        } catch (error) {
            console.error('Failed to fetch client details', error);
            setLogsLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        try {
            const payload = {
                ...planData,
                userId: selectedClient._id
            };
            
            // Format meals items from string to array if it's diet
            if (planType === 'diet') {
                payload.meals = planData.meals.map(m => ({
                    ...m,
                    items: typeof m.items === 'string' ? m.items.split(',').map(i => i.trim()) : m.items
                }));
            }

            const endpoint = planType === 'workout' ? '/api/tracking/workout' : '/api/tracking/diet';
            await axios.post(`http://localhost:5000${endpoint}`, payload, getAuthHeaders());
            
            alert(`${planType.charAt(0).toUpperCase() + planType.slice(1)} plan assigned successfully!`);
            setShowPlanModal(false);
            
            // Re-fetch client details to show the new plan
            fetchClientLogs(selectedClient._id);

            // Reset plan data
            setPlanData({
                goal: 'Weight Loss',
                exercises: [{ name: '', sets: 3, reps: 10, restTime: 60 }],
                meals: [{ type: 'Breakfast', items: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]
            });
        } catch (error) {
            console.error('Failed to assign plan', error);
            alert(error.response?.data?.message || 'Failed to assign plan');
        }
    };

    const handleDeletePlan = async (planId, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type} plan?`)) return;
        try {
            const endpoint = type === 'workout' ? `/api/tracking/workout/${planId}` : `/api/tracking/diet/${planId}`;
            await axios.delete(`http://localhost:5000${endpoint}`, getAuthHeaders());
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} plan deleted!`);
            fetchClientLogs(selectedClient._id);
        } catch (error) {
            console.error('Failed to delete plan', error);
            alert('Failed to delete plan');
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleViewLogs = (client) => {
        setSelectedClient(client);
        fetchClientLogs(client._id);
    };

    const openPlanModal = (client, type) => {
        setSelectedClient(client);
        setPlanType(type);
        setShowPlanModal(true);
    };

    if (loading) return <div className="text-green-500 animate-pulse font-bold p-8 text-center">Loading Client Data...</div>;

    if (selectedClient && !showPlanModal) {
        return (
            <div className="animate-fade-in space-y-6">
                <button 
                    onClick={() => setSelectedClient(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold text-sm"
                >
                    <ArrowLeft size={16} /> Back to Client List
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        {/* Avatar Fallback Logic */}
                        <div className="relative">
                            {selectedClient.avatar ? (
                                <img 
                                    src={`http://localhost:5000${selectedClient.avatar}`} 
                                    alt={selectedClient.name} 
                                    className="w-16 h-16 rounded-full border-2 border-green-500/50 object-cover" 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={`w-16 h-16 rounded-full bg-gray-900 border-2 border-green-500/50 flex items-center justify-center text-green-500 font-black text-xl ${selectedClient.avatar ? 'absolute inset-0 hidden' : ''}`}>
                                {selectedClient.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">{selectedClient.name}</h2>
                            <p className="text-gray-400 text-sm">{selectedClient.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => openPlanModal(selectedClient, 'workout')}
                            className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-400 transition-all flex items-center gap-2"
                        >
                            <Dumbbell size={16} /> Assign Workout
                        </button>
                        <button 
                            onClick={() => openPlanModal(selectedClient, 'diet')}
                            className="bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400 transition-all flex items-center gap-2"
                        >
                            <Activity size={16} /> Assign Diet
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Progress History */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-green-500" /> Progress History</h3>
                        
                        {logsLoading ? (
                            <div className="text-green-500 animate-pulse text-sm">Loading logs...</div>
                        ) : clientLogs.length === 0 ? (
                            <div className="text-gray-500 p-8 border border-dashed border-gray-700 rounded-xl text-center italic">No progress logs found.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {clientLogs.slice(-3).reverse().map((log, idx) => (
                                    <div key={idx} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                                        <p className="text-xs text-gray-500 font-bold mb-2">{new Date(log.date).toLocaleDateString()}</p>
                                        <div className="flex gap-6">
                                            <p className="text-sm text-white">Weight: <span className="font-bold text-green-500">{log.weight}kg</span></p>
                                            <p className="text-sm text-white">Body Fat: <span className="font-bold text-blue-500">{log.bodyFat}%</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Plans */}
                    <div className="space-y-6">
                        {/* Workout Plan */}
                        <div className="bg-gray-800/20 border border-gray-700/50 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-gray-700 animate-fade-in flex justify-between items-center bg-gray-900/50">
                                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest"><Dumbbell size={16} className="text-green-500" /> Current Workout</h3>
                                <div className="flex items-center gap-2">
                                    {clientWorkoutPlan && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-black">{clientWorkoutPlan.goal}</span>}
                                    {clientWorkoutPlan && (
                                        <button 
                                            onClick={() => handleDeletePlan(clientWorkoutPlan._id, 'workout')}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                {!clientWorkoutPlan ? (
                                    <p className="text-xs text-gray-500 italic p-4 text-center">No workout plan assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {clientWorkoutPlan.exercises.map((ex, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs bg-black/40 p-2 rounded-lg border border-gray-800">
                                                <span className="text-white font-bold">{ex.name}</span>
                                                <span className="text-gray-400">{ex.sets}x{ex.reps} • {ex.restTime}s</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Diet Plan */}
                        <div className="bg-gray-800/20 border border-gray-700/50 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-900/50">
                                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest"><Activity size={16} className="text-emerald-500" /> Current Diet</h3>
                                <div className="flex items-center gap-2">
                                    {clientDietPlan && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black">{clientDietPlan.goal}</span>}
                                    {clientDietPlan && (
                                        <button 
                                            onClick={() => handleDeletePlan(clientDietPlan._id, 'diet')}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                {!clientDietPlan ? (
                                    <p className="text-xs text-gray-500 italic p-4 text-center">No diet plan assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {clientDietPlan.meals.map((meal, i) => (
                                            <div key={i} className="bg-black/40 p-3 rounded-lg border border-gray-800">
                                                <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">{meal.type}</p>
                                                <p className="text-xs text-white leading-relaxed">{(Array.isArray(meal.items) ? meal.items.join(', ') : meal.items)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white">Client Progress</h2>
                    <p className="text-gray-400 text-sm">Monitor your clients' achievements and biometrics.</p>
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="text-gray-500 p-12 text-center border border-dashed border-gray-700 rounded-xl bg-gray-800/20">
                    No active clients found. Clients will appear here once they book a session with you.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {clients.map((client) => (
                        <div key={client._id} className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    {/* Avatar Fallback Logic */}
                                    <div className="relative">
                                        {client.avatar ? (
                                            <img 
                                                src={`http://localhost:5000${client.avatar}`} 
                                                alt={client.name} 
                                                className="w-12 h-12 rounded-full border border-gray-700 object-cover" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-green-500 font-black ${client.avatar ? 'absolute inset-0 hidden' : ''}`}>
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{client.name}</h4>
                                        <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><UserCheck size={12} /> {client.email}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleViewLogs(client)}
                                    className="bg-gray-900 border border-gray-700 p-2 rounded-lg text-green-500 hover:bg-gray-800 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleViewLogs(client)}
                                    className="bg-gray-900 text-gray-400 text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1 border border-gray-800 hover:text-white hover:border-green-500/50 transition-all"
                                >
                                    <Activity size={14} /> View Progress
                                </button>
                                <button
                                    onClick={() => openPlanModal(client, 'workout')}
                                    className="bg-green-500/10 text-green-500 text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1 border border-green-500/20 hover:bg-green-500 hover:text-black transition-all"
                                >
                                    <Dumbbell size={14} /> Create Plan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700/50 text-center flex flex-col items-center mt-8">
                <Award size={40} className="text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Engage Your Clients</h3>
                <p className="text-gray-400 max-w-md">Assign new workout routines and check daily macro logs by clicking into a client's profile.</p>
                <button 
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        alert("Please select a client from the list above to create a coaching plan.");
                    }}
                    className="mt-6 bg-green-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors"
                >
                    Create Coaching Plan
                </button>
            </div>

            {/* Plan Creation Modal */}
            {showPlanModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
                    <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-2xl my-8 relative animate-fade-in shadow-2xl">
                        <button 
                            onClick={() => setShowPlanModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>
                        
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-white mb-1">Create {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</h3>
                            <p className="text-gray-400 text-sm mb-8 font-medium">Assigning custom routine to <span className="text-green-500">{selectedClient?.name}</span></p>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Primary Goal</label>
                                    <select 
                                        value={planData.goal}
                                        onChange={(e) => setPlanData({...planData, goal: e.target.value})}
                                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none font-bold"
                                    >
                                        <option>Weight Loss</option>
                                        <option>Muscle Gain</option>
                                        <option>Maintenance</option>
                                    </select>
                                </div>

                                {planType === 'workout' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Exercises</label>
                                            <button 
                                                onClick={() => setPlanData({
                                                    ...planData, 
                                                    exercises: [...planData.exercises, { name: '', sets: 3, reps: 10, restTime: 60 }]
                                                })}
                                                className="text-xs text-green-500 font-black hover:text-green-400"
                                            >
                                                + Add Exercise
                                            </button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                            {planData.exercises.map((ex, i) => (
                                                <div key={i} className="bg-black/50 p-4 rounded-2xl border border-gray-800 space-y-3 relative group">
                                                    <button 
                                                        onClick={() => {
                                                            const newEx = planData.exercises.filter((_, idx) => idx !== i);
                                                            setPlanData({...planData, exercises: newEx});
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg z-[101]"
                                                        title="Remove Exercise"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <input 
                                                        placeholder="Exercise Name"
                                                        value={ex.name}
                                                        onChange={(e) => {
                                                            const newEx = [...planData.exercises];
                                                            newEx[i].name = e.target.value;
                                                            setPlanData({...planData, exercises: newEx});
                                                        }}
                                                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
                                                    />
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Sets</p>
                                                            <input type="number" value={ex.sets} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1 text-sm text-white" onChange={(e) => {
                                                                const newEx = [...planData.exercises];
                                                                newEx[i].sets = parseInt(e.target.value);
                                                                setPlanData({...planData, exercises: newEx});
                                                            }} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Reps</p>
                                                            <input type="number" value={ex.reps} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1 text-sm text-white" onChange={(e) => {
                                                                const newEx = [...planData.exercises];
                                                                newEx[i].reps = parseInt(e.target.value);
                                                                setPlanData({...planData, exercises: newEx});
                                                            }} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Rest (s)</p>
                                                            <input type="number" value={ex.restTime} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1 text-sm text-white" onChange={(e) => {
                                                                const newEx = [...planData.exercises];
                                                                newEx[i].restTime = parseInt(e.target.value);
                                                                setPlanData({...planData, exercises: newEx});
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">Meals</label>
                                            <button 
                                                onClick={() => setPlanData({
                                                    ...planData, 
                                                    meals: [...planData.meals, { type: 'Lunch', items: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]
                                                })}
                                                className="text-xs text-green-500 font-black hover:text-green-400"
                                            >
                                                + Add Meal
                                            </button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                            {planData.meals.map((meal, i) => (
                                                <div key={i} className="bg-black/50 p-4 rounded-2xl border border-gray-800 space-y-3 relative group">
                                                    <button 
                                                        onClick={() => {
                                                            const newMeals = planData.meals.filter((_, idx) => idx !== i);
                                                            setPlanData({...planData, meals: newMeals});
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg z-[101]"
                                                        title="Remove Meal"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <select 
                                                        value={meal.type}
                                                        onChange={(e) => {
                                                            const newMeals = [...planData.meals];
                                                            newMeals[i].type = e.target.value;
                                                            setPlanData({...planData, meals: newMeals});
                                                        }}
                                                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white"
                                                    >
                                                        <option>Breakfast</option>
                                                        <option>Lunch</option>
                                                        <option>Dinner</option>
                                                        <option>Pre-Workout</option>
                                                        <option>Post-Workout</option>
                                                    </select>
                                                    <textarea 
                                                        placeholder="Items (comma separated)"
                                                        value={meal.items}
                                                        onChange={(e) => {
                                                            const newMeals = [...planData.meals];
                                                            newMeals[i].items = e.target.value;
                                                            setPlanData({...planData, meals: newMeals});
                                                        }}
                                                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white h-20 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleCreatePlan}
                                    className="w-full bg-green-500 text-black p-4 rounded-2xl font-black text-lg hover:bg-green-400 transition-all shadow-lg shadow-green-500/20"
                                >
                                    Confirm and Assign Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
