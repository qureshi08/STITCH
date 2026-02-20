
"use client"

import React from 'react';
import {
    Layers, Package, DollarSign, ArrowRight,
    TrendingUp, Inbox, Plus, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface AdminDashboardContentProps {
    user: User;
    stats: any;
    recentCollections: any[];
}

export function AdminDashboardContent({ user, stats, recentCollections }: AdminDashboardContentProps) {
    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-0">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-ms-black font-serif italic tracking-tighter">Studio Overview</h1>
                    <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-ms-gray mt-2 sm:mt-3">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {user?.name}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/collections/new" className="ms-button-primary bg-ms-black py-3 px-6 sm:px-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest w-full sm:w-auto">
                        <Plus className="w-4 h-4" />
                        Init Collection
                    </Link>
                </div>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Projects', value: stats?.activeCollections || 0, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Unpaid Client Ledger', value: `$${(stats?.totalReceivable || 0).toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Studio Earnings (YTD)', value: `$${(stats?.totalEarnings || 0).toLocaleString()}`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    {
                        label: 'Available Studio Cash',
                        sub: 'Total Liquid Earnings',
                        value: `$${(stats?.netLiquidity || 0).toLocaleString()}`,
                        icon: TrendingUp,
                        color: 'text-white',
                        bg: 'bg-ms-black/20',
                        isInverse: true
                    },
                ].map((s, i) => (
                    <div key={i} className={cn(
                        "ms-card p-6 flex flex-col justify-between hover:shadow-lg transition-all border-ms-border/50",
                        s.isInverse ? "bg-ms-black text-white" : "bg-white"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className={cn("p-2.5 rounded-xl flex items-center justify-center", s.bg, s.color)}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <ArrowRight className={cn("w-4 h-4", s.isInverse ? "text-white/20" : "text-ms-gray/20")} />
                        </div>
                        <div className="mt-6 flex items-end justify-between">
                            <div>
                                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", s.isInverse ? "text-white/60" : "text-ms-gray opacity-60")}>{s.label}</p>
                                <p className={cn("text-2xl font-bold font-serif", s.isInverse ? "text-white" : "text-ms-black")}>{s.value}</p>
                                {s.sub && <p className={cn("text-[8px] font-black uppercase tracking-[0.2em] mt-2", s.isInverse ? "text-white/30" : "text-ms-gray opacity-40")}>{s.sub}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Collections */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black flex items-center gap-2">
                            <Package className="w-4 h-4" /> Recent Collections
                        </h3>
                        <Link href="/admin/collections" className="text-[10px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black transition-colors">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentCollections.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-ms-border rounded-2xl bg-ms-beige/5">
                                <Inbox className="w-10 h-10 text-ms-gray/20 mx-auto mb-4" />
                                <p className="text-sm font-bold text-ms-black">Project pipeline is empty</p>
                                <Link href="/admin/collections/new" className="text-[10px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black underline mt-2 block">
                                    Create your first collection
                                </Link>
                            </div>
                        ) : (
                            recentCollections.map(c => (
                                <Link key={c.id} href={`/admin/collections/${c.id}`} className="ms-card p-6 flex items-center justify-between group hover:border-ms-black/30 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-ms-beige rounded-xl flex items-center justify-center text-ms-black">
                                            <Layers className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-ms-black group-hover:underline">{c.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-60 mt-1">
                                                {c.season} · {c.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-ms-black">${Number(c.contract_value).toLocaleString()}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-40 mt-1">Contract Val.</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Billing Alerts */}
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Pending Billing
                    </h3>
                    <div className="ms-card divide-y divide-ms-border/50">
                        {stats?.upcomingInvoices?.length > 0 ? (
                            stats.upcomingInvoices.map((inv: any) => (
                                <div key={inv.id} className="p-5 hover:bg-ms-beige/10 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[11px] font-bold text-ms-black">{inv.milestone_name}</p>
                                        <p className="text-[11px] font-mono font-bold">${Number(inv.amount).toLocaleString()}</p>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-50">
                                        Due {new Date(inv.due_date).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-ms-gray/40">
                                <p className="text-[10px] font-black uppercase tracking-widest">No pending invoices</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
