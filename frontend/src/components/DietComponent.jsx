import { useState, useEffect } from 'react';
import axios from 'axios';
import { dietRecipes } from '../data/dietRecipes';
import { Search, Flame, Beef, Leaf, Clock, ChefHat, Award, Star, Utensils } from 'lucide-react';

export default function DietComponent() {
    const [filterType, setFilterType] = useState('All');
    const [filterGoal, setFilterGoal] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [assignedPlan, setAssignedPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(true);

    useEffect(() => {
        const fetchAssignedPlan = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const { data } = await axios.get('/api/tracking/diet', {
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

    // Filter Logic
    const filteredRecipes = dietRecipes.filter(recipe => {
        const matchType = filterType === 'All' || recipe.type === filterType;
        const matchGoal = filterGoal === 'All' || recipe.goal === filterGoal;
        const matchSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchType && matchGoal && matchSearch;
    });

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ChefHat className="text-green-500" /> AI Recipe Engine
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Discover 50+ personalized Indian recipes.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search recipes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                            />
                        </div>
                    </div>
                </div>



                <div className="flex flex-wrap gap-4">
                    {/* Type Filter */}
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                        {['All', 'Veg', 'Non-Veg'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === type ? (type === 'Veg' ? 'bg-green-600 text-white' : type === 'Non-Veg' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white') : 'text-gray-400 hover:text-white'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Goal Filter */}
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                        {['All', 'Weight Loss', 'Muscle Gain', 'Maintenance'].map(goal => (
                            <button
                                key={goal}
                                onClick={() => setFilterGoal(goal)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterGoal === goal ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'text-gray-400 hover:text-white'}`}
                            >
                                {goal}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all cursor-pointer group flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className={`text-xs px-2 py-1 rounded font-bold tracking-wider ${recipe.type === 'Veg' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {recipe.type.toUpperCase()}
                            </span>
                            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700 flex items-center gap-1">
                                <Clock size={12} /> {recipe.time}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors line-clamp-2">{recipe.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{recipe.goal}</p>

                        <div className="mt-auto pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center">
                            <div>
                                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                                <p className="text-xs font-bold text-white">{recipe.calories}</p>
                                <p className="text-[10px] text-gray-500">kcal</p>
                            </div>
                            <div>
                                <Beef className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                                <p className="text-xs font-bold text-white">{recipe.protein}g</p>
                                <p className="text-[10px] text-gray-500">protein</p>
                            </div>
                            <div>
                                <Leaf className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                                <p className="text-xs font-bold text-white">{recipe.carbs}g</p>
                                <p className="text-[10px] text-gray-500">carbs</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Recipe Details */}
            {selectedRecipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)}>
                    <div
                        className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
                            onClick={() => setSelectedRecipe(null)}
                        >
                            ✕
                        </button>

                        <div className={`p-6 border-b ${selectedRecipe.type === 'Veg' ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}>
                            <div className="flex gap-2 mb-3">
                                <span className={`text-xs px-2 py-1 rounded font-bold tracking-wider ${selectedRecipe.type === 'Veg' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {selectedRecipe.type.toUpperCase()}
                                </span>
                                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                                    {selectedRecipe.goal}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white">{selectedRecipe.title}</h2>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-xl">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-orange-400">{selectedRecipe.calories}</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Calories</p>
                                </div>
                                <div className="w-px h-8 bg-gray-700"></div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-rose-400">{selectedRecipe.protein}g</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Protein</p>
                                </div>
                                <div className="w-px h-8 bg-gray-700"></div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-yellow-400">{selectedRecipe.carbs}g</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Carbs</p>
                                </div>
                                <div className="w-px h-8 bg-gray-700"></div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-blue-400">{selectedRecipe.fat}g</p>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest">Fat</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Ingredients</h3>
                                    <ul className="space-y-2">
                                        {selectedRecipe.ingredients.map((ing, idx) => (
                                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                                <span className="text-green-500 mt-1">•</span> {ing}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Cooking Instructions</h3>
                                    <ol className="space-y-4">
                                        {selectedRecipe.instructions.map((step, idx) => (
                                            <li key={idx} className="text-gray-300 text-sm flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 text-green-500 flex items-center justify-center text-xs font-bold font-mono">
                                                    {idx + 1}
                                                </span>
                                                <span className="pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
