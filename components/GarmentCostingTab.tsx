
"use client"

import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Loader2, Trash2, PieChart, TrendingUp, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCostEntries, saveCostEntry, deleteCostEntry } from '@/lib/api';
import { Garment, CostCenter } from '@/types';
import { useAuth } from '@/lib/auth';

interface GarmentCostingTabProps {
    garment: Garment;
    onUpdate: () => void;
}

const CATEGORIES = ['Fabric', 'Trims / Buttons', 'Labor / Tailoring', 'Embroidery / Handwork', 'Pattern / Grading', 'Packaging', 'Other'];

export function GarmentCostingTab({ garment, onUpdate }: GarmentCostingTabProps) {
    const { user } = useAuth();
    const [entries, setEntries] = useState<CostCenter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newEntry, setNewEntry] = useState({ category: 'Fabric', estimated_cost: '', actual_cost: '', notes: '' });

    const load = async () => {
        const data = await getCostEntries(garment.id);
        setEntries(data);
        setIsLoading(false);
    };

    useEffect(() => { load(); }, [garment.id]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const generateUUID = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        await saveCostEntry({
            id: generateUUID(),
            garment_id: garment.id,
            organization_id: garment.organization_id,
            category: newEntry.category,
            estimated_cost: Number(newEntry.estimated_cost) || 0,
            actual_cost: Number(newEntry.actual_cost) || 0,
            notes: newEntry.notes
        });
        setNewEntry({ category: 'Fabric', estimated_cost: '', actual_cost: '', notes: '' });
        load();
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this cost entry?')) return;
        await deleteCostEntry(id);
        load();
    };

    const totalEstimated = entries.reduce((s, e) => s + Number(e.estimated_cost), 0);
    const totalActual = entries.reduce((s, e) => s + Number(e.actual_cost), 0);

    if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="ms-card p-6 border-ms-black/10 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-ms-beige flex items-center justify-center text-ms-black">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-60">Total Estimated Cost</p>
                        <p className="text-2xl font-bold font-serif italic text-ms-black mt-1">${totalEstimated.toLocaleString()}</p>
                    </div>
                </div>
                <div className="ms-card p-6 bg-ms-black text-white flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Actual Cost</p>
                        <p className="text-2xl font-bold font-serif italic mt-1">${totalActual.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="ms-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-ms-beige/30 border-b border-ms-border">
                            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-ms-gray">Category</th>
                            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-ms-gray text-right">Estimated ($)</th>
                            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-ms-gray text-right">Actual ($)</th>
                            <th className="p-5 text-[10px] font-black uppercase tracking-widest text-ms-gray">Notes</th>
                            <th className="p-5 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ms-border/50">
                        {entries.map(entry => (
                            <tr key={entry.id} className="hover:bg-ms-beige/10 transition-colors">
                                <td className="p-5 text-sm font-bold text-ms-black">{entry.category}</td>
                                <td className="p-5 text-sm font-mono text-ms-gray text-right">${Number(entry.estimated_cost).toLocaleString()}</td>
                                <td className="p-5 text-sm font-mono font-bold text-ms-black text-right">${Number(entry.actual_cost).toLocaleString()}</td>
                                <td className="p-5 text-xs text-ms-gray opacity-60 italic">{entry.notes || '—'}</td>
                                <td className="p-5">
                                    <button onClick={() => handleDelete(entry.id)} className="p-2 text-ms-gray hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* New Entry Row */}
                        <tr className="bg-ms-beige/10">
                            <td className="p-3">
                                <select className="w-full bg-transparent border-none text-sm font-bold p-2 focus:ring-0" value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </td>
                            <td className="p-3">
                                <input type="number" placeholder="0.00" className="w-full bg-transparent border-none text-sm text-right p-2 focus:ring-0 font-mono" value={newEntry.estimated_cost} onChange={e => setNewEntry({ ...newEntry, estimated_cost: e.target.value })} />
                            </td>
                            <td className="p-3">
                                <input type="number" placeholder="0.00" className="w-full bg-transparent border-none text-sm font-bold text-right p-2 focus:ring-0 font-mono" value={newEntry.actual_cost} onChange={e => setNewEntry({ ...newEntry, actual_cost: e.target.value })} />
                            </td>
                            <td className="p-3">
                                <input type="text" placeholder="Add note..." className="w-full bg-transparent border-none text-xs p-2 focus:ring-0" value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} />
                            </td>
                            <td className="p-3">
                                <button onClick={handleAdd} disabled={isSaving} className="w-8 h-8 rounded-lg bg-ms-black text-white flex items-center justify-center hover:bg-ms-black/80 disabled:opacity-50">
                                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Variance Alert */}
            {totalActual > totalEstimated && totalEstimated > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3">
                    <PieChart className="w-5 h-5 text-orange-600" />
                    <p className="text-xs font-bold text-orange-700">
                        Warning: Actual costs have exceeded estimated budget by ${(totalActual - totalEstimated).toLocaleString()}.
                    </p>
                </div>
            )}
        </div>
    );
}
