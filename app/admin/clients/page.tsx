
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Mail, Shield, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminClientsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') router.push('/');
    }, [user, router]);

    useEffect(() => {
        async function load() {
            if (!user?.organization_id || user.role !== 'ADMIN') return;
            const { data } = await supabase
                .from('organization_members')
                .select('*')
                .eq('organization_id', user.organization_id)
                .eq('role', 'CLIENT')
                .order('created_at', { ascending: false });
            setClients(data || []);
            setIsLoading(false);
        }
        if (user) load();
    }, [user?.organization_id]);

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>;

    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-ms-black font-serif italic tracking-tighter">Client Roster</h1>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ms-gray mt-3">
                        {clients.length} client account{clients.length !== 1 ? 's' : ''} registered
                    </p>
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="ms-card p-32 text-center border-dashed border-2">
                    <Users className="w-14 h-14 text-ms-gray/20 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold font-serif italic">No Clients Yet</h3>
                    <p className="text-sm text-ms-gray mt-3">Invite clients via Supabase Auth to onboard them to the portal.</p>
                </div>
            ) : (
                <div className="ms-card overflow-hidden">
                    <div className="divide-y divide-ms-border">
                        {clients.map((c) => (
                            <div key={c.user_id} className="p-6 flex items-center justify-between hover:bg-ms-beige/10 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-ms-black text-white flex items-center justify-center text-sm font-black">
                                        {(c.name || c.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-ms-black">{c.name || 'Unnamed Client'}</p>
                                        <p className="text-[10px] text-ms-gray font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3" /> {c.email || c.user_id}
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-blue-100 flex items-center gap-1.5">
                                    <Shield className="w-3 h-3" /> Client
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
