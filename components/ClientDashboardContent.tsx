
"use client"

import React from 'react';
import {
    Layers, Package, DollarSign, ArrowRight,
    Clock, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface ClientDashboardContentProps {
    stats: any;
    collections: any[];
}

export function ClientDashboardContent({ stats, collections }: ClientDashboardContentProps) {
    return (
        <div className="space-y-8 sm:space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-ms-black font-serif italic tracking-tighter">Client Portal</h1>
                <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-ms-gray mt-2 sm:mt-3 leading-relaxed">
                    Overview of your projects with Maryam Shahid Studio
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="ms-card p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all border-ms-border/50 group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-6 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mb-1 opacity-60">Project Status</p>
                            <p className="text-xl sm:text-2xl font-bold font-serif text-ms-black">{collections.length} Active</p>
                        </div>
                    </div>
                </div>

                <div className="ms-card p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all border-ms-border/50 group">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-6 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mb-1 opacity-60">Pending Payments</p>
                            <p className="text-xl sm:text-2xl font-bold font-serif text-ms-black">{stats?.upcomingInvoices?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="ms-card p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-all border-ms-border/50 bg-ms-beige group sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl flex items-center justify-center bg-white text-ms-black">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-6 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mb-1 opacity-60">Outstanding Balance</p>
                            <p className="text-xl sm:text-2xl font-bold font-serif text-ms-black">${(stats?.totalReceivable || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Your Active Projects
                    </h3>
                    <div className="space-y-4">
                        {collections.length === 0 ? (
                            <div className="ms-card p-12 sm:p-20 text-center border-dashed border-2">
                                <Package className="w-10 h-10 text-ms-gray/20 mx-auto mb-4" />
                                <p className="text-sm font-bold text-ms-black">No active projects assigned</p>
                                <p className="text-xs text-ms-gray mt-1">Maryam Shahid Studio will initiate your collections shortly.</p>
                            </div>
                        ) : (
                            collections.map(c => (
                                <Link key={c.id} href={`/client/collections/${c.id}`} className="ms-card p-4 sm:p-6 flex items-center justify-between group hover:border-ms-black/30 transition-all gap-4">
                                    <div className="flex gap-4 sm:gap-5 items-center min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-ms-beige text-ms-black rounded-xl flex items-center justify-center group-hover:bg-ms-black group-hover:text-white transition-colors flex-shrink-0">
                                            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm sm:text-base font-bold text-ms-black group-hover:underline truncate">{c.name}</h4>
                                            <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 overflow-x-auto no-scrollbar">
                                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-50 text-blue-700 whitespace-nowrap">
                                                    {c.status}
                                                </span>
                                                {c.season && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-ms-border flex-shrink-0" />
                                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-60 whitespace-nowrap">
                                                            {c.season}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-ms-gray/20 group-hover:text-ms-black transition-colors transform group-hover:translate-x-1 flex-shrink-0" />
                                </Link>
                            ))
                        )}
                    </div>
                </div>


                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Pending Billing
                    </h3>
                    <div className="ms-card divide-y divide-ms-border/50">
                        {stats?.upcomingInvoices && stats.upcomingInvoices.length > 0 ? (
                            stats.upcomingInvoices.map((inv: any) => (
                                <Link key={inv.id} href={`/client/collections/${inv.collection_id}?tab=finance`} className="block p-5 hover:bg-ms-beige/10 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold text-ms-black group-hover:text-red-500 transition-colors">{inv.milestone_name}</p>
                                        <p className="text-sm font-mono font-bold">${Number(inv.amount).toLocaleString()}</p>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-50 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        Due {new Date(inv.due_date).toLocaleDateString()}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="p-12 text-center text-ms-gray/40">
                                <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-20 text-green-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest">All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
