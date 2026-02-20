
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Loader2, Lock,
    Layers, Package, CheckCircle2, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { getGarmentDetail, getCollectionDetail } from '@/lib/api';
import { Garment, Collection } from '@/types';

const STAGES = [
    'ILLUSTRATION', 'PATTERN', 'TECH_PACK', 'SAMPLING',
    'PRE_PRODUCTION', 'PRODUCTION', 'QC', 'PACKAGING', 'DELIVERED'
];

export default function ClientGarmentDetailPage({ params }: { params: Promise<{ id: string, garmentId: string }> }) {
    const { id, garmentId } = React.use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [garment, setGarment] = useState<Garment | null>(null);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [g, c] = await Promise.all([
                    getGarmentDetail(garmentId),
                    getCollectionDetail(id)
                ]);
                setGarment(g);
                setCollection(c);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [garmentId, id]);

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>;
    if (!garment) return <div className="p-20 text-center font-serif italic text-ms-gray">Access Denied or Garment Not Found.</div>;

    const currentIdx = STAGES.indexOf(garment.current_stage);

    return (
        <div className="space-y-8 pb-20">
            {/* Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ms-gray">
                    <Link href="/client/collections" className="hover:text-ms-black transition-colors">Collections</Link>
                    <ChevronLeft className="w-3 h-3 rotate-180 opacity-30" />
                    <Link href={`/client/collections/${id}`} className="hover:text-ms-black transition-colors max-w-[100px] truncate">{collection?.name}</Link>
                    <ChevronLeft className="w-3 h-3 rotate-180 opacity-30" />
                    <span className="text-ms-black truncate max-w-[120px]">{garment.name}</span>
                </nav>
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
                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-60">Production Stage</p>
                        <p className="text-lg font-bold text-ms-black font-serif italic mt-1">{garment.current_stage.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>

            {/* Workflow Progress (Read Only) */}
            <div className="ms-card p-8 overflow-x-auto no-scrollbar">
                <div className="flex items-start justify-between min-w-[1000px]">
                    {STAGES.map((stage, i) => {
                        const isPast = i < currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                            <React.Fragment key={stage}>
                                <div className="flex flex-col items-center gap-3 w-28 group">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                        isPast ? "bg-ms-black border-ms-black text-white" :
                                            isCurrent ? "bg-white border-ms-black text-ms-black shadow-lg scale-110" :
                                                "bg-ms-beige/30 border-ms-border text-ms-gray opacity-40"
                                    )}>
                                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : (i + 1)}
                                    </div>
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
                    <div className="ms-card p-10 flex flex-col items-center justify-center text-center space-y-4 h-96 border-dashed bg-ms-beige/5">
                        <Package className="w-12 h-12 text-ms-gray/10" />
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black">Milestone View: {garment.current_stage.replace('_', ' ')}</h3>
                            <p className="text-sm text-ms-gray mt-2 max-w-sm">
                                You are viewing the live production status of this garment.
                                Updates from the studio floor reflect here in real-time.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="ms-card p-8 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-black border-b border-ms-border pb-4">Status</h3>
                        <p className="text-xs text-ms-gray leading-relaxed italic">
                            The studio is currently working on the "{garment.current_stage.replace('_', ' ')}" phase.
                            Approved patterns and tech packs will appear in your File Gallery.
                        </p>
                        {garment.is_locked && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
                                <Lock className="w-4 h-4" />
                                <p className="text-[9px] font-black uppercase tracking-widest">Phase Confirmed by Studio</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
