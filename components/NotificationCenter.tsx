
"use client"

import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    XCircle,
    Clock,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getNotifications, markNotificationAsRead } from '@/lib/api';
import { AppNotification } from '@/types';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const loadNotifications = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await getNotifications(user.id);
            setNotifications(data);
        } catch (err) {
            console.error('Failed to sync notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            loadNotifications();
            // Optional: Set up real-time listener here if desired
        }
    }, [user?.id]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotifClick = async (notif: AppNotification) => {
        if (!notif.is_read) {
            await markNotificationAsRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        }
        setIsOpen(false);
        if (notif.link) {
            if (notif.link.includes('/unknown/')) {
                // Failsafe for broken notifications generated before the collection ID was passed correctly
                router.push('/collections');
            } else {
                router.push(notif.link);
            }
        }
    };

    const handleClearHistory = async () => {
        if (!user?.id) return;
        try {
            const { supabase } = await import('@/lib/supabase');
            await supabase.from('notifications').delete().eq('user_id', user.id);
            setNotifications([]);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'WARNING': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-full transition-all duration-300",
                    isOpen ? "bg-ms-black text-white" : "text-ms-gray hover:text-ms-black hover:bg-ms-beige/50"
                )}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-ms-border z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-ms-border flex items-center justify-between bg-ms-beige/10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ms-black">Activity Stream</h3>
                        {unreadCount > 0 && (
                            <span className="text-[9px] font-black bg-ms-black text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-ms-border">
                        {isLoading && notifications.length === 0 ? (
                            <div className="p-10 flex flex-col items-center gap-3">
                                <Loader2 className="w-5 h-5 animate-spin text-ms-gray" />
                                <p className="text-[10px] uppercase font-black tracking-widest text-ms-gray">Syncing...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center space-y-2">
                                <Bell className="w-6 h-6 mx-auto text-ms-gray opacity-20" />
                                <p className="text-sm font-serif italic text-ms-gray">Your inbox is quiet.</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleNotifClick(notif)}
                                    className={cn(
                                        "w-full p-5 text-left transition-all hover:bg-ms-beige/20 flex gap-4 group",
                                        !notif.is_read ? "bg-ms-beige/5" : "opacity-60"
                                    )}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <p className={cn("text-xs font-bold leading-tight group-hover:text-ms-black transition-colors", !notif.is_read ? "text-ms-black" : "text-ms-gray")}>
                                                {notif.title}
                                            </p>
                                            <span className="text-[8px] font-black text-ms-gray/40 whitespace-nowrap ml-2">
                                                {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-ms-gray leading-relaxed pr-2">
                                            {notif.content}
                                        </p>
                                        {notif.link && (
                                            <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-ms-black">View Details</span>
                                                <ChevronRight className="w-2.5 h-2.5" />
                                            </div>
                                        )}
                                    </div>
                                    {!notif.is_read && (
                                        <div className="w-1.5 h-1.5 bg-ms-black rounded-full mt-2.5 flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-ms-beige/10 border-t border-ms-border">
                        <button
                            onClick={handleClearHistory}
                            className="w-full py-2.5 text-[9px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black transition-colors text-center"
                        >
                            Clear all history
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
