import { useState, useEffect } from 'react';
import { Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const { data } = await axios.get('http://localhost:5000/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });
                setUsers(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load users');
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setUsers(users.filter(user => user._id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user');
        }
    };

    const handleToggleStatus = async (user) => {
        const nextStatus = user.status === 'Active' ? 'Suspended' : user.status === 'Suspended' ? 'Pending' : 'Active';
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`http://localhost:5000/api/admin/users/${user._id}`, { status: nextStatus }, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setUsers(users.map(u => {
                if (u._id === user._id) {
                    return { ...u, status: nextStatus };
                }
                return u;
            }));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-gray-400 p-8 text-center animate-pulse">Loading core platform users...</div>;
    if (error) return <div className="text-red-500 p-8 text-center font-bold">{error}</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
                    <p className="text-gray-400 text-sm">View, edit, and moderate accounts across the platform.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none w-64 transition-colors"
                    />
                </div>
            </div>

            <div className="overflow-x-auto bg-gray-800/30 rounded-2xl border border-gray-700/50">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 font-bold">Name & Email</th>
                            <th className="px-6 py-4 font-bold">Role</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Joined Date</th>
                            <th className="px-6 py-4 text-right font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                            <tr key={u._id} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{u.name}</div>
                                    <div className="text-xs">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Trainer' ? 'bg-purple-500/10 text-purple-500' :
                                        u.role === 'Gym Owner' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-gray-700 text-gray-300'
                                        }`}>{u.role}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${u.status === 'Active' ? 'text-green-500' :
                                        u.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-500' : u.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    <button onClick={() => handleToggleStatus(u)} title="Toggle Status" className="text-gray-400 hover:text-green-500 transition-colors"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(u._id)} title="Delete User" className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No users found matching "{searchTerm}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
