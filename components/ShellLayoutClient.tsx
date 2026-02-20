
"use client"

import React from 'react';
import { Sidebar, TopBar } from '@/components/Layout';

interface AdminLayoutClientProps {
    children: React.ReactNode;
    role: 'ADMIN' | 'CLIENT';
}

export function ShellLayoutClient({ children, role }: AdminLayoutClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex min-h-screen bg-ms-bg">
            <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar role={role} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 p-4 lg:p-8 pb-16 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
