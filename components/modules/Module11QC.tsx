
"use client"

import React from 'react';
import {
    ShieldCheck,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ClipboardCheck,
    Expand,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module11QC() {
    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-ms-black font-serif">Quality Control & Assurance</h3>
                <button className="ms-button-primary text-xs">+ Generate QC Report</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Passed Units', val: '245', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Minor Rework', val: '12', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Major Defect', val: '3', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'QC Pass %', val: '94.2%', icon: ShieldCheck, color: 'text-ms-black', bg: 'bg-ms-beige' },
                ].map((s) => (
                    <div key={s.label} className="ms-card p-5 space-y-3 bg-white">
                        <div className={cn("p-2 w-fit rounded-lg", s.bg)}>
                            <s.icon className={cn("w-4 h-4", s.color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-ms-gray uppercase tracking-widest">{s.label}</p>
                            <p className="text-xl font-bold font-serif text-ms-black">{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Inspection Checklist (Per Batch)</h4>
                    <div className="ms-card overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="ms-table-header">
                                <tr>
                                    <th className="py-3 px-6">Criteria</th>
                                    <th className="py-3 px-6">Method</th>
                                    <th className="py-3 px-6 text-center">Tolerance</th>
                                    <th className="py-3 px-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ms-border">
                                {[
                                    { c: 'Measurement Verification', m: 'Tape Measure / Template', t: '+/- 0.25"', s: 'Pass' },
                                    { c: 'Stitch Quality', m: 'Visual / Tension Test', t: '12-14 SPI', s: 'Pass' },
                                    { c: 'Color Match (Dye Lot)', m: 'Light Box (D65)', t: 'Lab Delta E < 1.0', s: 'Warning' },
                                    { c: 'Hardware (Zips/Buttons)', m: 'Pull Test', t: 'Cycle Test 50x', s: 'Pass' },
                                    { c: 'Internal Finishing', m: 'Seam / Overlock Check', t: 'No Raw Edges', s: 'Pass' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-ms-beige/10">
                                        <td className="py-4 px-6 font-bold text-ms-black">{row.c}</td>
                                        <td className="py-4 px-6 text-ms-gray italic">{row.m}</td>
                                        <td className="py-4 px-6 text-center text-ms-black font-medium">{row.t}</td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={cn(
                                                "status-badge",
                                                row.s === 'Pass' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                            )}>{row.s}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="ms-card p-5 space-y-6 bg-ms-beige/20">
                        <h4 className="text-xs font-bold text-ms-black uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Recent QC Reports
                        </h4>
                        <div className="space-y-4">
                            {[
                                { id: 'QC-7701', date: 'Today, 2:15 PM', units: '50 units', result: '98% PASS' },
                                { id: 'QC-7700', date: 'Yesterday', units: '120 units', result: '92% PASS' },
                            ].map((r) => (
                                <div key={r.id} className="p-3 bg-white rounded border border-ms-border group cursor-pointer hover:border-ms-black transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-ms-black underline">{r.id}</span>
                                        <span className="text-[10px] font-black text-green-600 tracking-tighter">{r.result}</span>
                                    </div>
                                    <p className="text-[10px] text-ms-gray">{r.date} • {r.units}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-ms-black border border-ms-black rounded hover:bg-ms-black hover:text-white transition-all">
                            Review All Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
