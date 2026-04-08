import { Shield, Bell, Key, User, Trash2, CreditCard, Plus, Camera } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AddCardModal from './AddCardModal';

export default function SettingsComponent() {
    const { user, updateProfile, deleteAccount, logout } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : null);
    
    // Trainer specific state
    const [bio, setBio] = useState('');
    const [monthlyPrice, setMonthlyPrice] = useState('');
    const [expertise, setExpertise] = useState('');
    const [certifications, setCertifications] = useState('');
    const [trainerProfileExists, setTrainerProfileExists] = useState(false);

    // Billing specific state
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(false);
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);

    useEffect(() => {
        if (user?.role === 'Trainer') {
            const fetchTrainerProfile = async () => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const { data } = await axios.get('http://localhost:5000/api/trainers/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setBio(data.bio || '');
                    setMonthlyPrice(data.monthlyPrice || '');
                    setExpertise(data.expertise?.join(', ') || '');
                    setCertifications(data.certifications?.join(', ') || '');
                    setTrainerProfileExists(true);
                } catch (err) {
                    console.log('Trainer profile not found. Form will create one on save.');
                    setTrainerProfileExists(false);
                }
            };
            fetchTrainerProfile();
        }
        
        const fetchPaymentMethods = async () => {
            setLoadingMethods(true);
            try {
                const token = localStorage.getItem('accessToken');
                const { data } = await axios.get('http://localhost:5000/api/payments/methods', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPaymentMethods(data);
            } catch (err) {
                console.error('Failed to fetch payment methods', err);
            } finally {
                setLoadingMethods(false);
            }
        };
        fetchPaymentMethods();
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSuccessMessage('');
        try {
            // using FormData since the backend supports 'avatar' upload (optional)
            const formData = new FormData();
            formData.append('name', name);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            await updateProfile(formData);

            if (user?.role === 'Trainer') {
                const token = localStorage.getItem('accessToken');
                const trainerData = {
                    bio,
                    monthlyPrice: Number(monthlyPrice),
                    expertise: JSON.stringify(expertise.split(',').map(e => e.trim()).filter(e => e)),
                    certifications: JSON.stringify(certifications.split(',').map(c => c.trim()).filter(c => c))
                };
                
                if (trainerProfileExists) {
                    await axios.put('http://localhost:5000/api/trainers/profile', trainerData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else {
                    await axios.post('http://localhost:5000/api/trainers', trainerData, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setTrainerProfileExists(true);
                }
            }

            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePaymentMethod = async (id) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`http://localhost:5000/api/payments/methods/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPaymentMethods(paymentMethods.filter(m => m._id !== id));
        } catch (err) {
            alert('Failed to delete payment method');
        }
    };

    const handleAddRealCard = async (cardData) => {
        try {
            const token = localStorage.getItem('accessToken');
            const { data } = await axios.post('http://localhost:5000/api/payments/methods', cardData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPaymentMethods([data, ...paymentMethods]);
            setSuccessMessage('Card added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert('Failed to add payment method');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("CRITICAL WARNING: This will permanently delete your account and all associated data (gyms, bookings, etc.). This action CANNOT be undone. Are you absolutely sure?");
        if (confirmDelete) {
            try {
                await deleteAccount();
                alert("Your account has been successfully deleted.");
                window.location.href = '/login';
            } catch (err) {
                console.error("Failed to delete account", err);
                alert("Failed to delete account. Please try again later.");
            }
        }
    };

    const [activeTab, setActiveTab] = useState('Profile');

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
                <p className="text-gray-400 text-sm">Manage your profile, security preferences, and notifications.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2">
                    {['Profile', 'Security & Password', 'Notifications', 'Billing', 'Account Status'].map((tab, idx) => (
                        <div key={idx} onClick={() => setActiveTab(tab)} className={`p-3 rounded-lg cursor-pointer font-medium text-sm transition-all ${activeTab === tab ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            {tab}
                        </div>
                    ))}
                </div>

                <div className="md:col-span-2 bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                    {activeTab === 'Profile' ? (
                        <>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><User className="text-green-500" size={20} /> Public Profile</h3>

                            <div className="space-y-6">
                                {/* Avatar Upload Section */}
                                <div className="flex items-center gap-6 pb-6 border-b border-gray-800">
                                    <div className="relative group">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 overflow-hidden flex items-center justify-center text-green-500 text-2xl font-black">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                            <Camera size={20} className="text-white" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">Profile Picture</h4>
                                        <p className="text-xs text-gray-400 mb-3">JPG, PNG or GIF. Max size 2MB.</p>
                                        <button 
                                            onClick={() => document.querySelector('input[type="file"]').click()}
                                            className="text-xs font-bold text-green-500 hover:text-green-400 transition-colors flex items-center gap-1"
                                        >
                                            <Camera size={12} /> Change Photo
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        readOnly
                                        className="w-full bg-gray-900/50 border border-gray-800 text-gray-500 rounded-lg px-4 py-2 cursor-not-allowed"
                                        value={user?.email || ''}
                                    />
                                </div>

                                {user?.role === 'Trainer' && (
                                    <>
                                        <div className="border-t border-gray-800 pt-4 mt-4">
                                            <h4 className="text-sm font-bold text-white mb-4 text-green-500">Trainer Details</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bio / Description</label>
                                                    <textarea 
                                                        value={bio} 
                                                        onChange={e => setBio(e.target.value)} 
                                                        rows="3" 
                                                        placeholder="Experienced fitness coach..."
                                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Pricing (₹)</label>
                                                    <input 
                                                        type="number" 
                                                        value={monthlyPrice} 
                                                        onChange={e => setMonthlyPrice(e.target.value)} 
                                                        placeholder="5000"
                                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" 
                                                    />
                                                    <p className="text-[10px] text-gray-500 mt-1">Covers unlimited sessions for 30 days.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expertise (Comma separated)</label>
                                                    <input 
                                                        type="text" 
                                                        value={expertise} 
                                                        onChange={e => setExpertise(e.target.value)} 
                                                        placeholder="Strength, HIIT, Yoga"
                                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Certifications (Comma separated)</label>
                                                    <input 
                                                        type="text" 
                                                        value={certifications} 
                                                        onChange={e => setCertifications(e.target.value)} 
                                                        placeholder="NASM, ACE"
                                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 flex items-center gap-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-green-500 text-black font-bold px-6 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    {successMessage && <span className="text-sm font-bold text-green-500 animate-pulse">{successMessage}</span>}
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'Security & Password' ? (
                        <div className="animate-fade-in space-y-4">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Shield className="text-green-500" size={20} /> Security Settings</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none" />
                            </div>
                            <button className="mt-4 bg-green-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors">Update Password</button>
                        </div>
                    ) : activeTab === 'Notifications' ? (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Bell className="text-green-500" size={20} /> Notification Preferences</h3>
                            <div className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-800">
                                <div>
                                    <h4 className="text-sm font-bold text-white">Email Alerts</h4>
                                    <p className="text-xs text-gray-500">Receive schedule updates and billing receipts via email.</p>
                                </div>
                                <div className="w-10 h-5 bg-green-500 rounded-full cursor-pointer relative shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                    <div className="w-4 h-4 bg-black rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-800">
                                <div>
                                    <h4 className="text-sm font-bold text-white">SMS Notifications</h4>
                                    <p className="text-xs text-gray-500">Get text messages for immediate reminders and resets.</p>
                                </div>
                                <div className="w-10 h-5 bg-gray-700 rounded-full cursor-pointer relative">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                                </div>
                            </div>
                            <button className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors shadow-lg">Save Preferences</button>
                        </div>
                    ) : activeTab === 'Billing' ? (
                        <div className="animate-fade-in space-y-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Key className="text-green-500" size={20} /> Billing & Payment</h3>
                            
                            {loadingMethods ? (
                                <div className="text-green-500 animate-pulse font-bold">Loading payment methods...</div>
                            ) : paymentMethods.length === 0 ? (
                                <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl text-center">
                                    <CreditCard size={40} className="text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold">No saved payment methods</p>
                                    <p className="text-xs text-gray-500 mt-1">Add a card to enable one-click bookings.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paymentMethods.map((method) => (
                                        <div key={method._id} className="p-5 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl border border-gray-700 relative overflow-hidden shadow-2xl group">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    {method.isDefault ? 'Default Method' : 'Saved Method'}
                                                </h4>
                                                <button 
                                                    onClick={() => handleDeletePaymentMethod(method._id)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-2xl font-mono text-white tracking-widest mb-4">•••• •••• •••• {method.last4}</p>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-semibold text-gray-500">Expires {method.expiryMonth}/{method.expiryYear.toString().slice(-2)}</span>
                                                <span className="text-lg font-black italic text-white/50">{method.brand}</span>
                                            </div>
                                            <div className="absolute -right-8 -bottom-8 bg-green-500/10 w-32 h-32 rounded-full blur-2xl pointer-events-none group-hover:bg-green-500/20 transition-all"></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button 
                                onClick={() => setIsAddCardOpen(true)}
                                className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 font-bold hover:border-green-500 hover:text-green-500 hover:bg-green-500/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Add New Payment Method
                            </button>

                            <AddCardModal 
                                isOpen={isAddCardOpen} 
                                onClose={() => setIsAddCardOpen(false)} 
                                onAdd={handleAddRealCard} 
                            />
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 text-red-500">
                                    <Trash2 size={20} /> Danger Zone
                                </h3>
                                <p className="text-sm text-gray-400">Permanently delete your account and all associated data.</p>
                            </div>

                            <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl">
                                <h4 className="text-sm font-bold text-white mb-2">Delete Account</h4>
                                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                                    Once you delete your account, there is no going back. All your data, including active gym memberships, gym ownership records, and trainer profiles, will be immediately and permanently removed from our servers.
                                </p>
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-2"
                                >
                                    <Trash2 size={18} /> Delete My Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
