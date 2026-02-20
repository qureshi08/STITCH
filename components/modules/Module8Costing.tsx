
"use client"

import React from 'react';
import {
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Target,
    AlertCircle,
    Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module8Costing() {
    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-ms-black font-serif">Cost Engineering</h3>
                <div className="flex gap-2">
                    <button className="ms-button-secondary text-[10px]">Export Cost Sheet</button>
                    <button className="ms-button-primary text-[10px] bg-ms-gray border-ms-gray">Edit Margins</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Raw Unit Cost', value: '$24.50', trend: 'Budget: $22.00', color: 'text-ms-black' },
                            { label: 'Suggested Retail (3.5x)', value: '$85.00', trend: 'Market Avg: $89.00', color: 'text-ms-black' },
                            { label: 'Current Margin', value: '71.2%', trend: 'Goal: 65%', color: 'text-green-600' },
                        ].map((stat) => (
                            <div key={stat.label} className="ms-card p-5 space-y-2 bg-white flex flex-col justify-between h-28">
                                <span className="text-[10px] font-bold text-ms-gray uppercase tracking-widest">{stat.label}</span>
                                <div className="flex items-baseline gap-2">
                                    <h4 className={cn("text-2xl font-bold font-serif", stat.color)}>{stat.value}</h4>
                                </div>
                                <p className="text-[10px] text-ms-gray font-medium flex items-center gap-1 opacity-70">
                                    {stat.trend}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="ms-card overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="ms-table-header">
                                <tr>
                                    <th className="py-3 px-4">Component</th>
                                    <th className="py-3 px-4">Breakdown</th>
                                    <th className="py-3 px-4 text-right">Unit Cost</th>
                                    <th className="py-3 px-4 text-right w-32">% of Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ms-border">
                                {[
                                    { name: 'Fabric', desc: 'Italian Silk @ $12.00/m x 1.8m', cost: '$21.60', percent: '54%' },
                                    { name: 'Trims', desc: 'YKK Zip, Thread, 4 Buttons', cost: '$2.40', percent: '6%' },
                                    { name: 'Labor', desc: 'Studio Tailoring (Premium)', cost: '$12.00', percent: '30%' },
                                    { name: 'Sampling', desc: 'Proto + Fit Amortized', cost: '$1.50', percent: '4%' },
                                    { name: 'Packaging', desc: 'MS Branded Poly + Tissue', cost: '$0.80', percent: '2%' },
                                    { name: 'Overhead', desc: '5% Operational Buffer', cost: '$1.70', percent: '4%' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-ms-beige/10">
                                        <td className="py-3 px-4 font-bold text-ms-black">{row.name}</td>
                                        <td className="py-3 px-4 text-ms-gray">{row.desc}</td>
                                        <td className="py-3 px-4 text-right font-medium text-ms-black">{row.cost}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-[10px] font-bold text-ms-gray">{row.percent}</span>
                                                <div className="w-12 h-1 bg-ms-beige rounded-full overflow-hidden">
                                                    <div className="h-full bg-ms-black" style={{ width: row.percent }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-ms-beige/30 font-bold border-t-2 border-ms-border">
                                    <td className="py-4 px-4 text-ms-black uppercase tracking-widest text-[10px]" colSpan={2}>Total Manufacturing Cost</td>
                                    <td className="py-4 px-4 text-right text-lg font-serif" colSpan={2}>$40.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="ms-card p-5 bg-ms-black text-white">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">Collection Budget Impact</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-white/10 rounded-full">
                                <PieChart className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs opacity-70">Total Variance</p>
                                <p className="text-xl font-bold font-serif">-$1,250.00</p>
                            </div>
                        </div>
                        <div className="p-3 bg-red-400/20 rounded border border-red-400/30 text-[10px] space-y-2">
                            <div className="flex items-center gap-2 font-bold uppercase tracking-widest">
                                <AlertCircle className="w-3 h-3" /> Budget Warning
                            </div>
                            <p className="opacity-80">Raw material costs for Silk variants have increased by 8.5% compared to initial strategy estimations.</p>
                        </div>
                    </div>

                    <div className="ms-card p-5">
                        <h4 className="text-[10px] font-bold text-ms-gray uppercase tracking-widest mb-4">Markup Strategy</h4>
                        <div className="p-4 bg-ms-beige/30 rounded border border-ms-border space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold uppercase">Multiplier</span>
                                <span className="text-lg font-bold">3.5x</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold uppercase">Wholesale</span>
                                <span className="text-md font-bold">$40.00</span>
                            </div>
                            <div className="pt-2 border-t border-ms-border">
                                <p className="text-[9px] text-ms-gray leading-tight">Prices listed exclude VAT, Shipping, and Duty calculations which are applied at point of order.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
