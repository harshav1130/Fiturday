import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, X, MessageSquare, Loader2, User, Paperclip, Mic, Square, Image as ImageIcon, Film, Play, Pause, RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const socket = io('');

export default function ChatComponent({ bookingId, receiverId, receiverName, isOpen, onClose }) {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState('text'); // 'text', 'image', 'video', 'voice'
    const [isSending, setIsSending] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [micLevel, setMicLevel] = useState(0);

    const scrollRef = useRef();
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchChatHistory();
            socket.emit('join_chat', bookingId);

            socket.on('receive_message', (message) => {
                setMessages((prev) => {
                    const exists = prev.some(m => m._id === message._id);
                    if (exists) return prev;
                    return [...prev, message];
                });
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [isOpen, bookingId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const { data } = await axios.get(`/api/chat/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(data.messages || []);
            if (data.endDate && new Date(data.endDate) < new Date()) {
                setIsExpired(true);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch chat history', error);
            setLoading(false);
        }
    };

    const getSupportedMimeType = () => {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
            'audio/wav'
        ];
        return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
    };

    const startRecording = async () => {
        try {
            setError(null);
            chunksRef.current = [];
            setRecordingTime(0);
            
            console.log('🎤 Starting recording sequence...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Track Diagnostics
            const audioTrack = stream.getAudioTracks()[0];
            console.log('🎤 Track Status:', {
                label: audioTrack.label,
                enabled: audioTrack.enabled,
                readyState: audioTrack.readyState,
                muted: audioTrack.muted
            });

            if (audioTrack.muted) {
                setError('Microphone is muted at the system level or by browser.');
            }

            // Setup Visualizer
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            console.log('🎤 AudioContext State:', audioContextRef.current.state);

            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            analyserRef.current.smoothingTimeConstant = 0.3; // More responsive
            source.connect(analyserRef.current);
            
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const updateVisualizer = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    // Filter out very low levels (noise floor)
                    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                    setMicLevel(average > 5 ? average : 0);
                    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
                }
            };
            updateVisualizer();

            const mimeType = getSupportedMimeType();
            console.log('🎤 Creating MediaRecorder with MIME:', mimeType);
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                    const totalSize = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
                    console.log(`🎤 Captured segment: ${e.data.size} bytes. Total: ${totalSize} bytes`);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                console.log('🎤 MediaRecorder stop event triggered');
                cleanupRecordingResources();
                
                const finalMimeType = mediaRecorderRef.current?.mimeType || mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: finalMimeType });
                
                console.log('🎤 Final Blob Result:', {
                    size: blob.size,
                    type: blob.type,
                    chunks: chunksRef.current.length
                });

                if (blob.size === 0) {
                    setError('Recording failed: No audio data was captured. Ensure your microphone is active.');
                    return;
                }

                let extension = 'webm';
                if (finalMimeType.includes('mp4')) extension = 'mp4';
                else if (finalMimeType.includes('ogg')) extension = 'ogg';
                else if (finalMimeType.includes('wav')) extension = 'wav';

                const file = new File([blob], `voice_${Date.now()}.${extension}`, { type: finalMimeType });
                const audioUrl = URL.createObjectURL(blob);
                
                setMediaFile(file);
                setMediaPreview(audioUrl);
                setMediaType('voice');
            };

            mediaRecorderRef.current.onerror = (e) => {
                console.error('🎤 MediaRecorder ERROR:', e);
                setError('Recording Hardware Error: ' + (e.error?.name || 'Unknown'));
            };

            mediaRecorderRef.current.start(500); // Increased slice to 500ms
            setIsRecording(true);
            
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('🎤 Initialization Error:', err);
            setError(`Could not start mic: ${err.name}. Check permissions.`);
            cleanupRecordingResources();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const cleanupRecordingResources = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        
        setMicLevel(0);
    };

    const forceReset = () => {
        setLoading(true);
        fetchChatHistory();
        cleanupRecordingResources();
        setIsRecording(false);
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType('text');
        setError(null);
        setRecordingTime(0);
        setIsSending(false);
        setUploading(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setMediaFile(file);
        const url = URL.createObjectURL(file);
        setMediaPreview(url);
        if (file.type.startsWith('image/')) setMediaType('image');
        else if (file.type.startsWith('video/')) setMediaType('video');
        else if (file.type.startsWith('audio/')) setMediaType('voice');
    };

    const cancelMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType('text');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('media', file);
        const token = localStorage.getItem('accessToken');
        try {
            setUploading(true);
            const { data } = await axios.post('/api/chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            setUploading(false);
            return data.url;
        } catch (err) {
            setUploading(false);
            throw new Error('Upload failed');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !mediaFile) || isSending || isExpired) return;

        setIsSending(true);
        try {
            let uploadedUrl = null;
            if (mediaFile) {
                uploadedUrl = await uploadFile(mediaFile);
            }

            const { data } = await axios.post('/api/chat', {
                bookingId,
                receiverId,
                content: newMessage.trim() || (mediaType === 'voice' ? 'Voice Message' : `Sent an ${mediaType}`),
                messageType: mediaType,
                mediaUrl: uploadedUrl,
                receiverName
            });

            socket.emit('send_message', {
                bookingId,
                receiverId,
                content: data.content,
                messageType: data.messageType,
                mediaUrl: data.mediaUrl,
                sender: { _id: user._id, name: user.name, role: user.role },
                createdAt: data.createdAt
            });

            setMessages((prev) => {
                const exists = prev.some(m => m._id === data._id);
                if (exists) return prev;
                return [...prev, data];
            });
            setNewMessage('');
            cancelMedia();
            setError(null);
        } catch (error) {
            console.error('Send Error:', error);
            setError(error.response?.data?.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-end md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 border-l md:border border-gray-800 w-full max-w-lg h-full md:h-[80vh] flex flex-col md:rounded-3xl shadow-2xl animate-slide-in-right overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 shadow-lg shadow-green-500/10">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg">{receiverName}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Live Conversation</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={forceReset} title="Reset Chat State" className="p-2 hover:bg-gray-800 rounded-xl transition text-gray-500 hover:text-yellow-500">
                            <RefreshCw size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="animate-spin text-green-500" size={32} />
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loading encrypted history...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-gray-600">
                                <MessageSquare size={40} />
                            </div>
                            <p className="text-gray-400 font-bold max-w-[200px]">Send a message to start the secure conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const senderId = msg.sender?._id || msg.sender;
                            const isMe = senderId === user?._id;
                            return (
                                <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end group/msg animate-fade-in`}>
                                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black transition-transform group-hover/msg:scale-110 ${isMe ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                                        {msg.sender?.avatar 
                                            ? <img src={`${msg.sender.avatar}`} alt="" className="w-full h-full object-cover rounded-xl" />
                                            : (msg.sender?.name?.charAt(0).toUpperCase() || '?')
                                        }
                                    </div>
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1 mb-1 ${isMe ? 'text-green-500/60' : 'text-gray-500'}`}>
                                            {isMe ? 'You' : `${msg.sender?.role || 'User'}: ${msg.sender?.name || 'Partner'}`}
                                        </span>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm border transition-all ${isMe ? 'bg-green-500 text-black border-transparent rounded-br-none' : 'bg-gray-800 text-gray-200 border-gray-700 rounded-bl-none'}`}>
                                            {msg.messageType === 'voice' && msg.mediaUrl && <audio src={msg.mediaUrl} controls className="mb-2 min-w-[200px] h-8" />}
                                            {msg.messageType === 'image' && msg.mediaUrl && <img src={msg.mediaUrl} className="mb-2 max-w-sm rounded-lg border border-white/10" />}
                                            {msg.content && <p>{msg.content}</p>}
                                        </div>
                                        <span className="text-[9px] text-gray-600 font-bold mt-1 uppercase px-1 tracking-tighter">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Footer Input */}
                <div className="p-6 bg-gray-900 border-t border-gray-800 sticky bottom-0 z-10">
                    {/* Media Preview / Visualizer */}
                    {isRecording ? (
                        <div className="mb-4 bg-red-500/5 border border-red-500/20 rounded-2xl p-6 animate-pulse">
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-4 w-full justify-center">
                                    {[...Array(12)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1.5 bg-red-500 rounded-full transition-all duration-75" 
                                            style={{ height: `${Math.max(4, (micLevel / 128) * 40 * (1 - Math.abs(i - 6)/10))}px` }}
                                        />
                                    ))}
                                </div>
                                <p className="text-red-500 text-xs font-black uppercase tracking-[0.2em]">Recording... {recordingTime}s</p>
                            </div>
                        </div>
                    ) : mediaPreview ? (
                        <div className="mb-4 relative rounded-2xl overflow-hidden border border-gray-700 bg-black/20 p-4 animate-fade-in group/preview">
                            <button onClick={cancelMedia} className="absolute top-2 right-2 z-20 bg-black/60 p-2 rounded-full text-white hover:bg-black/80 transition border border-white/10">
                                <X size={14} />
                            </button>
                            {mediaType === 'voice' ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                            <Mic size={20} />
                                        </div>
                                        <p className="text-white text-xs font-bold uppercase tracking-widest text-green-400">Audio Preview Available</p>
                                    </div>
                                    <audio src={mediaPreview} controls className="w-full h-10" />
                                </div>
                            ) : (
                                <img src={mediaPreview} alt="preview" className="max-h-40 w-auto rounded-xl mx-auto shadow-2xl" />
                            )}
                        </div>
                    ) : null}

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black text-center rounded-xl uppercase tracking-widest animate-shake">
                            ⚠️ {error}
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,video/*,audio/*" />
                        
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isRecording || uploading} className="p-4 bg-gray-800 text-gray-400 hover:text-white rounded-2xl hover:bg-gray-700 transition disabled:opacity-30">
                            <Paperclip size={20} />
                        </button>

                        <button 
                            type="button" 
                            onClick={isRecording ? stopRecording : startRecording} 
                            disabled={uploading} 
                            className={`p-4 rounded-2xl transition shadow-lg ${isRecording ? 'bg-red-500 text-white shadow-red-500/20 active:scale-95' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                        >
                            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                        </button>

                        <form onSubmit={handleSendMessage} className="relative flex-1">
                            <input
                                type="text"
                                placeholder={isExpired ? "Subscription expired. Chat disabled." : (isRecording ? "Recording in progress..." : (uploading ? "Uploading media..." : "Send a message..."))}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isRecording || uploading || isExpired}
                                className="w-full bg-gray-800 border-2 border-transparent text-white rounded-2xl px-5 py-4 focus:border-green-500 focus:outline-none placeholder-gray-600 text-sm font-medium transition-all"
                            />
                            <button
                                type="submit"
                                disabled={(!newMessage.trim() && !mediaFile) || isRecording || uploading || isExpired}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 text-black p-3 rounded-xl hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 transition shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95"
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
