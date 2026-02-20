
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const { error: err } = await login(email, password);
        setIsLoading(false);
        if (err) {
            setError(err);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-ms-black flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Logo */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-[0.3em] text-white font-serif italic uppercase">Stitch</h1>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Fashion Operating System</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/50 space-y-8">

                    <div>
                        <h2 className="text-2xl font-bold font-serif text-ms-black">Sign In</h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ms-gray mt-2">Enter your studio credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ms-gray" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@stitch.com"
                                    className="w-full bg-ms-beige/30 border border-ms-border rounded-lg pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ms-black transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ms-gray" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-ms-beige/30 border border-ms-border rounded-lg pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ms-black transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ms-gray hover:text-ms-black transition-colors"
                                >
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-xs text-red-600 font-bold">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-ms-black text-white py-4 rounded-lg font-black text-[11px] uppercase tracking-[0.3em] hover:bg-ms-black/80 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {isLoading ? 'Authenticating...' : 'Access Studio'}
                        </button>
                    </form>

                    <div className="pt-2 border-t border-ms-border">
                        <p className="text-[9px] font-black uppercase tracking-wider text-ms-gray text-center">
                            Access is restricted to authorized studio members only.
                        </p>
                    </div>
                </div>

                <p className="text-center text-[9px] text-white/20 font-black uppercase tracking-widest">
                    STITCH.os © 2026 — Maryam Shahid Studio
                </p>
            </div>
        </div>
    );
}
