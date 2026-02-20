
"use client"

import React from 'react';
import {
    Camera,
    MessageSquare,
    User,
    Clock,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module6Sampling() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-ms-black font-serif">Sampling Engineering</h3>
                <button className="ms-button-primary text-xs flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Request New Sample
                </button>
            </div>

            <div className="space-y-10">
                {[
                    {
                        type: 'PPS (Pre-Production Sample)',
                        version: 'V3',
                        status: 'Current',
                        tailor: 'Master Akram',
                        date: 'Today',
                        feedback: 'Awaiting fit session tomorrow morning.',
                        locked: false
                    },
                    {
                        type: 'Fit Sample',
                        version: 'V2',
                        status: 'Approved',
                        tailor: 'Master Akram',
                        date: 'Feb 15, 2026',
                        feedback: 'Waist reduced by 1.5cm. Sleeve length confirmed.',
                        locked: true
                    },
                    {
                        type: 'Proto Sample',
                        version: 'V1',
                        status: 'Rejected',
                        tailor: 'Studio Team',
                        date: 'Feb 10, 2026',
                        feedback: 'Drape is too heavy. Switching to lighter silk variant.',
                        locked: true
                    },
                ].map((s) => (
                    <div key={s.version} className={cn(
                        "ms-card overflow-hidden transition-all",
                        s.status === 'Current' ? "border-ms-black ring-1 ring-ms-black" : "opacity-70"
                    )}>
                        <div className="p-6 border-b border-ms-border flex items-center justify-between bg-white">
                            <div className="flex items-center gap-5">
                                <div className={cn(
                                    "w-12 h-12 rounded flex items-center justify-center font-bold text-xs",
                                    s.status === 'Approved' ? "bg-green-50 text-green-600 border border-green-100" :
                                        s.status === 'Rejected' ? "bg-red-50 text-red-600 border border-red-100" :
                                            "bg-ms-black text-white"
                                )}>
                                    {s.version}
                                </div>
                                <div>
                                    <h4 className="font-bold text-ms-black flex items-center gap-2 uppercase tracking-tight">
                                        {s.type}
                                        {s.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                                    </h4>
                                    <p className="text-xs text-ms-gray flex items-center gap-1.5 mt-0.5">
                                        <User className="w-3 h-3" /> Tailor: {s.tailor} • <Clock className="w-3 h-3" /> {s.date}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 border border-ms-border rounded hover:bg-ms-beige transition-colors">
                                    <Camera className="w-4 h-4 text-ms-gray" />
                                </button>
                                <button className="ms-button-secondary text-[10px] py-1">View Full Log</button>
                            </div>
                        </div>

                        <div className="p-6 bg-ms-beige/10 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-3">
                                <h5 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> Fit Feedback & Alterations
                                </h5>
                                <p className="text-sm text-ms-black leading-relaxed italic bg-white p-3 rounded border border-ms-border/50 shadow-sm relative">
                                    <span className="absolute -left-1 top-4 w-2 h-2 bg-white border-l border-b border-ms-border transform rotate-45" />
                                    "{s.feedback}"
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Photos (2)</h5>
                                <div className="flex gap-2">
                                    <div className="w-16 h-16 bg-ms-beige rounded border border-ms-border group cursor-pointer overflow-hidden relative">
                                        <div className="absolute inset-0 bg-ms-black/0 group-hover:bg-ms-black/10 transition-colors" />
                                    </div>
                                    <button className="w-16 h-16 border-2 border-dashed border-ms-border rounded flex flex-col items-center justify-center text-ms-gray hover:text-ms-black hover:border-ms-black transition-all">
                                        <Plus className="w-4 h-4" />
                                        <span className="text-[8px] font-bold mt-1">ADD</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {s.status === 'Current' && (
                            <div className="px-6 py-4 border-t border-ms-border bg-white flex items-center justify-between">
                                <p className="text-[10px] text-ms-gray font-medium italic">* Final PPS approval locks technical development.</p>
                                <div className="flex gap-3">
                                    <button className="text-xs font-bold text-red-600 px-3 py-1.5 hover:bg-red-50 rounded transition-colors uppercase">Reject</button>
                                    <button className="text-xs font-bold text-green-700 px-3 py-1.5 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors uppercase">Approve Sample</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
