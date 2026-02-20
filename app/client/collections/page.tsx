
"use client"

import React, { useEffect, useState } from 'react';
import { Search, Package, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { getCollections } from '@/lib/api';
import { Collection } from '@/types';
import { useRouter } from 'next/navigation';

export default function ClientCollectionsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user && user.role !== 'CLIENT') {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        async function load() {
            if (!user?.organization_id || user.role !== 'CLIENT') return;
            try {
                const data = await getCollections(user.organization_id, user.role, user.id);
                setCollections(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [user?.organization_id]);

    const filtered = collections.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.season || '').toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>;

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-4xl font-bold text-ms-black font-serif italic tracking-tighter">My Collections</h1>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ms-gray mt-3">
                    Active fashion lifecycles being produced for you at Maryam Shahid Studio
                </p>
            </div>

            <div className="relative max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ms-gray" />
                <input
                    type="text"
                    placeholder="Search your projects..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-ms-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black transition-all shadow-sm"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="ms-card p-32 text-center border-dashed border-2 bg-ms-beige/5">
                    <Package className="w-14 h-14 text-ms-gray/20 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold font-serif italic text-ms-black">No Assignments Found</h3>
                    <p className="text-sm text-ms-gray mt-2">Projects shared with you by the studio will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((c) => (
                        <Link key={c.id} href={`/client/collections/${c.id}`} className="group block">
                            <div className="ms-card h-full flex flex-col group-hover:border-ms-black transition-all duration-200 group-hover:shadow-lg">
                                <div className="p-7 flex-1 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border bg-blue-50 text-blue-700">
                                            {c.status}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-ms-gray bg-ms-beige px-2 py-1 rounded">
                                            {c.season}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-ms-black font-serif italic group-hover:underline underline-offset-4 leading-tight">{c.name}</h3>
                                    <div className="pt-2 border-t border-ms-border">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-50">Studio Access</p>
                                        <p className="text-[10px] font-black uppercase text-ms-black mt-1">Live Tracking Enabled</p>
                                    </div>
                                </div>
                                <div className="px-7 py-4 bg-ms-beige/20 border-t border-ms-border flex items-center justify-between font-black uppercase tracking-widest text-[9px] text-ms-gray opacity-40 group-hover:opacity-100 italic transition-opacity">
                                    <span>Project Entry: {new Date(c.created_at).toLocaleDateString()}</span>
                                    <span>Open Portal →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
