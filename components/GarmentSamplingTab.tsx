
"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Camera, CheckCircle2, History, Loader2, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSamplingLogs, createSamplingLog, updateSamplingLog } from '@/lib/api';
import { Garment, SamplingLog } from '@/types';
import { useAuth } from '@/lib/auth';

interface GarmentSamplingTabProps {
    garment: Garment;
    onUpdate: () => void;
}

const SAMPLE_TYPES = ['PROTO', 'FIT', 'PPS', 'TOP'];

export function GarmentSamplingTab({ garment, onUpdate }: GarmentSamplingTabProps) {
    const { user } = useAuth();
    const [logs, setLogs] = useState<SamplingLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        sample_type: 'FIT',
        version: 1,
        tailor_assigned: '',
        fit_feedback: '',
        revision_notes: '',
    });

    const load = async () => {
        const data = await getSamplingLogs(garment.id);
        setLogs(data);
        setIsLoading(false);
    };

    useEffect(() => { load(); }, [garment.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createSamplingLog({
            garment_id: garment.id,
            organization_id: garment.organization_id,
            sample_type: form.sample_type,
            version: Number(form.version),
            tailor_assigned: form.tailor_assigned,
            fit_feedback: form.fit_feedback,
            revision_notes: form.revision_notes,
            photo_urls: [],
            is_approved: false
        });
        setIsAdding(false);
        load();
    };

    const handleApprove = async (id: string, is_approved: boolean) => {
        await updateSamplingLog(id, { is_approved });
        load();
    };

    if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-ms-gray" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <History className="w-4 h-4" /> Sampling History
                </h3>
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="ms-button-secondary py-2 px-4 text-[10px] font-black uppercase tracking-widest"
                    >
                        {isAdding ? 'Cancel' : 'Log New Sample'}
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="ms-card p-8 space-y-6 border-ms-black">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Sample Type</label>
                            <select className="w-full border border-ms-border rounded-lg p-3 text-sm" value={form.sample_type} onChange={e => setForm({ ...form, sample_type: e.target.value })}>
                                {SAMPLE_TYPES.map(t => <option key={t} value={t}>{t} Sample</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Version / Iteration</label>
                            <input type="number" className="w-full border border-ms-border rounded-lg p-3 text-sm" value={form.version} onChange={e => setForm({ ...form, version: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Tailor / Master Assigned</label>
                            <input type="text" className="w-full border border-ms-border rounded-lg p-3 text-sm" placeholder="Name" value={form.tailor_assigned} onChange={e => setForm({ ...form, tailor_assigned: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Fit Feedback & Corrections</label>
                            <textarea className="w-full border border-ms-border rounded-lg p-3 text-sm min-h-[100px]" placeholder="Note any changes needed..." value={form.fit_feedback} onChange={e => setForm({ ...form, fit_feedback: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="ms-button-primary bg-ms-black w-full py-4 text-[10px] font-black uppercase tracking-widest">
                        Submit Sample Log
                    </button>
                </form>
            )}

            {/* List */}
            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-ms-border rounded-2xl opacity-40">
                        <Camera className="w-10 h-10 mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No sampling logs found</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="ms-card p-0 overflow-hidden group">
                            <div className="p-6 flex items-start justify-between gap-6 border-b border-ms-border/50">
                                <div className="flex gap-5">
                                    <div className="w-10 h-10 rounded-full bg-ms-beige flex items-center justify-center flex-shrink-0">
                                        <p className="text-[10px] font-black text-ms-black">{log.sample_type[0]}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-ms-black">{log.sample_type} Sample v{log.version}</h4>
                                            {log.is_approved ? (
                                                <span className="flex items-center gap-1 text-[8px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                    <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                                                </span>
                                            ) : (
                                                <span className="text-[8px] font-black uppercase text-ms-gray bg-ms-beige px-2 py-0.5 rounded border border-ms-border/50">
                                                    Pending Approval
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-60">
                                            Logged on {new Date(log.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {user?.role === 'ADMIN' && (
                                    <button
                                        onClick={() => handleApprove(log.id, !log.is_approved)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                            log.is_approved ? "ms-button-secondary" : "ms-button-primary bg-ms-black"
                                        )}
                                    >
                                        {log.is_approved ? 'Undo Approval' : 'Approve Sample'}
                                    </button>
                                )}
                            </div>

                            <div className="p-6 bg-ms-beige/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-50 mb-2 flex items-center gap-2">
                                            <MessageSquare className="w-3 h-3" /> Fit Feedback
                                        </p>
                                        <p className="text-sm italic font-serif leading-relaxed text-ms-black">
                                            {log.fit_feedback || 'No feedback recorded.'}
                                        </p>
                                    </div>
                                    {log.tailor_assigned && (
                                        <div className="flex items-center gap-2 pt-2">
                                            <User className="w-3 h-3 text-ms-gray" />
                                            <p className="text-[10px] font-black text-ms-gray uppercase tracking-widest">Master: {log.tailor_assigned}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Placeholder for photo gallery */}
                                <div className="border border-dashed border-ms-border rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white/50">
                                    <Camera className="w-6 h-6 text-ms-gray/20 mb-2" />
                                    <p className="text-[8px] font-black uppercase tracking-widest text-ms-gray opacity-40">Sample Photos (In Files)</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
