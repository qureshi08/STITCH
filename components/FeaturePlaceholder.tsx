
"use client"

import React from 'react';
import { Construction, ArrowLeft, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface FeaturePlaceholderProps {
    title: string;
    description: string;
}

export function FeaturePlaceholder({ title, description }: FeaturePlaceholderProps) {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-8 px-6">
            <div className="w-24 h-24 bg-ms-beige rounded-full flex items-center justify-center relative animate-pulse">
                <Construction className="w-10 h-10 text-ms-gray" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-ms-black rounded-full flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 text-white" />
                </div>
            </div>

            <div className="max-w-md space-y-4">
                <h1 className="text-3xl font-bold text-ms-black font-serif tracking-tight">{title}</h1>
                <p className="text-ms-gray text-sm leading-relaxed uppercase tracking-widest font-medium opacity-80 italic">
                    {description}
                </p>
                <p className="text-xs text-ms-gray/60 italic font-serif">
                    This module is currently being calibrated for your high-performance studio environment.
                </p>
            </div>

            <div className="flex gap-4">
                <Link href="/" className="ms-button-secondary flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <button className="ms-button-primary bg-ms-black border-ms-black opacity-50 cursor-not-allowed">
                    Request Priority Deployment
                </button>
            </div>

            <div className="pt-20 grid grid-cols-3 gap-12 border-t border-ms-border/50 w-full max-w-2xl">
                {[
                    { label: 'Latency', val: '0ms' },
                    { label: 'Security', val: 'Open Access' },
                    { label: 'Version', val: 'v2.4.0-beta' },
                ].map(stat => (
                    <div key={stat.label} className="text-center">
                        <p className="text-[9px] font-black text-ms-gray uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-ms-black font-serif">{stat.val}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
