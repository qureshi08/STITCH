
"use client"

import React from 'react';
import {
    Truck,
    Package,
    MapPin,
    ClipboardCheck,
    CheckCircle2,
    Calendar,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module12Delivery() {
    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-ms-black font-serif">Packaging & Final Delivery</h3>
                <button className="ms-button-primary text-xs bg-ms-black px-6">Close Project</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-10">
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Post-Production Checklist</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Final Unit Count', val: '492 Items', icon: Package },
                                { label: 'Care Tags Verified', val: 'Compliant', icon: ClipboardCheck },
                                { label: 'MS Brand Packing', val: 'Confirmed', icon: ClipboardCheck },
                                { label: 'Box Labels (SKU)', val: 'v2 Done', icon: ClipboardCheck },
                            ].map((c) => (
                                <div key={c.label} className="ms-card p-4 flex items-center gap-4 bg-white">
                                    <div className="p-2 bg-ms-beige rounded">
                                        <c.icon className="w-4 h-4 text-ms-black" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-ms-gray uppercase tracking-widest">{c.label}</p>
                                        <p className="text-xs font-bold text-ms-black">{c.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Shipment Batches</h4>
                        <div className="ms-card divide-y divide-ms-border overflow-hidden">
                            {[
                                { id: 'SH-902', destination: 'Aura Boutique - London HUB', units: '250', status: 'In Transit', carrier: 'DHL Express' },
                                { id: 'SH-903', destination: 'Urban Threads - NYC Store', units: '150', status: 'Processing', carrier: 'FedEx' },
                                { id: 'SH-904', destination: 'MS Private - Lahore', units: '92', status: 'Pending', carrier: 'Local Courier' },
                            ].map((s) => (
                                <div key={s.id} className="p-5 flex items-center justify-between hover:bg-ms-beige/10 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-10 h-10 rounded bg-ms-beige flex items-center justify-center font-bold text-xs">
                                            {s.id}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-ms-black flex items-center gap-2 group-hover:underline cursor-pointer">
                                                {s.destination}
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h5>
                                            <p className="text-[10px] text-ms-gray flex items-center gap-2 mt-1 uppercase tracking-tight font-medium">
                                                <Truck className="w-3 h-3" /> {s.carrier} • {s.units} Units
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "status-badge",
                                        s.status === 'In Transit' ? "bg-blue-50 text-blue-600" :
                                            s.status === 'Processing' ? "bg-orange-50 text-orange-600" : "bg-ms-beige text-ms-gray"
                                    )}>
                                        {s.status}
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-ms-gray bg-ms-beige/30 hover:bg-ms-beige/50 transition-colors">
                                + New Shipment Log
                            </button>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="ms-card p-6 bg-ms-black text-white relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Collection Closure
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-2xl font-serif font-black">98.4%</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Completion Rating</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    'Total Garments Produced: 492',
                                    'Total Material Wastage: 4%',
                                    'Net Realized Margin: 64.2%',
                                    'Production Lead Time: 28 Days'
                                ].map((s) => (
                                    <p key={s} className="text-xs opacity-80 flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3 opacity-50" /> {s}
                                    </p>
                                ))}
                            </div>
                            <button className="w-full py-3 bg-white text-ms-black font-black uppercase tracking-widest text-[10px] rounded hover:bg-ms-beige transition-colors">
                                Generate Final Studio Report
                            </button>
                        </div>
                    </div>

                    <div className="ms-card p-5 space-y-4">
                        <h4 className="text-[10px] font-bold text-ms-gray uppercase tracking-widest">Delivery Confirmation</h4>
                        <div className="p-4 border-2 border-dashed border-ms-border flex flex-col items-center justify-center text-center opacity-50">
                            <MapPin className="w-6 h-6 text-ms-gray mb-2" />
                            <p className="text-[10px] font-bold text-ms-gray">Waiting for POD upload...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
