
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, User, Layers, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createCollection } from '@/lib/api';

export default function AdminNewCollectionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        async function loadClients() {
            if (!user?.organization_id || user.role !== 'ADMIN') return;
            const { data } = await supabase
                .from('organization_members')
                .select('user_id, role, name, email')
                .eq('organization_id', user.organization_id)
                .eq('role', 'CLIENT');
            setClients(data || []);
        }
        loadClients();
    }, [user?.organization_id]);

    const [form, setForm] = useState({
        name: '',
        client_user_id: '',
        season: '',
        occasion: '',
        drop_type: '',
        complexity_level: 'Standard',
        contract_value: '',
        currency: 'USD',
        start_date: '',
        end_date: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organization_id) return;
        setIsSaving(true);
        setError('');

        try {
            const collection = await createCollection({
                organization_id: user.organization_id,
                name: form.name.trim(),
                season: form.season,
                drop_type: form.drop_type,
                complexity_level: form.complexity_level,
                contract_value: form.contract_value ? Number(form.contract_value) : 0,
                currency: form.currency,
                start_date: form.start_date || undefined,
                end_date: form.end_date || undefined,
                status: 'ACTIVE',
                milestones: [],
                target_margin_pct: 0,
                target_audience: form.occasion,
                price_positioning: form.complexity_level,
            });

            if (!collection) throw new Error('Failed to create collection.');

            if (form.client_user_id) {
                await supabase.from('collection_assignments').insert([{
                    collection_id: collection.id,
                    user_id: form.client_user_id,
                    organization_id: user.organization_id,
                    can_view_costs: false,
                }]);
            }

            router.push(`/admin/collections/${collection.id}`);
        } catch (err: any) {
            setError(err?.message || 'Error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "w-full bg-ms-beige/20 border border-ms-border rounded-xl p-4 text-sm focus:ring-1 focus:ring-ms-black focus:outline-none transition-all";
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-ms-gray mb-1 block";

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <div className="mb-10">
                <Link href="/admin/collections" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black mb-6">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Collections
                </Link>
                <h1 className="text-4xl font-bold text-ms-black font-serif italic tracking-tighter">Initialize Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="ms-card p-8 space-y-6">
                    <div>
                        <label className={labelClass}>Collection Name *</label>
                        <input required className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Winter Bloom 2026" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Season</label>
                            <input className={inputClass} value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} placeholder="e.g. SS26" />
                        </div>
                        <div>
                            <label className={labelClass}>Occasion</label>
                            <input className={inputClass} value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })} placeholder="e.g. Bridal" />
                        </div>
                    </div>
                </div>

                <div className="ms-card p-8 space-y-6">
                    <div>
                        <label className={labelClass}>Assign Client</label>
                        <select className={inputClass} value={form.client_user_id} onChange={e => setForm({ ...form, client_user_id: e.target.value })}>
                            <option value="">Internal Project (No Client)</option>
                            {clients.map(c => <option key={c.user_id} value={c.user_id}>{c.name || c.email}</option>)}
                        </select>
                    </div>
                </div>

                <div className="ms-card p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Contract Value</label>
                            <input type="number" className={inputClass} value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Currency</label>
                            <select className={inputClass} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                                <option value="USD">USD</option>
                                <option value="PKR">PKR</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Start Date</label>
                            <input type="date" className={inputClass} value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Deadline</label>
                            <input type="date" className={inputClass} value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                        </div>
                    </div>
                </div>

                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl">{error}</div>}

                <button disabled={isSaving} className="w-full ms-button-primary bg-ms-black py-5 uppercase tracking-[0.3em] font-black text-[11px] shadow-xl">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Launch Collection'}
                </button>
            </form>
        </div>
    );
}
