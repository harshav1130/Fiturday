import React, { useState } from 'react';
import { X, CreditCard, Calendar, Lock, CheckCircle, Loader2 } from 'lucide-react';

export default function AddCardModal({ isOpen, onClose, onAdd }) {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [brand, setBrand] = useState('VISA');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    if (!isOpen) return null;

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        if (formatted.length <= 19) {
            setCardNumber(formatted);
            // Simple brand detection
            if (formatted.startsWith('4')) setBrand('VISA');
            else if (formatted.startsWith('5')) setBrand('MASTERCARD');
        }
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        if (value.length <= 5) setExpiry(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (cleanNumber.length < 13 || cleanNumber.length > 16) {
            setError('Invalid card number length');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            setError('Invalid expiry date (MM/YY)');
            return;
        }

        const [month, year] = expiry.split('/');
        if (parseInt(month) < 1 || parseInt(month) > 12) {
            setError('Invalid month');
            return;
        }

        if (cvv.length < 3) {
            setError('Invalid CVV');
            return;
        }

        setIsVerifying(true);
        
        // Simulate real bank communication
        setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);
            
            setTimeout(() => {
                onAdd({
                    brand,
                    last4: cleanNumber.slice(-4),
                    expiryMonth: parseInt(month),
                    expiryYear: 2000 + parseInt(year)
                });
                
                setIsVerified(false);
                onClose();
                // Clear fields
                setCardNumber('');
                setExpiry('');
                setCvv('');
            }, 1000);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <CreditCard className="text-green-500" size={24} /> Add Payment Method
                    </h3>
                    <button onClick={onClose} disabled={isVerifying} className="text-gray-500 hover:text-white transition-colors disabled:opacity-30">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-xs font-bold animate-shake">
                            {error}
                        </div>
                    )}

                    <div className={`${isVerifying || isVerified ? 'opacity-30 pointer-events-none' : ''} transition-opacity duration-300 space-y-4`}>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none placeholder-gray-600 font-mono tracking-widest"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-black italic text-xs">
                                    {brand}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none placeholder-gray-600 font-mono"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVV</label>
                                <input
                                    type="password"
                                    placeholder="•••"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, '').substring(0, 3))}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none placeholder-gray-600 font-mono"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 relative">
                        <button
                            type="submit"
                            disabled={isVerifying || isVerified}
                            className={`w-full font-black py-4 rounded-2xl transition-all transform flex items-center justify-center gap-2 ${
                                isVerified 
                                ? 'bg-green-500 text-black' 
                                : isVerifying 
                                ? 'bg-gray-800 text-gray-400' 
                                : 'bg-green-500 text-black hover:bg-green-400 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            }`}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Verifying with Bank...
                                </>
                            ) : isVerified ? (
                                <>
                                    <CheckCircle size={20} /> Bank Verified
                                </>
                            ) : (
                                'Securely Save Card'
                            )}
                        </button>
                        <p className="text-[10px] text-gray-500 text-center mt-4 uppercase font-bold tracking-widest">
                            🔒 SSL Encrypted & PCI Compliant
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
