
"use client"

import React from 'react';
import {
    FileText,
    Ruler,
    Trash2,
    Plus,
    Calculator,
    Printer,
    FileDiff,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module4TechPack() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-ms-black font-serif">Tech Pack Management</h3>
                    <p className="text-xs text-ms-gray mt-1">Version 1.0 (Master Draft)</p>
                </div>
                <div className="flex gap-2">
                    <button className="ms-button-secondary text-[10px] flex items-center gap-2">
                        <Printer className="w-3 h-3" /> Print PDF
                    </button>
                    <button className="ms-button-primary text-[10px] flex items-center gap-2">
                        Lock Tech Pack
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-10">

                    {/* POM Table */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase text-ms-black tracking-widest flex items-center gap-2">
                                Measurement Table (POM)
                                <span className="p-1 bg-ms-beige rounded border border-ms-border">Inches</span>
                            </h4>
                            <button className="text-[10px] font-bold text-ms-black underline uppercase">+ Add Row</button>
                        </div>
                        <div className="ms-card overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="ms-table-header">
                                    <tr>
                                        <th className="py-3 px-4">Code</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4">Tol (+/-)</th>
                                        <th className="py-3 px-4">S</th>
                                        <th className="py-3 px-4 font-bold bg-ms-beige/50 text-ms-black">M (Base)</th>
                                        <th className="py-3 px-4">L</th>
                                        <th className="py-3 px-4">XL</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ms-border">
                                    {[
                                        { code: 'A', desc: 'Chest (1" below armhole)', tol: '0.25', s: '18', m: '20', l: '22', xl: '24' },
                                        { code: 'B', desc: 'Waist (un-stretched)', tol: '0.25', s: '16', m: '18', l: '20', xl: '22' },
                                        { code: 'C', desc: 'Front Length (from HPS)', tol: '0.5', s: '28', m: '29', l: '30', xl: '31' },
                                        { code: 'D', desc: 'Sleeve Length', tol: '0.25', s: '24', m: '25', l: '26', xl: '27' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-ms-beige/10">
                                            <td className="py-3 px-4 font-bold text-ms-black">{row.code}</td>
                                            <td className="py-3 px-4 text-ms-gray">{row.desc}</td>
                                            <td className="py-3 px-4 text-ms-gray italic">{row.tol}</td>
                                            <td className="py-3 px-4 text-ms-black">{row.s}</td>
                                            <td className="py-3 px-4 font-bold text-ms-black bg-ms-beige/20">{row.m}</td>
                                            <td className="py-3 px-4 text-ms-black">{row.l}</td>
                                            <td className="py-3 px-4 text-ms-black">{row.xl}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* BOM Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase text-ms-black tracking-widest">Bill of Materials (BOM)</h4>
                            <div className="flex gap-4">
                                <button className="text-[10px] font-bold text-ms-black underline uppercase">Import from Sourcing</button>
                                <button className="text-[10px] font-bold text-ms-black underline uppercase">+ Add Item</button>
                            </div>
                        </div>
                        <div className="ms-card overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="ms-table-header">
                                    <tr>
                                        <th className="py-3 px-4">Category</th>
                                        <th className="py-3 px-4">Item Name</th>
                                        <th className="py-3 px-4">Supplier</th>
                                        <th className="py-3 px-4">Usage / Unit</th>
                                        <th className="py-3 px-4">Cost/Unit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ms-border">
                                    {[
                                        { cat: 'Main Fabric', name: 'Italian Silk Crepe', sup: 'Milan Textiles', usage: '1.8m', cost: '$12.00' },
                                        { cat: 'Internal', name: 'Interfacing - Light', sup: 'Interlining Co', usage: '0.5m', cost: '$0.80' },
                                        { cat: 'Trims', name: 'YKK Invisible Zip 18"', sup: 'YKK HK', usage: '1pc', cost: '$0.45' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-ms-beige/10">
                                            <td className="py-3 px-4 text-ms-gray py-2.5">{row.cat}</td>
                                            <td className="py-3 px-4 font-medium text-ms-black">{row.name}</td>
                                            <td className="py-3 px-4 text-ms-gray">{row.sup}</td>
                                            <td className="py-3 px-4 text-ms-black">{row.usage}</td>
                                            <td className="py-3 px-4 text-ms-black">{row.cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Technical Specs Split */}
                    <div className="grid grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-ms-black tracking-widest">Stitch & Construction</h4>
                            <div className="ms-card p-4 space-y-3 bg-ms-beige/10">
                                {[
                                    { l: 'Seam Type', v: 'Closed Double Needle' },
                                    { l: 'SPI', v: '12-14 Stitches' },
                                    { l: 'Thread', v: 'Tex 24 Polyester' },
                                    { l: 'Hemming', v: '2cm Blind Stitch' },
                                ].map((s) => (
                                    <div key={s.l} className="flex justify-between border-b border-ms-border/50 pb-2">
                                        <span className="text-[10px] text-ms-gray uppercase">{s.l}</span>
                                        <span className="text-xs font-semibold text-ms-black">{s.v}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase text-ms-black tracking-widest">Compliance & Labels</h4>
                            <div className="ms-card p-4 space-y-3 bg-ms-beige/10">
                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1 border p-2 rounded bg-white text-[10px] border-ms-border">Main Label: Center Back</div>
                                    <div className="flex-1 border p-2 rounded bg-white text-[10px] border-ms-border">Care Tag: Left Seam</div>
                                </div>
                                <textarea
                                    placeholder="Packaging/Folding Instructions..."
                                    className="w-full text-[10px] p-2 bg-transparent border-none focus:outline-none h-16 leading-relaxed text-ms-gray"
                                    defaultValue="Tissue paper between folds. Place in biodegradable polybag (30x40cm). Seal with MS branded sticker."
                                />
                            </div>
                        </section>
                    </div>
                </div>

                {/* Tech Pack Actions */}
                <div className="space-y-6">
                    <div className="ms-card p-5 bg-orange-50 border-orange-200">
                        <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-orange-600 mt-0.5" />
                            <div>
                                <h5 className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-1">Incomplete Data</h5>
                                <p className="text-[10px] text-orange-700 leading-normal">
                                    BOM is missing thread weight and brand tag placement diagram. Production lock cannot be engaged.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="ms-card p-5">
                        <h4 className="text-xs font-bold text-ms-black uppercase tracking-widest mb-4">Version History</h4>
                        <div className="space-y-3">
                            {[
                                { v: '1.0', creator: 'Muhammad A.', date: 'Today' },
                                { v: '0.9', creator: 'Maryam S.', date: 'Feb 18' },
                            ].map((v) => (
                                <div key={v.v} className="flex items-center justify-between group cursor-pointer hover:bg-ms-beige/40 p-1 -m-1 rounded transition-colors">
                                    <span className="text-xs font-bold">V{v.v}</span>
                                    <span className="text-[10px] text-ms-gray">by {v.creator}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full ms-button-secondary py-3 flex items-center justify-center gap-2">
                        <FileDiff className="w-4 h-4" /> Compare Versions
                    </button>
                </div>
            </div>
        </div>
    );
}
