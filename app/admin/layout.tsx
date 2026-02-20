
"use client"

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Sidebar, TopBar } from '@/components/Layout';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-ms-black flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-ms-bg">
            <Sidebar role="ADMIN" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar role="ADMIN" setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 p-4 lg:p-8 pb-16 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
