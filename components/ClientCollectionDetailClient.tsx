
"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Layers, Scissors, DollarSign,
    FileText, MessageCircle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collection, Garment, User } from '@/types';
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

interface ClientCollectionDetailClientProps {
    id: string;
    initialCollection: Collection;
    initialGarments: Garment[];
    user: User;
    initialTab?: string;
}

export function ClientCollectionDetailClient({ id, initialCollection, initialGarments, user, initialTab = 'overview' }: ClientCollectionDetailClientProps) {
    const [collection, setCollection] = useState<Collection>(initialCollection);
    const [garments, setGarments] = useState<Garment[]>(initialGarments);
    const [activeTab, setActiveTab] = useState(initialTab);

    const refreshData = async () => {
        // Trigger server refresh if needed
    };

    const completedStages = garments.filter(g => g.current_stage === 'DELIVERED').length;

    return (
        <div className="space-y-0 pb-20">
            <div className="mb-8 sm:mb-10 px-0 sm:px-0">
                <Link href="/client/collections" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black mb-6">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to My Projects
                </Link>

                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                            {collection.status}
                        </span>
                        <span className="bg-ms-beige text-ms-gray text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded">
                            {collection.season}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-ms-black font-serif italic tracking-tighter leading-[1.1]">{collection.name}</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
                    <div className="ms-card p-5 sm:p-6 border-ms-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-60">Completion Progress</p>
                        <p className="text-xl sm:text-2xl font-bold font-serif mt-2 whitespace-nowrap">
                            {completedStages} / {garments.length}
                            <span className="text-xs sm:text-sm font-sans font-normal opacity-40 ml-2 italic">pieces delivered</span>
                        </p>
                        <div className="h-1.5 w-full bg-ms-beige rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-ms-black" style={{ width: `${garments.length > 0 ? (completedStages / garments.length) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-ms-border sticky top-14 bg-ms-bg/95 backdrop-blur-md z-10 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                <div className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar py-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap flex-shrink-0",
                                activeTab === tab.id ? "border-ms-black text-ms-black" : "border-transparent text-ms-gray"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-8 sm:pt-10">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                            <div className="ms-card p-6 sm:p-10 bg-white">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-ms-black mb-6 sm:mb-8">Production Status</h3>
                                <p className="text-base sm:text-lg leading-relaxed text-ms-gray/80 italic font-serif">
                                    &ldquo;{collection.description || "Your collection is currently moving through the studio's proprietary pre-production pipeline. Track piece-by-piece progress in the Garments tab."}&rdquo;
                                </p>
                            </div>
                        </div>
                        <div className="ms-card p-6 sm:p-8 bg-ms-beige/20 space-y-6 border-none h-fit">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-ms-black mb-4">Project Summary</h3>
                            <div className="space-y-5">
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
                {activeTab === 'garments' && <GarmentList collectionId={id} garments={garments} onRefresh={refreshData} canEdit={false} orgId={user?.organization_id || ''} />}
                {activeTab === 'finance' && <div className="-mx-4 sm:mx-0"><CollectionFinanceTab collection={collection} onUpdate={refreshData} /></div>}
                {activeTab === 'files' && <FileGallery entityType="collection" entityId={id} canUpload={false} />}
                {activeTab === 'comments' && <CommentThread entityType="collection" entityId={id} />}
            </div>
        </div>
    );
}
