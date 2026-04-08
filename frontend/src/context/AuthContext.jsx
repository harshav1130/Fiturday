import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Centralized axios interceptors
    useEffect(() => {
        // Request Interceptor
        const reqInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        let isRefreshing = false;
        let failedQueue = [];

        const processQueue = (error, token = null) => {
            failedQueue.forEach(prom => {
                if (error) prom.reject(error);
                else prom.resolve(token);
            });
            failedQueue = [];
        };

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            return axios(originalRequest);
                        }).catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    try {
                        const refresh = localStorage.getItem('refreshToken');
                        if (refresh) {
                            const res = await axios.post('http://localhost:5000/api/auth/refresh', { token: refresh });
                            const { accessToken, refreshToken } = res.data;
                            
                            localStorage.setItem('accessToken', accessToken);
                            localStorage.setItem('refreshToken', refreshToken);
                            
                            processQueue(null, accessToken);
                            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        setUser(null);
                        // Force redirect to login
                        window.location.href = '/login';
                    } finally {
                        isRefreshing = false;
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.request.eject(reqInterceptor);
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const res = await axios.get('http://localhost:5000/api/auth/profile');
                    setUser(res.data);
                } catch (err) {
                    console.error('Auth sync error', err);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        const handleStorageChange = (e) => {
            if (e.key === 'accessToken' || e.key === 'refreshToken') {
                fetchUser();
            }
        };

        fetchUser();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        if (res.data.require2FA) {
            return res.data;
        }
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data);
        return res.data;
    };

    const verify2FA = async (email, otp) => {
        const res = await axios.post('http://localhost:5000/api/auth/verify-2fa', { email, otp });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data);
        return res.data;
    };

    const register = async (name, email, password, role) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
        return res.data;
    };

    const verifyRegistration = async (email, otp) => {
        const res = await axios.post('http://localhost:5000/api/auth/verify-registration', { email, otp });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        setUser(res.data);
        return res.data;
    };

    const updateProfile = async (formData) => {
        const token = localStorage.getItem('accessToken');
        const res = await axios.put('http://localhost:5000/api/auth/profile', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setUser({ ...user, ...res.data });
        return res.data;
    };

    const googleLogin = async (tokenId) => {
        const payload = JSON.parse(atob(tokenId.split('.')[1]));
        const { email, name, picture } = payload;

        try {
            const res = await axios.post('http://localhost:5000/api/auth/google', { token: tokenId, email, name, avatar: picture });
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            setUser(res.data);
        } catch (err) {
            throw err;
        }
    }

    const deleteAccount = async () => {
        try {
            await axios.delete('http://localhost:5000/api/auth/profile');
            logout();
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, verify2FA, register, verifyRegistration, updateProfile, deleteAccount, googleLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
