
"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Lock, Unlock,
    Layers, CheckCircle2, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Garment, Collection, User } from '@/types';
import { updateGarment } from '@/lib/api';

const STAGES = [
    'ILLUSTRATION', 'PATTERN', 'TECH_PACK', 'SAMPLING',
    'PRE_PRODUCTION', 'PRODUCTION', 'QC', 'PACKAGING', 'DELIVERED'
];

interface GarmentDetailClientProps {
    id: string;
    garmentId: string;
    initialGarment: Garment;
    initialCollection: Collection | null;
    user: User;
}

export function GarmentDetailClient({ id, garmentId, initialGarment, initialCollection, user }: GarmentDetailClientProps) {
    const [garment, setGarment] = useState<Garment>(initialGarment);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStageChange = async (newStage: string) => {
        setIsUpdating(true);
        const ok = await updateGarment(garment.id, { current_stage: newStage as any });
        if (ok) setGarment({ ...garment, current_stage: newStage as any });
        setIsUpdating(false);
    };

    const toggleLock = async () => {
        setIsUpdating(true);
        const ok = await updateGarment(garment.id, { is_locked: !garment.is_locked });
        if (ok) setGarment({ ...garment, is_locked: !garment.is_locked });
        setIsUpdating(false);
    };

    const currentIdx = STAGES.indexOf(garment.current_stage);

    return (
        <div className="space-y-8 pb-20">
            {/* Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ms-gray">
                    <Link href="/admin/collections" className="hover:text-ms-black transition-colors">Collections</Link>
                    <ChevronLeft className="w-3 h-3 rotate-180 opacity-30" />
                    <Link href={`/admin/collections/${id}`} className="hover:text-ms-black transition-colors max-w-[100px] truncate">{initialCollection?.name}</Link>
                    <ChevronLeft className="w-3 h-3 rotate-180 opacity-30" />
                    <span className="text-ms-black truncate max-w-[120px]">{garment.name}</span>
                </nav>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleLock}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            garment.is_locked ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                        )}
                    >
                        {garment.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {garment.is_locked ? 'Stage Locked' : 'Stage Unlocked'}
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-ms-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                            {garment.sku}
                        </span>
                        {garment.category && (
                            <span className="bg-ms-beige text-ms-gray text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                                {garment.category}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-ms-black font-serif italic tracking-tighter">{garment.name}</h1>
                </div>

                <div className="ms-card p-6 bg-ms-beige/20 border-ms-black/5 flex items-center gap-8">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-60">Current Phase</p>
                        <p className="text-lg font-bold text-ms-black font-serif italic mt-1">{garment.current_stage.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>

            {/* Workflow Progress */}
            <div className="ms-card p-8 overflow-x-auto no-scrollbar">
                <div className="flex items-start justify-between min-w-[1000px]">
                    {STAGES.map((stage, i) => {
                        const isPast = i < currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                            <React.Fragment key={stage}>
                                <div className="flex flex-col items-center gap-3 w-28 group">
                                    <button
                                        disabled={isUpdating || garment.is_locked || user?.role !== 'ADMIN'}
                                        onClick={() => handleStageChange(stage)}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                            isPast ? "bg-ms-black border-ms-black text-white" :
                                                isCurrent ? "bg-white border-ms-black text-ms-black shadow-lg scale-110" :
                                                    "bg-ms-beige/30 border-ms-border text-ms-gray opacity-40"
                                        )}
                                    >
                                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : (i + 1)}
                                    </button>
                                    <p className={cn(
                                        "text-[8px] font-black uppercase tracking-widest text-center",
                                        isCurrent ? "text-ms-black" : "text-ms-gray opacity-40"
                                    )}>
                                        {stage.replace('_', ' ')}
                                    </p>
                                </div>
                                {i < STAGES.length - 1 && (
                                    <div className={cn(
                                        "h-[2px] w-full mt-5 transition-all",
                                        i < currentIdx ? "bg-ms-black" : "bg-ms-border opacity-20"
                                    )} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* PLM Content Placeholder */}
                    <div className="ms-card p-10 flex flex-col items-center justify-center text-center space-y-4 h-96 border-dashed bg-ms-beige/5">
                        <Layers className="w-12 h-12 text-ms-gray/10" />
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black">Technical Gate: {garment.current_stage.replace('_', ' ')}</h3>
                            <p className="text-sm text-ms-gray mt-2 max-w-sm">
                                Detailed technical specifications, pattern uploads, and quality control logs for this phase are managed in the PLM module.
                            </p>
                        </div>
                        <button className="ms-button-secondary text-[9px] font-black uppercase py-2 px-6">Access Technical Stack</button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="ms-card p-8 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-black border-b border-ms-border pb-4 flex items-center gap-2">
                            <History className="w-4 h-4" /> Snapshot
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Category', value: garment.category || 'Not set' },
                                { label: 'Created', value: new Date(garment.created_at || '').toLocaleDateString() },
                                { label: 'Last Update', value: garment.updated_at ? new Date(garment.updated_at).toLocaleDateString() : 'Never' },
                                { label: 'Org Context', value: user?.organization_id?.substring(0, 8) || '...' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-60">{item.label}</p>
                                    <p className="text-[10px] font-bold text-ms-black">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
