
"use client"

import React from 'react';
import {
    ShieldCheck,
    Lock,
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module9Lock() {
    const checklist = [
        { label: 'Pattern Finalization', status: 'Approved', module: 3 },
        { label: 'Tech Pack Integrity', status: 'Incomplete', module: 4 },
        { label: 'Fabric Bulk Booking', status: 'Approved', module: 5 },
        { label: 'Trim Inventory Check', status: 'Approved', module: 5 },
        { label: 'PPS Fit Approval', status: 'Pending', module: 6 },
        { label: 'Costing Strategy Lock', status: 'Approved', module: 8 },
        { label: 'Size Breakdown Confirm', status: 'Approved', module: 7 },
    ];

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-ms-black font-serif">Pre-Production Lock System</h3>
                <div className="status-badge bg-orange-50 text-orange-600 border border-orange-100 italic gap-2 flex items-center">
                    <AlertCircle className="w-3 h-3" /> System Blocked
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="ms-card bg-ms-beige/10 p-2 flex items-center gap-4">
                        <div className="p-4 bg-ms-black text-white rounded">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-ms-black uppercase tracking-tight">Bulk Production Logic Locked</p>
                            <p className="text-xs text-ms-gray">Manufacturing stage cannot be activated until the following prerequisites are approved.</p>
                        </div>
                    </div>

                    <div className="ms-card overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="ms-table-header">
                                <tr>
                                    <th className="py-3 px-6">Requirement</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ms-border">
                                {checklist.map((item, i) => (
                                    <tr key={i} className="hover:bg-ms-beige/10">
                                        <td className="py-4 px-6 font-bold text-ms-black flex items-center gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                item.status === 'Approved' ? "bg-green-500" : "bg-orange-500"
                                            )} />
                                            {item.label}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                item.status === 'Approved' ? "text-green-600" : "text-orange-600"
                                            )}>{item.status}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="text-[10px] font-bold text-ms-black underline uppercase flex items-center gap-1 justify-end ml-auto group">
                                                Jump to Module {item.module} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="ms-card p-6 border-ms-black border-2 bg-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-ms-beige -rotate-45 transform translate-x-6 -translate-y-6" />
                        <h4 className="text-xs font-bold text-ms-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Final Authorization
                        </h4>
                        <p className="text-xs text-ms-gray mb-8 leading-relaxed">
                            Engaging the Master Lock will freeze all technical specs, costs, and patterns. No further edits can be made without Admin override.
                        </p>
                        <button className="w-full ms-button-primary bg-ms-black py-4 uppercase tracking-[0.2em] font-black text-[10px] disabled:opacity-20" disabled>
                            ACTIVATE BULK PRODUCTION
                        </button>
                    </div>

                    <div className="p-4 rounded-xl border border-ms-border bg-ms-beige/20 space-y-3">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-ms-gray">Audit Requirements</h5>
                        <div className="space-y-2">
                            {[
                                'Technical drawings locked',
                                'Grading nest verified',
                                'Fabric dye-lot confirmed',
                                'Trim counts validated'
                            ].map((a) => (
                                <div key={a} className="flex items-center gap-2 text-[10px] text-ms-gray italic">
                                    <Clock className="w-3 h-3" /> {a}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
