import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, DollarSign, Activity, Image as ImageIcon, PlusCircle, CheckCircle, Calendar, Hash, TrendingUp, X } from 'lucide-react';
import ImageModal from './ImageModal';

export default function GymOverview() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [myGym, setMyGym] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [ownerStats, setOwnerStats] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [priceYear, setPriceYear] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState({ lng: null, lat: null });
    const [openTime, setOpenTime] = useState('05:00 AM');
    const [closeTime, setCloseTime] = useState('11:00 PM');
    const [isLocating, setIsLocating] = useState(false);

    const [photos, setPhotos] = useState([]);
    const [amenities, setAmenities] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Lightbox State
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const fetchMyGym = async () => {
        try {
            const { data } = await axios.get('/api/gyms');
            // Find the gym owned by the current user
            const ownedGym = data.find(g => 
                g.ownerId?._id?.toString() === user._id?.toString() || 
                g.ownerId?.toString() === user._id?.toString()
            );
            if (ownedGym) {
                setMyGym(ownedGym);
                // Pre-populate form fields for editing
                setName(ownedGym.name || '');
                setDescription(ownedGym.description || '');
                setPrice(ownedGym.pricePerMonth || '');
                setPriceYear(ownedGym.pricePerYear || '');
                setAddress(ownedGym.address || '');
                if (ownedGym.location && ownedGym.location.coordinates) {
                    setLocation({ lng: ownedGym.location.coordinates[0], lat: ownedGym.location.coordinates[1] });
                }
                setAmenities(ownedGym.amenities?.join(', ') || '');
                setOpenTime(ownedGym.openTime || '05:00 AM');
                setCloseTime(ownedGym.closeTime || '11:00 PM');
            }

            // Fetch owner analytics
            const token = user?.token || localStorage.getItem('accessToken');
            const statsRes = await axios.get('/api/analytics/owner', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOwnerStats(statsRes.data);

            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch gyms or stats', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyGym();
    }, [user._id]);

    const handleGetLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lng: position.coords.longitude,
                        lat: position.coords.latitude
                    });
                    setIsLocating(false);
                },
                (err) => {
                    console.error("Error obtaining location", err);
                    setError("Failed to get location. Please ensure location permissions are granted.");
                    setIsLocating(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser");
            setIsLocating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('pricePerMonth', price);
            formData.append('pricePerYear', priceYear);
            formData.append('address', address);
            if (location.lng && location.lat) {
                formData.append('location', JSON.stringify(location));
            }
            formData.append('openTime', openTime);
            formData.append('closeTime', closeTime);

            // Amenities comma separated
            const amenitiesArray = amenities.split(',').map(a => a.trim()).filter(a => a);
            formData.append('amenities', JSON.stringify(amenitiesArray));

            // Photos
            formData.append('existingPhotos', JSON.stringify(myGym?.photos || []));
            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            let res;
            if (isEditing) {
                res = await axios.put(`/api/gyms/${myGym._id}`, formData, config);
                setSuccess('Gym Profile updated successfully!');
            } else {
                res = await axios.post('/api/gyms', formData, config);
                setSuccess('Gym Profile created successfully!');
            }

            setMyGym(res.data);
            setIsCreating(false);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to process gym profile');
        }
    };

    const handleDeletePhoto = async (photoUrl) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        
        try {
            const token = localStorage.getItem('accessToken');
            const updatedExistingPhotos = myGym.photos.filter(p => p !== photoUrl);
            
            const formData = new FormData();
            formData.append('existingPhotos', JSON.stringify(updatedExistingPhotos));
            
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const res = await axios.put(`/api/gyms/${myGym._id}`, formData, config);
            setMyGym(res.data);
            setSuccess('Photo deleted successfully!');
        } catch (err) {
            console.error('Failed to delete photo', err);
            setError('Failed to delete photo');
        }
    };

    if (loading) return <div className="animate-pulse text-green-500">Loading Gym Data...</div>;

    if (!myGym && !isCreating) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-900/50 border border-gray-800 rounded-2xl">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <Activity size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Configure Your Gym</h3>
                <p className="text-gray-400 max-w-md mb-8">You haven't set up your gym profile yet. Add your gym's details, address, and pricing so users can discover and book slots.</p>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors"
                >
                    <PlusCircle size={20} /> Create Gym Profile
                </button>
            </div>
        );
    }

    if (isCreating || isEditing) {
        return (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit' : 'Create'} Gym Profile</h3>
                    <button onClick={() => { setIsCreating(false); setIsEditing(false); }} className="text-gray-500 hover:text-white text-sm font-medium">Cancel</button>
                </div>

                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm font-bold border border-red-500/30">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gym Name</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" placeholder="e.g. Iron Forge Fitness" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" placeholder="Tell us about your facility..."></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Physical Address</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                    <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2 focus:border-green-500 focus:outline-none" placeholder="123 Fitness Ave, Muscle City" />
                                </div>
                                <button type="button" onClick={handleGetLocation} disabled={isLocating} className="bg-green-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                                    {isLocating ? 'Locating...' : 'Get Coordinate'}
                                </button>
                            </div>
                            {location.lng && location.lat && (
                                <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1">
                                    <CheckCircle size={12} /> Coordinates saved: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Fee (₹)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2 focus:border-green-500 focus:outline-none" placeholder="3000" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yearly Fee (₹)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                                <input type="number" required value={priceYear} onChange={(e) => setPriceYear(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2 focus:border-green-500 focus:outline-none" placeholder="30000" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opening Time</label>
                            <input type="text" required value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" placeholder="e.g. 5:00 AM" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Closing Time</label>
                            <input type="text" required value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" placeholder="e.g. 11:00 PM" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amenities (Comma separated)</label>
                            <input type="text" required value={amenities} onChange={(e) => setAmenities(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" placeholder="WiFi, Showers, Parking" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gym Photos (Up to 5)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setPhotos(Array.from(e.target.files))}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500/10 file:text-green-500 hover:file:bg-green-500/20 cursor-pointer"
                            />
                            {photos.length > 0 && <p className="text-xs text-green-500 mt-2">{photos.length} photo(s) selected.</p>}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-green-500 text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        {isEditing ? 'Update Gym Profile' : 'Publish Gym Profile'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            {success && <div className="bg-green-500/10 text-green-500 p-4 rounded-lg flex items-center gap-3 font-bold border border-green-500/30"><CheckCircle size={20} /> {success}</div>}

            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-black text-white">{myGym.name}</h2>
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-2 text-gray-400 font-medium">
                            <MapPin size={16} className="text-green-500" />
                            <span>{myGym.address || 'Address not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-medium">
                            <Calendar size={16} className="text-blue-500" />
                            <span>Open: {myGym.openTime} - {myGym.closeTime}</span>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-4 max-w-2xl">{myGym.description}</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold border border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                        Edit Profile
                    </button>
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 text-right">
                        <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Monthly Pass</span>
                        <span className="text-2xl font-black text-green-500">₹{myGym.pricePerMonth}</span>
                    </div>
                    {myGym.pricePerYear && (
                        <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 text-right">
                            <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Yearly Pass</span>
                            <span className="text-2xl font-black text-green-500">₹{myGym.pricePerYear}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard KPIs */}
            {ownerStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
                        <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500"><Calendar size={24} /></div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Active Members</p>
                            <h4 className="text-2xl font-black text-white">{ownerStats.totalConfirmedBookings}</h4>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
                        <div className="bg-green-500/10 p-3 rounded-lg text-green-500"><TrendingUp size={24} /></div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Revenue</p>
                            <h4 className="text-2xl font-black text-white">₹{ownerStats.ownerRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="md:col-span-2 bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4"><ImageIcon className="text-green-500" size={16} /> Facility Photos</h4>
                    {myGym.photos && myGym.photos.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {myGym.photos.map((url, i) => (
                                <div key={i} className="relative group flex-shrink-0">
                                    <img 
                                        src={`${url}`} 
                                        alt="Gym Photo" 
                                        onClick={() => { setLightboxIndex(i); setShowLightbox(true); }}
                                        className="h-48 w-72 object-cover rounded-xl border border-gray-700 shadow-md cursor-pointer hover:opacity-90 transition-opacity" 
                                    />
                                    <button 
                                        onClick={() => handleDeletePhoto(url)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                        title="Delete Photo"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No photos uploaded for this facility yet.</p>
                    )}
                </div>

                <ImageModal 
                    isOpen={showLightbox}
                    onClose={() => setShowLightbox(false)}
                    images={myGym.photos}
                    currentIndex={lightboxIndex}
                    setCurrentIndex={setLightboxIndex}
                />

                <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4"><Activity className="text-green-500" size={16} /> Facility Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                        {myGym.amenities.map((item, idx) => (
                            <span key={idx} className="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full font-medium">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700/50 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4"><MapPin className="text-green-500" size={16} /> Contact Details</h4>
                    <p className="text-xs text-gray-400">For location inquiries or direct bookings, please visit us at:</p>
                    <p className="text-sm text-white font-bold mt-2">{myGym.address || 'Address not listed'}</p>
                </div>
            </div>
        </div>
    );
}

