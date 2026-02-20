
"use client"

import React from 'react';
import {
    Scale,
    Ruler,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Expand,
    MinusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module7FitSize() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-ms-black font-serif">Fit & Size Engineering</h3>
                <div className="flex gap-2">
                    <button className="ms-button-secondary text-[10px]">Import Grade Rules</button>
                    <button className="ms-button-primary text-[10px]">Lock Final Specs</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest flex items-center justify-between">
                            Final Measurement Table (Size Bridge)
                            <span className="text-ms-black font-serif italic normal-case tracking-normal">Confirmed v1.2</span>
                        </h4>
                        <div className="ms-card overflow-hidden">
                            <table className="w-full text-left text-[11px]">
                                <thead className="ms-table-header">
                                    <tr>
                                        <th className="py-3 px-4 w-12">No.</th>
                                        <th className="py-3 px-4">Point of Measure</th>
                                        <th className="py-3 px-4 text-center">XS</th>
                                        <th className="py-3 px-4 text-center bg-ms-beige/50 font-bold">S</th>
                                        <th className="py-3 px-4 text-center">M</th>
                                        <th className="py-3 px-4 text-center">L</th>
                                        <th className="py-3 px-4 text-center">XL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ms-border">
                                    {[
                                        { no: '1', name: 'Total Length (HPS)', xs: '23', s: '24', m: '25', l: '26', xl: '27.5' },
                                        { no: '2', name: 'Across Shoulder', xs: '14.5', s: '15', m: '15.5', l: '16.5', xl: '17.5' },
                                        { no: '3', name: 'Chest (PIT to PIT)', xs: '18.5', s: '19.5', m: '20.5', l: '22', xl: '24' },
                                        { no: '4', name: 'Waist (un-stretched)', xs: '16', s: '17', m: '18', l: '19.5', xl: '21.5' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-ms-beige/5">
                                            <td className="py-3 px-4 text-ms-gray font-bold">{row.no}</td>
                                            <td className="py-3 px-4 font-medium text-ms-black">{row.name}</td>
                                            <td className="py-3 px-4 text-center text-ms-gray">{row.xs}</td>
                                            <td className="py-3 px-4 text-center font-bold text-ms-black bg-ms-beige/20">{row.s}</td>
                                            <td className="py-3 px-4 text-center text-ms-gray">{row.m}</td>
                                            <td className="py-3 px-4 text-center text-ms-gray">{row.l}</td>
                                            <td className="py-3 px-4 text-center text-ms-gray">{row.xl}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="ms-card p-5 space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Grading Logic (Inch Jump)</h4>
                            <div className="space-y-2">
                                {[
                                    { l: 'XS to S', v: '+1.0"' },
                                    { l: 'S to M', v: '+1.0"' },
                                    { l: 'M to L', v: '+1.5"' },
                                    { l: 'L to XL', v: '+2.0"' },
                                ].map((g) => (
                                    <div key={g.l} className="flex justify-between items-center text-xs pb-2 border-b border-ms-background last:border-0 border-dashed">
                                        <span className="text-ms-gray">{g.l}</span>
                                        <span className="font-bold text-ms-black">{g.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ms-card p-5 space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Tolerance Lock</h4>
                            <p className="text-[11px] text-ms-gray italic leading-relaxed">
                                Strict +/- 0.25" tolerance applied system-wide for premium finishing. QC will reject items exceeding these limits.
                            </p>
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase text-green-700 tracking-widest">Compliance Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="ms-card p-5 bg-ms-beige/50 border-ms-black">
                        <h4 className="text-xs font-bold text-ms-black uppercase tracking-widest mb-4">Fit Finalization</h4>
                        <div className="space-y-4 mb-6">
                            {[
                                'Base size S verified',
                                'Grade rule continuity',
                                'Armhole curvature correct',
                                'Hem line level across sizes'
                            ].map((c) => (
                                <div key={c} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded border border-ms-border bg-white flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-ms-black" />
                                    </div>
                                    <span className="text-xs text-ms-black font-medium">{c}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full ms-button-primary bg-ms-black border-ms-black py-3 uppercase tracking-widest text-[10px]">Approve Final Fit</button>
                    </div>

                    <div className="ms-card p-5">
                        <h4 className="text-[10px] font-bold text-ms-gray uppercase tracking-widest mb-3">Technical Notes</h4>
                        <textarea
                            className="w-full h-24 bg-transparent text-[11px] leading-relaxed italic border-none focus:outline-none resize-none"
                            defaultValue="Ensure the sleeve cuff (XS) is not too tight for the grade. Check if L/XL needs extra length for proportional balance."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
