
"use client"

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/login'];

export function AppShell({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isPublic = PUBLIC_PATHS.includes(pathname);

    useEffect(() => {
        if (!isLoading) {
            if (!user && !isPublic) {
                router.replace('/login');
            } else if (user && isPublic) {
                // If logged in and on login page, go to root redirector
                router.replace('/');
            }
        }
    }, [user, isLoading, isPublic, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-ms-black flex items-center justify-center">
                <div className="text-center space-y-6 animate-in fade-in duration-500">
                    <h1 className="text-4xl font-black tracking-[0.4em] text-white font-serif italic">STITCH</h1>
                    <Loader2 className="w-6 h-6 animate-spin text-white/30 mx-auto" />
                </div>
            </div>
        );
    }

    // Return children as-is. 
    // Layouts in app/(admin) and app/(client) will provide their own sidebars.
    return <>{children}</>;
}
