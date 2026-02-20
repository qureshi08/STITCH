
"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, Lock, Unlock, Trash2, Loader2, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createGarment, deleteGarment } from '@/lib/api';
import { Garment, GarmentStage } from '@/types';

const STAGE_ORDER: GarmentStage[] = [
    'ILLUSTRATION', 'PATTERN', 'TECH_PACK', 'SAMPLING',
    'PRE_PRODUCTION', 'PRODUCTION', 'QC', 'PACKAGING', 'DELIVERED'
];

const STAGE_COLOR: Record<string, string> = {
    ILLUSTRATION: 'bg-purple-50 text-purple-700 border-purple-100',
    PATTERN: 'bg-blue-50 text-blue-700 border-blue-100',
    TECH_PACK: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    SAMPLING: 'bg-orange-50 text-orange-700 border-orange-100',
    PRE_PRODUCTION: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    PRODUCTION: 'bg-green-50 text-green-700 border-green-100',
    QC: 'bg-red-50 text-red-700 border-red-100',
    PACKAGING: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    DELIVERED: 'bg-ms-black text-white border-ms-black',
};

interface GarmentListProps {
    collectionId: string;
    garments: Garment[];
    onRefresh: () => void;
    canEdit: boolean;
    orgId: string;
}

export function GarmentList({ collectionId, garments, onRefresh, canEdit, orgId }: GarmentListProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ name: '', sku: '', category: '' });
    const [error, setError] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.sku) { setError('Name and SKU are required.'); return; }
        setError('');
        setIsSaving(true);
        const result = await createGarment({
            collection_id: collectionId,
            organization_id: orgId,
            name: form.name.trim(),
            sku: form.sku.trim().toUpperCase(),
            category: form.category,
            current_stage: 'ILLUSTRATION',
            is_locked: false,
            measurement_table: {},
            bom_data: [],
        });
        setIsSaving(false);
        if (result) {
            setForm({ name: '', sku: '', category: '' });
            setIsAdding(false);
            onRefresh();
        } else {
            setError('Failed to create garment. Is the SKU unique?');
        }
    };

    const handleDelete = async (g: Garment) => {
        if (!confirm(`Delete "${g.name}" (${g.sku})? This cannot be undone.`)) return;
        await deleteGarment(g.id);
        onRefresh();
    };

    const stageIdx = (g: Garment) => STAGE_ORDER.indexOf(g.current_stage);

    return (
        <div className="space-y-6">
            {/* Add Garment */}
            {canEdit && (
                <>
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-ms-border rounded-xl text-[10px] font-black uppercase tracking-widest text-ms-gray hover:border-ms-black hover:text-ms-black transition-all w-full justify-center"
                        >
                            <Plus className="w-4 h-4" />
                            Add Garment / SKU
                        </button>
                    ) : (
                        <form onSubmit={handleAdd} className="ms-card p-8 space-y-5 border-ms-black animate-in fade-in duration-200">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">New Garment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Garment Name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Midnight Wrap Dress"
                                        className="w-full border border-ms-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">SKU Code *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. MWD-001"
                                        className="w-full border border-ms-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black font-mono uppercase"
                                        value={form.sku}
                                        onChange={e => setForm({ ...form, sku: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Category</label>
                                    <select
                                        className="w-full border border-ms-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option>Dress</option>
                                        <option>Gown</option>
                                        <option>Blouse / Top</option>
                                        <option>Trouser / Pant</option>
                                        <option>Skirt</option>
                                        <option>Jacket / Outerwear</option>
                                        <option>Co-ord Set</option>
                                        <option>Lehenga</option>
                                        <option>Suit</option>
                                        <option>Accessory</option>
                                    </select>
                                </div>
                            </div>
                            {error && <p className="text-xs font-bold text-red-600">{error}</p>}
                            <div className="flex gap-3">
                                <button type="submit" disabled={isSaving} className="ms-button-primary bg-ms-black flex items-center gap-2 text-[10px] font-black uppercase px-8">
                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                    Add Garment
                                </button>
                                <button type="button" onClick={() => { setIsAdding(false); setError(''); }} className="ms-button-secondary text-[10px] font-black uppercase px-6">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}

            {/* Garment Cards */}
            {garments.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-ms-border rounded-2xl bg-ms-beige/5">
                    <Scissors className="w-12 h-12 text-ms-gray/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold font-serif italic text-ms-black">No Garments Yet</h3>
                    <p className="text-sm text-ms-gray mt-2 max-w-sm mx-auto">Add garments to begin the PLM cycle for each piece in this collection.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {garments.map(g => {
                        const progress = Math.round((stageIdx(g) / (STAGE_ORDER.length - 1)) * 100);
                        return (
                            <div key={g.id} className="ms-card hover:border-ms-black/30 transition-all group">
                                <div className="p-6 flex items-center gap-6">
                                    {/* Progress bar as left accent */}
                                    <div className="w-1 self-stretch bg-ms-beige rounded-full overflow-hidden flex-shrink-0">
                                        <div
                                            className="w-full bg-ms-black rounded-full transition-all"
                                            style={{ height: `${progress}%` }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[9px] font-black font-mono uppercase tracking-widest text-ms-gray bg-ms-beige px-2 py-0.5 rounded">
                                                {g.sku}
                                            </span>
                                            {g.category && (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-50">{g.category}</span>
                                            )}
                                            {g.is_locked && (
                                                <span title="Stage locked"><Lock className="w-3 h-3 text-ms-gray" /></span>
                                            )}
                                        </div>
                                        <h4 className="text-base font-bold text-ms-black">{g.name}</h4>

                                        {/* Stage pipeline mini */}
                                        <div className="flex items-center gap-1 mt-3">
                                            {STAGE_ORDER.map((stage, i) => (
                                                <div
                                                    key={stage}
                                                    className={cn(
                                                        "h-1.5 flex-1 rounded-full transition-all",
                                                        i < stageIdx(g) ? "bg-ms-black" :
                                                            i === stageIdx(g) ? "bg-ms-black/40" :
                                                                "bg-ms-beige"
                                                    )}
                                                    title={stage}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stage badge */}
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border flex-shrink-0",
                                        STAGE_COLOR[g.current_stage]
                                    )}>
                                        {g.current_stage.replace('_', ' ')}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link
                                            href={`/collections/${g.collection_id}/garments/${g.id}`}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-ms-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-ms-black/80 transition-colors"
                                        >
                                            Manage
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                        {canEdit && (
                                            <button
                                                onClick={() => handleDelete(g)}
                                                className="p-2 text-ms-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete garment"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
