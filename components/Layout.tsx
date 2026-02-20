
"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Layers,
    DollarSign,
    Settings,
    PlusCircle,
    Bell,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { NotificationCenter } from './NotificationCenter';

const adminNav = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Layers, label: 'Collections', href: '/admin/collections' },
    { icon: Users, label: 'Clients', href: '/admin/clients' },
    { icon: DollarSign, label: 'Finance', href: '/admin/finance' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

const clientNav = [
    { icon: LayoutDashboard, label: 'My Portal', href: '/client/dashboard' },
    { icon: Layers, label: 'My Collections', href: '/client/collections' },
    { icon: DollarSign, label: 'Invoices', href: '/client/invoices' },
];

interface NavProps {
    role: 'ADMIN' | 'CLIENT';
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
}

export function Sidebar({ role, isOpen, setIsOpen }: NavProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const items = role === 'ADMIN' ? adminNav : clientNav;

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const sidebarClasses = cn(
        "flex flex-col h-screen border-r border-ms-border bg-white fixed lg:sticky top-0 z-[60] overflow-y-auto w-64 flex-shrink-0 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] lg:hidden"
                    onClick={() => setIsOpen?.(false)}
                />
            )}

            <aside className={sidebarClasses}>
                {/* Logo */}
                <div className="px-6 py-7 border-b border-ms-border flex items-center justify-between gap-3">
                    <Link
                        href={role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'}
                        className="block"
                        onClick={() => setIsOpen?.(false)}
                    >
                        <h1 className="text-2xl font-black tracking-[0.3em] text-ms-black font-serif uppercase">Stitch</h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-ms-gray mt-0.5 opacity-40">Fashion OS</p>
                    </Link>
                    <button className="lg:hidden p-2 text-ms-gray" onClick={() => setIsOpen?.(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-6 px-4 space-y-1">
                    {items.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen?.(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                                    isActive
                                        ? "bg-ms-black text-white shadow-sm"
                                        : "text-ms-gray hover:text-ms-black hover:bg-ms-beige"
                                )}
                            >
                                <item.icon className="w-4 h-4 flex-shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-ms-border space-y-3">
                    {role === 'ADMIN' && (
                        <Link
                            href="/admin/collections/new"
                            onClick={() => setIsOpen?.(false)}
                            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-[10px] font-black uppercase tracking-widest bg-ms-black text-white rounded-lg hover:bg-ms-black/80 transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            New Collection
                        </Link>
                    )}

                    {/* User card */}
                    <div className="flex items-center gap-3 px-3 py-3 bg-ms-beige rounded-lg">
                        <div className="w-9 h-9 rounded-full bg-ms-black text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">
                            {user?.name?.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('') || 'MS'}
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                            <p className="text-[10px] font-black text-ms-black truncate">{user?.name}</p>
                            <p className="text-[8px] text-ms-gray uppercase font-black tracking-widest mt-0.5">{role}</p>
                        </div>
                        <button onClick={handleLogout} title="Sign out" className="text-ms-gray hover:text-red-500 transition-colors p-1">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export function TopBar({ role, setIsOpen }: NavProps) {
    const { user } = useAuth();

    return (
        <header className="h-16 border-b border-ms-border bg-white sticky top-0 z-[40] px-4 lg:px-8 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
                <button
                    className="lg:hidden p-2 -ml-2 text-ms-black"
                    onClick={() => setIsOpen?.(true)}
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden sm:flex items-center gap-3">
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        role === 'ADMIN' ? "bg-green-500" : "bg-blue-400"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ms-black">
                        {role === 'ADMIN' ? 'Owner Access' : 'Client Portal'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <NotificationCenter />
                <div className="h-5 w-px bg-ms-border hidden sm:block" />
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-ms-black text-white flex items-center justify-center text-[9px] font-black">
                        {user?.name?.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('') || '??'}
                    </div>
                    <span className="hidden sm:inline text-[11px] font-bold text-ms-black font-serif italic truncate max-w-[120px]">{user?.name}</span>
                </div>
            </div>
        </header>
    );
}

