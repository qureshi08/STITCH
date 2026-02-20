
"use client"

import React from 'react';
import {
    FlaskConical,
    Droplets,
    Truck,
    Tag,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module5Sourcing() {
    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-ms-black font-serif">Fabric & Trim Sourcing</h3>
                <button className="ms-button-primary text-xs">+ Add Material</button>
            </div>

            <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Fabric Inventory & Lab Testing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            name: 'Italian Silk Crepe',
                            comp: '100% Silk',
                            gsm: '80',
                            status: 'Approved',
                            tests: ['Shrinkage: 2%', 'Wash Test: Passed', 'Dye Lot: #8802'],
                            supplier: 'Milan Textiles Ltd.'
                        },
                        {
                            name: 'Japanese Raw Denim',
                            comp: '100% Cotton',
                            gsm: '14oz',
                            status: 'Awaiting Lab',
                            tests: ['Shrinkage: Pending', 'Color Fastness: In Progress'],
                            supplier: 'Kurabo Mills'
                        },
                    ].map((f) => (
                        <div key={f.name} className="ms-card bg-white p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h5 className="font-bold text-ms-black">{f.name}</h5>
                                    <p className="text-xs text-ms-gray">{f.comp} • {f.gsm} GSM</p>
                                </div>
                                <div className={cn(
                                    "status-badge",
                                    f.status === 'Approved' ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                )}>
                                    {f.status}
                                </div>
                            </div>

                            <div className="space-y-2 py-3 border-y border-ms-border/50">
                                {f.tests.map((t) => (
                                    <div key={t} className="flex items-center gap-2 text-[10px] text-ms-gray font-medium">
                                        <CheckCircle2 className={cn("w-3 h-3", t.includes('Passed') ? "text-green-500" : "text-ms-border")} />
                                        {t}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-ms-black font-bold uppercase tracking-tight flex items-center gap-1">
                                    <Truck className="w-3 h-3" /> {f.supplier}
                                </span>
                                <button className="text-[10px] font-bold text-ms-black underline">View Full Spec</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Trims & Hardware</h4>
                    <span className="text-[10px] text-ms-gray italic">3 items confirmed</span>
                </div>
                <div className="ms-card overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="ms-table-header">
                            <tr>
                                <th className="py-3 px-4">Trim Type</th>
                                <th className="py-3 px-4">Description</th>
                                <th className="py-3 px-4">Supplier</th>
                                <th className="py-3 px-4">Lead Time</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ms-border">
                            {[
                                { type: 'Buttons', desc: 'Real Mother of Pearl (12mm)', sup: 'Ocean Trims', lead: '14 Days', status: 'Booked' },
                                { type: 'Zipper', desc: 'YKK Invisible #3 (50cm)', sup: 'YKK Local', lead: '3 Days', status: 'Received' },
                                { type: 'Labels', desc: 'Woven Satin - Brand/Care', sup: 'Labex HK', lead: '21 Days', status: 'In Transit' },
                            ].map((t, i) => (
                                <tr key={i} className="hover:bg-ms-beige/10">
                                    <td className="py-3 px-4 font-bold text-ms-black">{t.type}</td>
                                    <td className="py-3 px-4 text-ms-gray">{t.desc}</td>
                                    <td className="py-3 px-4 text-ms-gray">{t.sup}</td>
                                    <td className="py-3 px-4 text-ms-black">{t.lead}</td>
                                    <td className="py-3 px-4">
                                        <span className={cn(
                                            "status-badge",
                                            t.status === 'Received' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                        )}>{t.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest text-ms-gray hover:bg-ms-beige transition-colors border-t border-ms-border">
                        + Add Trim Item
                    </button>
                </div>
            </div>
        </div>
    );
}
