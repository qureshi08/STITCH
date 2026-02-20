
"use client"

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    Plus,
    Loader2
} from 'lucide-react';
import {
    getClientInvoices,
    getVendorInvoices,
    getCollections,
    getVendors,
    createClientInvoice,
    createNotification,
    getDashboardStats
} from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ClientInvoice, VendorInvoice } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AdminFinancePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
    const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
    const [isLoading, setIsLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        type: 'client' as 'client' | 'vendor',
        collection_id: '',
        vendor_id: '',
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    const loadData = async () => {
        if (!user?.organization_id || user.role !== 'ADMIN') return;
        setIsLoading(true);
        try {
            const [ci, vi, cols, vends, sStats] = await Promise.all([
                getClientInvoices(user.organization_id, user.role, user.id),
                getVendorInvoices(user.organization_id),
                getCollections(user.organization_id),
                getVendors(user.organization_id),
                getDashboardStats(user.organization_id, user.role, user.id)
            ]);
            setClientInvoices(ci);
            setVendorInvoices(vi);
            setCollections(cols);
            setVendors(vends);
            setStats(sStats);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (isMounted) loadData();
    }, [user?.organization_id, isMounted]);

    if (!isMounted || user?.role !== 'ADMIN') return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (form.type === 'client') {
                const inv = await createClientInvoice({
                    organization_id: user!.organization_id,
                    collection_id: form.collection_id || undefined,
                    milestone_name: form.name,
                    amount: Number(form.amount),
                    due_date: form.date,
                    status: 'UNPAID',
                    is_visible_to_client: true
                });

                if (inv && form.collection_id) {
                    const { data: assignments } = await supabase
                        .from('collection_assignments')
                        .select('user_id')
                        .eq('collection_id', form.collection_id);

                    if (assignments) {
                        for (const ass of assignments) {
                            await createNotification({
                                organization_id: user!.organization_id,
                                user_id: ass.user_id,
                                title: 'New Invoice Issued',
                                content: `A new invoice for ${form.name} ($${Number(form.amount).toLocaleString()}) is ready.`,
                                type: 'INFO',
                                link: `/client/invoices`
                            });
                        }
                    }
                }
            } else {
                await supabase.from('vendor_invoices').insert([{
                    organization_id: user!.organization_id,
                    vendor_id: form.vendor_id || null,
                    vendor_name: vendors.find(v => v.id === form.vendor_id)?.name || form.name,
                    amount: Number(form.amount),
                    due_date: form.date,
                    status: 'PENDING'
                }]);
            }
            setShowNewModal(false);
            setForm({ type: 'client', collection_id: '', vendor_id: '', name: '', amount: '', date: new Date().toISOString().split('T')[0] });
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const totalReceived = stats?.totalEarnings || 0;
    const totalSpent = stats?.totalOutflow || 0;
    const availableCash = stats?.netLiquidity || 0;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-0">
                <div className="space-y-1">
                    <h1 className="text-4xl sm:text-5xl font-bold text-ms-black font-serif italic tracking-tighter">Financial Hub</h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                        <span className="text-[10px] font-black text-ms-gray uppercase tracking-[0.2em]">Cash Flow & Salary</span>
                        <div className="w-1 h-1 bg-ms-gray/30 rounded-full" />
                        <span className="text-[10px] font-black text-ms-gray uppercase tracking-[0.2em]">Fiscal Stream</span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button className="ms-button-secondary py-3 px-6 text-[10px] font-black uppercase tracking-widest border-ms-black text-ms-black w-full sm:w-auto flex justify-center items-center">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="ms-button-primary bg-ms-black border-ms-black py-3 px-8 text-[10px] font-black uppercase tracking-widest w-full sm:w-auto flex justify-center items-center"
                    >
                        + New Entry
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                    { label: 'Available Studio Cash', val: availableCash, extra: 'Total Liquid Earnings' },
                    { label: 'Total Studio Income', val: totalReceived, extra: 'Money in from Clients' },
                    { label: 'Total Project Outflow', val: totalSpent, extra: 'Payments to Vendors' },
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "ms-card p-6 sm:p-8 space-y-3",
                        i === 0 ? "bg-ms-black text-white" : "bg-white"
                    )}>
                        <p className={cn("text-[9px] font-black uppercase tracking-[0.3em]", i === 0 ? "opacity-40" : "text-ms-gray")}>{stat.label}</p>
                        <h3 className="text-3xl sm:text-4xl font-bold font-serif italic">
                            ${stat.val.toLocaleString()}
                        </h3>
                        <p className={cn("text-[10px] font-bold uppercase tracking-tight", i === 0 ? "opacity-30" : "text-ms-gray/30")}>{stat.extra}</p>
                    </div>
                ))}
            </div>

            <div className="ms-card p-6 sm:p-8 bg-ms-beige/20 border-ms-black/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black">Personal Salary Overview (YTD)</h3>
                    <span className="text-[10px] font-black uppercase bg-ms-black text-white px-3 py-1 rounded-full w-fit">Admin Only</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Total Earnings Received</p>
                        <p className="text-xl font-bold font-serif italic mt-1">${(stats?.totalEarnings || 0).toLocaleString()}</p>
                        <p className="text-[8px] text-ms-gray mt-1 font-bold opacity-40 uppercase truncate">Invoices + Payments</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Outstanding Receivable</p>
                        <p className="text-xl font-bold font-serif italic mt-1 text-orange-600">${(stats?.totalReceivable || 0).toLocaleString()}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Net Studio Liquidity</p>
                        <p className="text-xl font-bold font-serif italic mt-1 text-green-600">${(stats?.netLiquidity || 0).toLocaleString()}</p>
                        <div className="h-1.5 w-full bg-ms-black/5 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-ms-black" style={{ width: `${Math.min(100, (stats?.totalEarnings / (stats?.totalContractValue || 1)) * 100)}%` }} />
                        </div>
                        <p className="text-[8px] text-ms-gray mt-2 font-bold opacity-40 uppercase">
                            {((stats?.totalEarnings / (stats?.totalContractValue || 1)) * 100).toFixed(1)}% cleared
                        </p>
                    </div>
                </div>
            </div>

            <div className="ms-card overflow-hidden border-ms-border">
                <div className="flex flex-col sm:flex-row border-b border-ms-border bg-ms-white">
                    <button
                        onClick={() => setActiveTab('receivable')}
                        className={cn(
                            "flex-1 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] border-b-2 transition-all",
                            activeTab === 'receivable' ? "border-ms-black text-ms-black bg-ms-beige/10" : "border-transparent text-ms-gray"
                        )}
                    >
                        Accounts Receivable
                    </button>
                    <button
                        onClick={() => setActiveTab('payable')}
                        className={cn(
                            "flex-1 py-4 sm:py-5 text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] border-b-2 transition-all",
                            activeTab === 'payable' ? "border-ms-black text-ms-black bg-ms-beige/10" : "border-transparent text-ms-gray"
                        )}
                    >
                        Accounts Payable
                    </button>
                </div>

                <div className="divide-y divide-ms-border min-h-[400px] bg-white">
                    {activeTab === 'receivable' ? (
                        isLoading ? (
                            <div className="p-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>
                        ) : clientInvoices.length === 0 ? (
                            <div className="p-32 text-center text-ms-gray font-serif italic opacity-40">No client transactions found.</div>
                        ) : (
                            clientInvoices.map(inv => (
                                <div key={inv.id} className="p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-ms-beige/5 transition-colors group gap-4">
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="hidden xs:flex w-10 h-10 sm:w-12 sm:h-12 bg-ms-black text-white rounded-full items-center justify-center shadow-lg flex-shrink-0">
                                            <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base sm:text-lg font-bold text-ms-black font-serif italic truncate">{inv.milestone_name}</p>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                                                <span className="text-[9px] sm:text-[10px] text-ms-gray font-black uppercase tracking-widest whitespace-nowrap">DUE {new Date(inv.due_date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-ms-gray/20 rounded-full" />
                                                <span className="text-[9px] sm:text-[10px] text-ms-gray font-black uppercase tracking-widest truncate max-w-[150px] sm:max-w-[200px]">
                                                    {collections.find(c => c.id === inv.collection_id)?.name || 'Direct Payment'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 px-1 sm:px-0">
                                        <p className="text-xl sm:text-2xl font-bold text-ms-black font-serif italic">${Number(inv.amount).toLocaleString()}</p>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded inline-block",
                                            inv.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-ms-beige text-ms-gray border border-ms-border'
                                        )}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        isLoading ? (
                            <div className="p-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>
                        ) : vendorInvoices.length === 0 ? (
                            <div className="p-32 text-center text-ms-gray font-serif italic opacity-40">No vendor liabilities found.</div>
                        ) : (
                            vendorInvoices.map(inv => (
                                <div key={inv.id} className="p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-ms-beige/5 transition-colors group gap-4">
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="hidden xs:flex w-10 h-10 sm:w-12 sm:h-12 bg-ms-beige border border-ms-border rounded-full items-center justify-center flex-shrink-0">
                                            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-ms-black" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base sm:text-lg font-bold text-ms-black font-serif italic truncate">{inv.vendor_name || 'Generic Supplier'}</p>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                                                <span className="text-[9px] sm:text-[10px] text-ms-gray font-black uppercase tracking-widest whitespace-nowrap">DUE {new Date(inv.due_date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-ms-gray/20 rounded-full" />
                                                <span className="text-[9px] sm:text-[10px] text-ms-gray font-black uppercase tracking-widest">Category: {inv.vendor_type || 'Expense'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 px-1 sm:px-0">
                                        <p className="text-xl sm:text-2xl font-bold text-ms-black font-serif italic">${Number(inv.amount).toLocaleString()}</p>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded inline-block",
                                            inv.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-red-50 text-red-600 border border-red-100'
                                        )}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>


            {showNewModal && (
                <div className="fixed inset-0 bg-ms-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-ms-border flex justify-between items-center bg-ms-beige/10">
                            <div>
                                <h2 className="text-2xl font-bold text-ms-black font-serif italic">New Ledger Entry</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mt-1">Record transaction or liability</p>
                            </div>
                            <button onClick={() => setShowNewModal(false)} className="text-ms-gray hover:text-ms-black transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-3 p-1 bg-ms-beige rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, type: 'client' })}
                                    className={cn("py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", form.type === 'client' ? "bg-ms-black text-white" : "text-ms-gray")}
                                >
                                    Client Receivable
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, type: 'vendor' })}
                                    className={cn("py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", form.type === 'vendor' ? "bg-ms-black text-white" : "text-ms-gray")}
                                >
                                    Vendor Payable
                                </button>
                            </div>

                            <div className="space-y-5">
                                {form.type === 'client' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Link to Collection (Optional)</label>
                                        <select
                                            value={form.collection_id}
                                            onChange={e => setForm({ ...form, collection_id: e.target.value })}
                                            className="w-full border border-ms-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                        >
                                            <option value="">Direct Studio Payment</option>
                                            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Vendor / Supplier</label>
                                        <select
                                            value={form.vendor_id}
                                            onChange={e => setForm({ ...form, vendor_id: e.target.value })}
                                            className="w-full border border-ms-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                        >
                                            <option value="">One-time Supplier</option>
                                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray">{form.type === 'client' ? 'Transaction Description' : 'Vendor Name / Reference'}</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder={form.type === 'client' ? "e.g. Design Consultation" : "e.g. Fabric Supplier Ltd"}
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full border border-ms-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Amount</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0.00"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full border border-ms-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Due Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className="w-full border border-ms-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={isSaving}
                                className="w-full ms-button-primary bg-ms-black py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Record Entry</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
