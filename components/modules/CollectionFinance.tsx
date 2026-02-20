
"use client"

import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    CreditCard,
    Target,
    PieChart,
    Calendar,
    AlertCircle,
    ArrowRight,
    Loader2,
    Save,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collection, ClientInvoice } from '@/types';
import { getCollectionMilestones, updateCollection, createClientInvoice } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
    collection: Collection;
}

export function CollectionFinance({ collection }: Props) {
    const router = useRouter();
    const [milestones, setMilestones] = useState<ClientInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        contract_value: collection.contract_value || 0,
        target_margin_pct: collection.target_margin_pct || 60,
    });

    const [newMilestone, setNewMilestone] = useState({
        name: '',
        pct: 25,
        due: ''
    });
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);

    useEffect(() => {
        async function loadMilestones() {
            try {
                const data = await getCollectionMilestones(collection.id);
                setMilestones(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        loadMilestones();
    }, [collection.id]);

    const handleSaveGlobal = async () => {
        setIsSaving(true);
        try {
            await updateCollection(collection.id, formData);
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const amount = (formData.contract_value * newMilestone.pct) / 100;
            await createClientInvoice({
                collection_id: collection.id,
                organization_id: collection.organization_id,
                milestone_name: newMilestone.name,
                amount: amount,
                due_date: newMilestone.due,
                status: 'UNPAID',
                is_visible_to_client: true
            });
            const updated = await getCollectionMilestones(collection.id);
            setMilestones(updated);
            setIsAddingMilestone(false);
            setNewMilestone({ name: '', pct: 25, due: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const paidAmount = milestones.filter(m => m.status === 'PAID').reduce((sum, m) => Number(sum) + Number(m.amount), 0);

    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-ms-black font-serif italic underline decoration-ms-border underline-offset-8">Financial Engineering</h3>
                <button
                    onClick={handleSaveGlobal}
                    disabled={isSaving}
                    className="ms-button-primary bg-ms-black border-ms-black text-[10px] font-black uppercase px-8"
                >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                    Commit Global Targets
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="ms-card p-8 space-y-4 bg-ms-beige/20">
                    <h4 className="text-[10px] font-black uppercase text-ms-gray tracking-[0.2em] flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Contract Value
                    </h4>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ms-gray text-xs font-mono">$</span>
                        <input
                            type="number"
                            value={formData.contract_value}
                            onChange={e => setFormData({ ...formData, contract_value: Number(e.target.value) })}
                            className="w-full bg-white border border-ms-border rounded-lg p-4 pl-10 text-xl font-serif font-bold text-ms-black focus:outline-none focus:ring-1 focus:ring-ms-black transition-all"
                        />
                    </div>
                </div>

                <div className="ms-card p-8 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-ms-gray tracking-[0.2em] flex items-center gap-2">
                        <Target className="w-3 h-3" /> Target Profit %
                    </h4>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.target_margin_pct}
                            onChange={e => setFormData({ ...formData, target_margin_pct: Number(e.target.value) })}
                            className="w-full bg-white border border-ms-border rounded-lg p-4 text-xl font-serif font-bold text-ms-black focus:outline-none focus:ring-1 focus:ring-ms-black transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ms-gray text-xs font-mono">%</span>
                    </div>
                </div>

                <div className="ms-card p-8 space-y-4 bg-ms-black text-white border-ms-black">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Projected Retained Profit</h4>
                    <p className="text-3xl font-bold font-serif italic">${((formData.contract_value * formData.target_margin_pct) / 100).toLocaleString()}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-2">After core production costs</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase text-ms-gray tracking-[0.3em]">Client Payment Milestones</h4>
                    {!isAddingMilestone && (
                        <button
                            onClick={() => setIsAddingMilestone(true)}
                            className="text-[10px] font-black uppercase text-ms-black border-b border-ms-black"
                        >
                            + Add Milestone
                        </button>
                    )}
                </div>

                {isAddingMilestone && (
                    <form onSubmit={handleAddMilestone} className="ms-card p-6 bg-ms-beige/30 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95">
                        <input
                            placeholder="Milestone Name"
                            className="bg-white border rounded p-2 text-xs"
                            required
                            value={newMilestone.name}
                            onChange={e => setNewMilestone({ ...newMilestone, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="% Value"
                            className="bg-white border rounded p-2 text-xs"
                            required
                            value={newMilestone.pct}
                            onChange={e => setNewMilestone({ ...newMilestone, pct: Number(e.target.value) })}
                        />
                        <input
                            type="date"
                            className="bg-white border rounded p-2 text-xs"
                            required
                            value={newMilestone.due}
                            onChange={e => setNewMilestone({ ...newMilestone, due: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <button type="submit" disabled={isSaving} className="flex-1 bg-ms-black text-white text-[10px] font-black uppercase rounded">Save</button>
                            <button type="button" onClick={() => setIsAddingMilestone(false)} className="px-4 text-[10px] font-black uppercase">Cancel</button>
                        </div>
                    </form>
                )}

                <div className="ms-card overflow-hidden border-ms-border">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-ms-gray" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-40">Accessing Ledgers...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-ms-beige/20 border-b border-ms-border">
                                <tr>
                                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest">Milestone Entity</th>
                                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-center">Weight (%)</th>
                                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest font-mono">Projected Value</th>
                                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest">Due Date</th>
                                    <th className="py-4 px-8 text-[10px] font-black uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ms-border">
                                {milestones.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-ms-gray font-serif italic opacity-40">No milestones established for this collection.</td>
                                    </tr>
                                ) : (
                                    milestones.map((row, i) => (
                                        <tr key={i} className="hover:bg-ms-beige/5 transition-colors">
                                            <td className="py-6 px-8 font-bold text-ms-black font-serif italic text-sm">{row.milestone_name}</td>
                                            <td className="py-6 px-8 text-center text-ms-gray font-mono">{((Number(row.amount) / formData.contract_value) * 100).toFixed(0)}%</td>
                                            <td className="py-6 px-8 font-bold text-ms-black font-mono text-xs underline decoration-ms-border decoration-mt-1 underline-offset-4">${Number(row.amount).toLocaleString()}</td>
                                            <td className="py-6 px-8 text-ms-gray uppercase text-[10px] font-black">{new Date(row.due_date).toLocaleDateString()}</td>
                                            <td className="py-6 px-8 text-right">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded inline-block",
                                                    row.status === 'PAID' ? "bg-green-500 text-white" :
                                                        row.status === 'OVERDUE' ? "bg-red-500 text-white" : "bg-ms-beige text-ms-gray border border-ms-border"
                                                )}>{row.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="ms-card p-10 bg-ms-beige/10 border-ms-black border-2 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-ms-black text-white rounded-full flex items-center justify-center shadow-2xl">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold font-serif italic tracking-tighter text-ms-black">${(formData.contract_value - paidAmount).toLocaleString()}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-gray mt-2">Active Accounts Receivable Pipeline</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-ms-black">Live Bank link active</span>
                    </div>
                    <button
                        className="ms-button-primary bg-ms-black border-ms-black px-10"
                    >
                        Initiate Batch Invoicing
                    </button>
                </div>
            </div>
        </div>
    );
}
