
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Loader2, Plus, Lock, Unlock, CheckCircle2,
    Layers, Scissors, DollarSign, FileText, MessageCircle,
    AlertCircle, Calendar, Package, ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import {
    getCollectionDetail, getCollectionGarments, updateCollection
} from '@/lib/api';
import { Collection, Garment } from '@/types';
import { FileGallery } from '@/components/FileGallery';
import { CommentThread } from '@/components/CommentThread';
import { GarmentList } from '@/components/GarmentList';
import { CollectionFinanceTab } from '@/components/CollectionFinanceTab';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'garments', label: 'Garments (PLM)', icon: Scissors },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
];

export default function AdminCollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [garments, setGarments] = useState<Garment[]>([]);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    async function loadData() {
        if (user?.role !== 'ADMIN') return;
        try {
            const [col, garms] = await Promise.all([
                getCollectionDetail(id),
                getCollectionGarments(id)
            ]);
            setCollection(col);
            setGarments(garms);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => { loadData(); }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        if (!collection) return;
        setIsUpdating(true);
        const ok = await updateCollection(collection.id, { status: newStatus });
        if (ok) setCollection({ ...collection, status: newStatus });
        setIsUpdating(false);
    };

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>;

    if (!collection) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-ms-gray/20 mb-4" />
                <h2 className="text-xl font-bold font-serif">Collection Not Found</h2>
                <Link href="/admin/collections" className="text-ms-black underline mt-4 text-sm font-bold uppercase tracking-widest">Back to Collections</Link>
            </div>
        );
    }

    const completedStages = garments.filter(g => g.current_stage === 'DELIVERED').length;
    const daysLeft = collection.end_date
        ? Math.ceil((new Date(collection.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className="space-y-0 pb-20">
            <div className="mb-8">
                <Link href="/admin/collections" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black mb-5">
                    <ChevronLeft className="w-3.5 h-3.5" /> Collections
                </Link>

                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="bg-ms-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                                {collection.status}
                            </span>
                            <span className="bg-ms-beige text-ms-gray text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                                {collection.season}
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-ms-black font-serif italic tracking-tighter">{collection.name}</h1>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => handleStatusChange(collection.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE')}
                            disabled={isUpdating}
                            className="bg-ms-black text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-lg hover:bg-ms-black/80 transition-all disabled:opacity-50 w-full sm:w-auto text-center"
                        >
                            {collection.status === 'ACTIVE' ? 'Complete Collection' : 'Reactivate'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Contract Value', value: `${collection.currency} ${Number(collection.contract_value).toLocaleString()}` },
                        { label: 'Garments', value: garments.length.toString(), sub: `${completedStages} delivered` },
                        { label: 'Deadline', value: collection.end_date ? new Date(collection.end_date).toLocaleDateString() : 'None', sub: daysLeft != null ? `${daysLeft} days remaining` : '' },
                        { label: 'Pricing', value: collection.price_positioning || '—' },
                    ].map((s, i) => (
                        <div key={i} className="ms-card p-5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-60">{s.label}</p>
                            <p className="text-lg font-bold text-ms-black font-serif mt-1">{s.value}</p>
                            {s.sub && <p className="text-[9px] text-ms-gray opacity-40 mt-1 font-bold italic">{s.sub}</p>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-b border-ms-border sticky top-16 bg-ms-bg/80 backdrop-blur-md z-10 -mx-4 lg:mx-0 px-4">
                <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] border-b-2 transition-all whitespace-nowrap",
                                activeTab === tab.id ? "border-ms-black text-ms-black" : "border-transparent text-ms-gray"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-8 px-0 sm:px-0">
                {activeTab === 'overview' && <CollectionOverview collection={collection} garments={garments} />}
                {activeTab === 'garments' && <GarmentList collectionId={id} garments={garments} onRefresh={loadData} canEdit={true} orgId={user?.organization_id || ''} />}
                {activeTab === 'finance' && <CollectionFinanceTab collection={collection} onUpdate={loadData} />}
                {activeTab === 'files' && <FileGallery entityType="collection" entityId={id} canUpload={true} />}
                {activeTab === 'comments' && <CommentThread entityType="collection" entityId={id} />}
            </div>
        </div>

    );
}

function CollectionOverview({ collection, garments }: { collection: Collection, garments: Garment[] }) {
    const stageCount: Record<string, number> = {};
    garments.forEach(g => { stageCount[g.current_stage] = (stageCount[g.current_stage] || 0) + 1; });
    const stages = ['ILLUSTRATION', 'PATTERN', 'TECH_PACK', 'SAMPLING', 'PRE_PRODUCTION', 'PRODUCTION', 'QC', 'PACKAGING', 'DELIVERED'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="ms-card p-5 sm:p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-black mb-6">Stage Pipeline</h3>
                    <div className="space-y-4">
                        {stages.map(stage => {
                            const count = stageCount[stage] || 0;
                            const pct = garments.length > 0 ? (count / garments.length) * 100 : 0;
                            return (
                                <div key={stage} className={cn("flex items-center gap-3 sm:gap-4", count === 0 ? "opacity-30" : "")}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray w-20 sm:w-28 truncate">{stage.replace('_', ' ')}</p>
                                    <div className="flex-1 h-1.5 bg-ms-beige rounded-full overflow-hidden">
                                        <div className="h-full bg-ms-black transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className="text-[10px] font-black text-ms-black w-6 text-right">{count}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="ms-card p-6 sm:p-8 space-y-5 h-fit">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-black border-b border-ms-border pb-4">Metadata</h3>
                {[
                    { label: 'Drop Type', value: collection.drop_type || '—' },
                    { label: 'Price Positioning', value: collection.price_positioning || '—' },
                    { label: 'Main Fabric', value: collection.fabric_brief || '—' },
                    { label: 'Target Audience', value: collection.target_audience || '—' },
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center gap-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-60 flex-shrink-0">{item.label}</p>
                        <p className="text-[10px] font-bold text-ms-black text-right truncate">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

