
"use client"

import React from 'react';
import {
    Box,
    Factory,
    Activity,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module10Production() {
    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-ms-black font-serif">Bulk Production Tracking</h3>
                <div className="flex gap-2">
                    <button className="ms-button-secondary text-[10px]">Import Unit Counts</button>
                    <button className="ms-button-primary text-[10px] bg-green-600 border-green-600">Sync Inventory</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Units Cut', val: '450 / 500', p: '90%', color: 'text-ms-black' },
                            { label: 'In Stitching', val: '280', p: '56%', color: 'text-blue-600' },
                            { label: 'Defect Rate', val: '1.2%', p: '6 units', color: 'text-orange-600' },
                            { label: 'Wastage', val: '2.5m', p: 'Silk', color: 'text-ms-gray' },
                        ].map((s) => (
                            <div key={s.label} className="ms-card p-4 space-y-1 bg-white">
                                <p className="text-[9px] font-bold text-ms-gray uppercase tracking-widest">{s.label}</p>
                                <p className={cn("text-xl font-bold font-serif", s.color)}>{s.val}</p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-ms-background">
                                    <span className="text-[10px] font-bold text-ms-gray">{s.p}</span>
                                    {s.label === 'Units Cut' && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="ms-card overflow-hidden bg-white">
                        <div className="p-4 border-b border-ms-border flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-ms-black">Batch Progress Breakdown</h4>
                            <div className="flex gap-2">
                                <button className="w-6 h-6 rounded flex items-center justify-center bg-ms-beige border border-ms-border text-ms-black"><LayoutGrid className="w-3 h-3" /></button>
                            </div>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left text-xs">
                                <thead className="ms-table-header">
                                    <tr>
                                        <th className="py-2.5 px-4 font-bold border-r">Size</th>
                                        <th className="py-2.5 px-4">Allocated</th>
                                        <th className="py-2.5 px-4">Cutting</th>
                                        <th className="py-2.5 px-4">Stitching</th>
                                        <th className="py-2.5 px-4">Finishing</th>
                                        <th className="py-2.5 px-4 text-right">Completion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ms-border">
                                    {[
                                        { s: 'XS', a: '50', c: '50', s_: '45', f: '20', p: '40%' },
                                        { s: 'S', a: '150', c: '150', s_: '100', f: '0', p: '0%' },
                                        { s: 'M', a: '200', c: '180', s_: '50', f: '0', p: '0%' },
                                        { s: 'L', a: '100', c: '70', s_: '0', f: '0', p: '0%' },
                                    ].map((r) => (
                                        <tr key={r.s} className="hover:bg-ms-beige/10">
                                            <td className="py-3 px-4 font-black bg-ms-beige/20 text-center border-r">{r.s}</td>
                                            <td className="py-3 px-4 font-bold text-ms-black">{r.a}</td>
                                            <td className="py-3 px-4 text-ms-gray">{r.c}</td>
                                            <td className="py-3 px-4 text-ms-gray">{r.s_}</td>
                                            <td className="py-3 px-4 text-ms-gray">{r.f}</td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className="font-bold text-ms-black">{r.p}</span>
                                                    <div className="w-10 h-1 bg-ms-beige rounded-full">
                                                        <div className="h-full bg-ms-black transition-all" style={{ width: r.p }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="ms-card p-5 space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Daily Log</h4>
                            <div className="space-y-3">
                                {[
                                    { t: '10:45 AM', m: 'Cutting set of 150 units of Size S finalized.', u: 'Master Akram' },
                                    { t: '9:00 AM', m: 'Fabric batch #8802 released to stitching floor.', u: 'Studio Team' },
                                ].map((l, i) => (
                                    <div key={i} className="flex gap-4 pb-3 border-b border-ms-border/50 last:border-0 last:pb-0">
                                        <span className="text-[9px] font-bold text-ms-gray whitespace-nowrap">{l.t}</span>
                                        <div>
                                            <p className="text-xs text-ms-black leading-tight italic">"{l.m}"</p>
                                            <p className="text-[10px] text-ms-gray mt-1 font-medium">{l.u}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ms-card p-5 space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Efficiency Chart</h4>
                            <div className="h-28 flex items-end justify-between gap-1 pt-4">
                                {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                    <div key={i} className="flex-1 bg-ms-beige rounded-t hover:bg-ms-black transition-colors" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                            <div className="flex justify-between text-[8px] font-bold text-ms-gray uppercase tracking-widest opacity-50">
                                <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="ms-card p-5 bg-ms-beige/30">
                        <h4 className="text-xs font-bold text-ms-black uppercase tracking-widest mb-4">Production Summary</h4>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-ms-gray uppercase font-bold">Time Elapsed</span>
                                <span className="text-md font-bold text-ms-black">12 Days</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] text-ms-gray uppercase font-bold">Estimated End</span>
                                <span className="text-md font-bold text-ms-black italic">Mar 05</span>
                            </div>
                            <div className="pt-4 border-t border-ms-border">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold">Overall Progress</span>
                                    <span className="text-[10px] font-black">22%</span>
                                </div>
                                <div className="h-2 w-full bg-white border border-ms-border rounded-full overflow-hidden">
                                    <div className="h-full bg-ms-black" style={{ width: '22%' }} />
                                </div>
                            </div>
                        </div>
                        <button className="w-full ms-button-secondary py-3 text-[10px] uppercase font-bold tracking-widest">Download Full Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
