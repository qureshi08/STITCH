
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft, Loader2, Layers, Scissors, DollarSign,
    FileText, MessageCircle, AlertCircle, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import {
    getCollectionDetail, getCollectionGarments
} from '@/lib/api';
import { Collection, Garment } from '@/types';
import { FileGallery } from '@/components/FileGallery';
import { CommentThread } from '@/components/CommentThread';
import { GarmentList } from '@/components/GarmentList';
import { CollectionFinanceTab } from '@/components/CollectionFinanceTab';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'garments', label: 'Progress', icon: Scissors },
    { id: 'finance', label: 'Invoices', icon: DollarSign },
    { id: 'files', label: 'Design Shared', icon: FileText },
    { id: 'comments', label: 'Discussion', icon: MessageCircle },
];

export default function ClientCollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [garments, setGarments] = useState<Garment[]>([]);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'CLIENT') {
            router.push('/');
        }
    }, [user, router]);

    async function loadData() {
        if (user?.role !== 'CLIENT') return;
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

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>;

    if (!collection) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-ms-gray/20 mb-4" />
                <h2 className="text-xl font-bold font-serif">Project Not Accessible</h2>
                <Link href="/client/collections" className="text-ms-black underline mt-4 text-sm font-bold uppercase tracking-widest">Back to Projects</Link>
            </div>
        );
    }

    const completedStages = garments.filter(g => g.current_stage === 'DELIVERED').length;

    return (
        <div className="space-y-0 pb-20">
            <div className="mb-10">
                <Link href="/client/collections" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black mb-6">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to My Projects
                </Link>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                            {collection.status}
                        </span>
                        <span className="bg-ms-beige text-ms-gray text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                            {collection.season}
                        </span>
                    </div>
                    <h1 className="text-5xl font-bold text-ms-black font-serif italic tracking-tighter">{collection.name}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <div className="ms-card p-6 border-ms-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-60">Completion Progress</p>
                        <p className="text-2xl font-bold font-serif mt-2">{completedStages} / {garments.length} <span className="text-sm font-sans font-normal opacity-40">pieces delivered</span></p>
                        <div className="h-1.5 w-full bg-ms-beige rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-ms-black" style={{ width: `${garments.length > 0 ? (completedStages / garments.length) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-ms-border sticky top-14 bg-ms-bg/90 backdrop-blur-md z-10">
                <div className="flex gap-10">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all",
                                activeTab === tab.id ? "border-ms-black text-ms-black" : "border-transparent text-ms-gray"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-10">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="ms-card p-10 bg-white">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-ms-black mb-8">Production Status</h3>
                                <p className="text-sm leading-relaxed text-ms-gray/80 italic font-serif text-lg">
                                    &ldquo;{collection.description || "Your collection is currently moving through the studio's proprietary pre-production pipeline. Track piece-by-piece progress in the Garments tab."}&rdquo;
                                </p>
                            </div>
                        </div>
                        <div className="ms-card p-8 bg-ms-beige/20 space-y-6 border-none">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-ms-black mb-4">Project Summary</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Estimated Delivery</p>
                                    <p className="text-sm font-bold text-ms-black mt-1">
                                        {collection.end_date ? new Date(collection.end_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'To be confirmed'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Pricing Positioning</p>
                                    <p className="text-sm font-bold text-ms-black mt-1">{collection.price_positioning || 'Standard'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'garments' && <GarmentList collectionId={id} garments={garments} onRefresh={loadData} canEdit={false} orgId={user?.organization_id || ''} />}
                {activeTab === 'finance' && <CollectionFinanceTab collection={collection} onUpdate={loadData} />}
                {activeTab === 'files' && <FileGallery entityType="collection" entityId={id} canUpload={false} />}
                {activeTab === 'comments' && <CommentThread entityType="collection" entityId={id} />}
            </div>
        </div>
    );
}
