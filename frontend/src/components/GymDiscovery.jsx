import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});
import { Search, Star, Dumbbell, MapPin, ImageIcon, Filter, X } from 'lucide-react';
import GymDetail from './GymDetail';

export default function GymDiscovery() {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGym, setSelectedGym] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [myBookings, setMyBookings] = useState([]);
    const [viewMode, setViewMode] = useState('list');

    // Geolocation and Filters state
    const [location, setLocation] = useState({ lng: null, lat: null });
    const [locationError, setLocationError] = useState(false);
    const [filters, setFilters] = useState({
        distance: '',
        minPrice: '',
        maxPrice: '',
        rating: '',
        amenities: ''
    });

    useEffect(() => {
        // Attempt to get user location on mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    });
                },
                (error) => {
                    console.error("Error obtaining location", error);
                    setLocationError(true);
                    fetchGyms(); // fetch without location
                }
            );
        } else {
            setLocationError(true);
            fetchGyms();
        }
    }, []);

    useEffect(() => {
        if (location.lng && location.lat) {
            fetchGyms();
        }
    }, [location]);

    const fetchGyms = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // Fetch bookings first to show status
            const { data: bookings } = await axios.get('/api/bookings/my-bookings', config);
            const now = new Date();
            setMyBookings(bookings.filter(b => 
                b.status === 'Confirmed' && 
                b.type === 'Gym' &&
                (!b.endDate || new Date(b.endDate) > now)
            ));

            const params = new URLSearchParams();
            if (location.lng && location.lat) {
                params.append('lng', location.lng);
                params.append('lat', location.lat);
                if (filters.distance) params.append('distance', filters.distance);
            }
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.rating) params.append('rating', filters.rating);
            if (filters.amenities) params.append('amenities', filters.amenities);

            const { data } = await axios.get(`/api/gyms?${params.toString()}`, config);
            setGyms(data);
        } catch (err) {
            console.error('Failed to fetch gyms', err);
        }
        setLoading(false);
    };

    const handleApplyFilters = () => {
        fetchGyms();
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({
            distance: '',
            minPrice: '',
            maxPrice: '',
            rating: '',
            amenities: ''
        });
        // We will fetch gyms in the next cycle or user can click apply
    };

    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedGym) {
        const isActive = myBookings.some(b => b.gymId?._id === selectedGym._id || b.gymId === selectedGym._id);
        return <GymDetail gym={selectedGym} onBack={() => setSelectedGym(null)} isActive={isActive} />;
    }

    return (
        <div className="flex flex-col gap-6 h-[75vh]">
            <div className="bg-gray-900 z-10 p-4 border border-gray-800 rounded-2xl shadow-lg relative">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black text-white">Discover Facilities</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors bg-gray-800 text-white hover:bg-gray-700"
                        >
                            <MapPin size={16} /> {viewMode === 'list' ? 'Map View' : 'List View'}
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${showFilters ? 'bg-green-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                <div className="relative max-w-full mb-2">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none"
                    />
                </div>

                {locationError && !location.lng && (
                    <div className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                        <MapPin size={12} /> Location services disabled. Showing all facilities.
                    </div>
                )}

                {/* Filters Collapse Area */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Max Distance (m)</label>
                            <input
                                type="number"
                                value={filters.distance}
                                onChange={e => setFilters({ ...filters, distance: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Price Range (₹)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Min Rating</label>
                            <input
                                type="number"
                                step="0.1"
                                max="5"
                                min="0"
                                value={filters.rating}
                                onChange={e => setFilters({ ...filters, rating: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Amenities (comma sep)</label>
                            <input
                                type="text"
                                placeholder="WiFi, Pool..."
                                value={filters.amenities}
                                onChange={e => setFilters({ ...filters, amenities: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
                            <button onClick={handleClearFilters} className="text-gray-400 text-sm font-bold hover:text-white transition">Clear All</button>
                            <button onClick={handleApplyFilters} className="bg-green-500 text-black text-sm font-black px-6 py-2 rounded-lg hover:bg-green-400 transition shadow-[0_0_10px_rgba(34,197,94,0.3)]">Apply Filters</button>
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="animate-pulse text-green-500 font-bold p-8 text-center flex flex-col items-center justify-center flex-1">
                    <Dumbbell className="animate-spin mb-4" size={40} /> Loading Discovery Engine...
                </div>
            ) : viewMode === 'map' ? (
                <div className="flex-1 rounded-2xl overflow-hidden border border-gray-700 relative z-0 min-h-[400px]">
                    <MapContainer 
                        center={location.lat && location.lng ? [location.lat, location.lng] : [20.5937, 78.9629]} 
                        zoom={location.lat && location.lng ? 13 : 5} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        {location.lat && location.lng && (
                            <Marker position={[location.lat, location.lng]}>
                                <Popup>
                                    <div className="text-center font-bold text-xs text-blue-500">You are here</div>
                                </Popup>
                            </Marker>
                        )}
                        {filteredGyms.map(gym => (
                            gym.location && gym.location.coordinates && gym.location.coordinates.length === 2 && (
                                <Marker 
                                    key={gym._id} 
                                    position={[gym.location.coordinates[1], gym.location.coordinates[0]]}
                                >
                                    <Popup>
                                        <div className="text-center font-sans">
                                            <h3 className="font-bold text-gray-900 m-0 text-sm whitespace-nowrap">{gym.name}</h3>
                                            <p className="text-xs text-gray-600 m-0 mb-2 font-bold">₹{gym.pricePerMonth}/mo</p>
                                            <button 
                                                onClick={() => setSelectedGym(gym)}
                                                className="bg-green-500 text-black px-3 py-1.5 rounded text-xs font-black uppercase w-full hover:bg-green-400"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pr-2 pb-8 flex-1">
                    {filteredGyms.length === 0 && (
                        <div className="col-span-full text-center p-12 flex flex-col items-center justify-center text-gray-500 italic border border-dashed border-gray-700 rounded-xl">
                            <MapPin size={48} className="mb-4 opacity-30" />
                            No facilities match your search criteria.
                            <button onClick={handleClearFilters} className="mt-4 text-green-500 font-bold text-sm">Clear Filters</button>
                        </div>
                    )}

                    {filteredGyms.map(gym => (
                        <div
                            key={gym._id}
                            onClick={() => setSelectedGym(gym)}
                            className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] flex flex-col h-full"
                        >
                            <div className="h-48 mb-4 rounded-xl overflow-hidden bg-gray-900 relative flex-shrink-0">
                                {gym.photos && gym.photos.length > 0 ? (
                                    <img src={`${gym.photos[0]}`} alt={gym.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                        <span className="text-xs uppercase tracking-widest font-bold">No Photos</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-green-500 border border-green-500/30">
                                    ₹{gym.pricePerMonth}/mo
                                </div>
                                {myBookings.some(b => b.gymId?._id === gym._id || b.gymId === gym._id) && (
                                    <div className="absolute top-2 left-2 bg-green-500 text-black px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter border border-black shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                        Active Plan
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col">
                                <h3 className="text-lg font-black text-white truncate">{gym.name}</h3>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2 flex-1">{gym.description}</p>

                                <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 mt-3">
                                    <Star size={14} fill="currentColor" /> {gym.rating || 4.8}
                                </div>

                                <div className="flex flex-wrap gap-1 mt-3">
                                    {(gym.amenities || []).slice(0, 3).map((amenity, idx) => (
                                        <span key={idx} className="bg-gray-900 text-[10px] text-gray-300 px-2 py-1 rounded-full uppercase tracking-wider font-semibold border border-gray-700">
                                            {amenity}
                                        </span>
                                    ))}
                                    {(gym.amenities || []).length > 3 && <span className="text-[10px] text-gray-500 font-bold self-center">+{(gym.amenities || []).length - 3}</span>}
                                </div>

                                <button className="w-full mt-4 bg-gray-700 text-white text-xs font-bold py-2 rounded-lg group-hover:bg-green-500 group-hover:text-black transition-colors border border-gray-600 hover:border-transparent">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
