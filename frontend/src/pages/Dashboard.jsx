import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, Calendar, Salad, LogOut, Settings, BarChart, MapPin, Activity, CreditCard, Menu, X as CloseIcon, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import DietComponent from '../components/DietComponent';
import WorkoutComponent from '../components/WorkoutComponent';
import SettingsComponent from '../components/SettingsComponent';
import AdminOverview from '../components/AdminOverview';
import UserManagement from '../components/UserManagement';
import PlatformRevenue from '../components/PlatformRevenue';
import GymOverview from '../components/GymOverview';
import RevenueReports from '../components/RevenueReports';
import TrainerSchedule from '../components/TrainerSchedule';
import TrainerEarnings from '../components/TrainerEarnings';
import ClientProgress from '../components/ClientProgress';
import GymDiscovery from '../components/GymDiscovery';
import BookingHistory from '../components/BookingHistory';
import TrainerMarketplace from '../components/TrainerMarketplace';
import ProgressTracker from '../components/ProgressTracker';
import PaymentHistory from '../components/PaymentHistory';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const getInitialTab = () => {
        if (!user) return 'Loading';
        switch (user.role) {
            case 'Admin': return 'Overview';
            case 'Gym Owner': return 'Gym Overview';
            case 'Trainer': return 'My Schedule';
            default: return 'My Activity';
        }
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [activeBooking, setActiveBooking] = useState(null);
    const [notification, setNotification] = useState(null);
    const [clickedNotification, setClickedNotification] = useState(null);

    // Update active tab if the user role loads asynchronously later
    useEffect(() => {
        if (user) {
            setActiveTab(getInitialTab());
            fetchBookings();

            // Socket Global Listener
            const socket = io('');
            socket.emit('join_user', user._id);

            socket.on('new_notification', (data) => {
                // Show notification toast if the user is not in the active chat
                setNotification(data);
                // Auto-clear after 5 seconds
                setTimeout(() => setNotification(null), 5000);
            });

            return () => {
                socket.off('new_notification');
                socket.disconnect();
            };
        }
    }, [user?.role, user?._id]);

    const fetchBookings = async () => {
        try {
            const { data } = await axios.get('/api/bookings/my-bookings');
            // Find most recent confirmed gym booking
            const confirmedGymBooking = data.find(b => b.status === 'Confirmed' && b.type === 'Gym');
            setActiveBooking(confirmedGymBooking);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    if (!user) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-green-500">Loading...</div>;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { name: 'Overview', icon: <LayoutDashboard size={20} /> },
        { name: 'User Management', icon: <Users size={20} /> },
        { name: 'Platform Revenue', icon: <BarChart size={20} /> },
    ];

    const ownerLinks = [
        { name: 'Gym Overview', icon: <LayoutDashboard size={20} /> },
        { name: 'Revenue Reports', icon: <BarChart size={20} /> },
    ];

    const trainerLinks = [
        { name: 'My Schedule', icon: <Calendar size={20} /> },
        { name: 'Earnings', icon: <BarChart size={20} /> },
        { name: 'Client Progress', icon: <Users size={20} /> },
    ];

    const userLinks = [
        { name: 'My Activity', icon: <LayoutDashboard size={20} /> },
        { name: 'Discover Gyms (Map)', icon: <MapPin size={20} /> },
        { name: 'Book Trainer', icon: <Calendar size={20} /> },
        { name: 'Payment History', icon: <CreditCard size={20} /> },
        { name: 'AI Diet Plans', icon: <Salad size={20} /> },
        { name: 'Workouts & Form', icon: <Dumbbell size={20} /> },
        { name: 'Progress Tracker', icon: <Activity size={20} /> },
    ];

    const getSidebarLinks = () => {
        switch (user.role) {
            case 'Admin': return adminLinks;
            case 'Gym Owner': return ownerLinks;
            case 'Trainer': return trainerLinks;
            default: return userLinks;
        }
    };

    const links = getSidebarLinks();

    return (
        <div className="min-h-screen bg-black flex relative">
            
            {/* Mobile overlay backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col justify-between shadow-2xl md:shadow-none`}>
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 tracking-tighter">
                            FIT UR <span className="text-white font-light">DAY</span>
                        </h2>
                        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                            <CloseIcon size={24} />
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {links.map((link) => (
                            <li
                                key={link.name}
                                onClick={() => { setActiveTab(link.name); setIsMobileMenuOpen(false); }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeTab === link.name
                                    ? 'bg-green-500/10 text-green-500 font-semibold border-r-2 border-green-500'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                {link.icon}
                                {link.name}
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-10 overflow-y-auto w-full max-w-[100vw]">
                <header className="mb-6 md:mb-8 flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden text-gray-400 hover:text-white shrink-0"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-white truncate max-w-[200px] md:max-w-none">{activeTab}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm border-b border-gray-800 pb-1 mb-1 text-white font-medium">{user.name}</p>
                            <p className="text-[10px] text-gray-400 mb-1">{user.email}</p>
                            <p className="text-xs text-green-500 uppercase tracking-widest font-bold">{user.role}</p>
                        </div>
                        <div 
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-green-500 font-bold border border-green-500/30 shadow-lg cursor-pointer hover:border-green-400 transition-colors shrink-0 relative"
                        >
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar.startsWith('http') ? user.avatar : `${user.avatar}`} 
                                    className="w-full h-full rounded-full object-cover" 
                                    alt="avatar" 
                                />
                            ) : (user?.name?.charAt(0).toUpperCase() || 'U')}
                            
                            {/* User Dropdown Menu */}
                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
                                        <button 
                                            onClick={() => { setActiveTab('Settings'); setIsUserMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
                                        >
                                            <Settings size={16} /> Settings
                                        </button>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-500/10 transition-colors text-sm"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Global Notification Toast */}
                {notification && (
                    <div 
                        className="fixed top-6 right-6 z-[100] bg-gray-900 border border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] p-4 rounded-xl animate-slide-in-right flex items-center gap-4 cursor-pointer hover:bg-gray-800 transition-all"
                        onClick={() => {
                            if (user.role === 'Trainer') setActiveTab('My Schedule');
                            else setActiveTab('My Activity');
                            setClickedNotification(notification);
                            setNotification(null);
                        }}
                    >
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-black shadow-lg">
                            <Bell size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">New message</p>
                            <p className="text-sm font-bold text-white mb-0.5">{notification.sender?.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{notification.content}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setNotification(null); }} className="text-gray-500 hover:text-white p-1">
                            <CloseIcon size={16} />
                        </button>
                    </div>
                )}

                {/* Dashboard Content Payload */}
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl min-h-[60vh]">
                    {activeTab === 'My Activity' ? (
                        <div className="animate-fade-in space-y-8">
                            <BookingHistory initialChat={clickedNotification} onChatOpened={() => setClickedNotification(null)} />
                        </div>
                    ) : activeTab === 'Discover Gyms (Map)' ? (
                        <div className="animate-fade-in"><GymDiscovery /></div>
                    ) : activeTab === 'Book Trainer' ? (
                        <div className="animate-fade-in"><TrainerMarketplace /></div>
                    ) : activeTab === 'AI Diet Plans' ? (
                        <div className="animate-fade-in"><DietComponent /></div>
                    ) : activeTab === 'Workouts & Form' ? (
                        <div className="animate-fade-in"><WorkoutComponent /></div>
                    ) : activeTab === 'Progress Tracker' ? (
                        <div className="animate-fade-in"><ProgressTracker /></div>
                    ) : activeTab === 'Payment History' ? (
                        <div className="animate-fade-in"><PaymentHistory /></div>
                    ) : activeTab === 'Settings' ? (
                        <SettingsComponent />
                    ) : user.role === 'Admin' && activeTab === 'Overview' ? (
                        <AdminOverview />
                    ) : user.role === 'Admin' && activeTab === 'User Management' ? (
                        <UserManagement />
                    ) : user.role === 'Admin' && activeTab === 'Platform Revenue' ? (
                        <PlatformRevenue />
                    ) : user.role === 'Gym Owner' && activeTab === 'Gym Overview' ? (
                        <GymOverview />
                    ) : user.role === 'Gym Owner' && activeTab === 'Revenue Reports' ? (
                        <RevenueReports />
                    ) : user.role === 'Trainer' && activeTab === 'My Schedule' ? (
                        <TrainerSchedule initialChat={clickedNotification} onChatOpened={() => setClickedNotification(null)} />
                    ) : user.role === 'Trainer' && activeTab === 'Earnings' ? (
                        <TrainerEarnings />
                    ) : user.role === 'Trainer' && activeTab === 'Client Progress' ? (
                        <ClientProgress />
                    ) : (
                        <>
                            <h3 className="text-xl text-white font-semibold mb-4">Welcome to your <span className="text-green-500">{user.role}</span> Workspace</h3>
                            <p className="text-gray-400 mb-6">
                                You are currently viewing the <strong className="text-white">{activeTab}</strong> tab.
                                This area will be populated with {user.role.toLowerCase()}-specific data and components.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
