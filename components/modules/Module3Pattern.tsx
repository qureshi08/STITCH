
"use client"

import React from 'react';
import {
    FileCode,
    UserCircle,
    Ruler,
    History,
    CheckCircle2,
    FileDown,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Module3Pattern() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-ms-black font-serif">Pattern Engineering</h3>
                <div className="flex gap-2">
                    <button className="ms-button-secondary text-[10px] flex items-center gap-2">
                        <FileDown className="w-3 h-3" /> Export DXF
                    </button>
                    <button className="ms-button-primary text-[10px] flex items-center gap-2">
                        Upload Pattern
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pattern Files & Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="ms-card bg-white overflow-hidden">
                        <div className="p-6 border-b border-ms-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-ms-beige rounded-lg border border-ms-border flex items-center justify-center text-ms-gray">
                                    <FileCode className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-ms-black">v4.2_Base_Pattern.pdf</h4>
                                    <p className="text-xs text-ms-gray">Assigned to: <span className="text-ms-black font-medium">Muhammad Anas</span></p>
                                </div>
                            </div>
                            <div className="status-badge bg-blue-50 text-blue-600 border border-blue-100">Revision 4</div>
                        </div>

                        <div className="p-6 bg-ms-beige/10 grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h5 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Grading Rules Applied</h5>
                                <div className="space-y-3">
                                    {['Size S (-2cm)', 'Size M (Base)', 'Size L (+2.5cm)', 'Size XL (+5cm)'].map((rule) => (
                                        <div key={rule} className="flex items-center gap-2 text-xs text-ms-black">
                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                            {rule}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4 border-l border-ms-border pl-8">
                                <h5 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Technical Checklist</h5>
                                <div className="space-y-2">
                                    {[
                                        'Seam allowances confirmed (1cm)',
                                        'Notches positioned',
                                        'Grain lines verified',
                                        'Pattern blocks nested'
                                    ].map((check) => (
                                        <div key={check} className="flex items-center gap-2 text-xs text-ms-gray">
                                            <div className="w-2 h-2 rounded-full bg-ms-border" />
                                            {check}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-ms-border flex items-center justify-between">
                            <button className="text-xs font-bold text-ms-black flex items-center gap-2 hover:underline">
                                <ExternalLink className="w-3 h-3" /> View Revisions
                            </button>
                            <span className="text-[10px] text-ms-gray font-medium">Last Modified: Today, 2:45 PM</span>
                        </div>
                    </div>

                    <div className="ms-card p-6">
                        <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest mb-4">Pattern Revision Log</h4>
                        <div className="space-y-4">
                            {[
                                { version: '4.2', note: 'Adjusted armhole depth for fit improvement.', date: 'Today' },
                                { version: '4.1', note: 'Corrected seam allowance on neckline.', date: 'Yesterday' },
                                { version: '4.0', note: 'Initial base pattern upload.', date: 'Feb 15' },
                            ].map((log) => (
                                <div key={log.version} className="flex items-start gap-4 pb-4 border-b border-ms-border last:border-0 last:pb-0">
                                    <div className="text-[10px] font-black text-ms-gray bg-ms-beige px-2 py-1 rounded">V{log.version}</div>
                                    <div className="flex-1">
                                        <p className="text-xs text-ms-black font-medium leading-relaxed">{log.note}</p>
                                        <p className="text-[10px] text-ms-gray mt-1">{log.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pattern Sidebar */}
                <div className="space-y-6">
                    <div className="ms-card p-5 border-ms-black border-2 border-dashed">
                        <h4 className="text-xs font-bold text-ms-black uppercase tracking-widest mb-4">Approval Action</h4>
                        <p className="text-xs text-ms-gray mb-6 leading-relaxed">
                            Required for technical engineering to proceed. Ensure all seam allowances and grading rules are finalized.
                        </p>
                        <button className="w-full ms-button-primary bg-ms-black py-3">Finalize Pattern</button>
                    </div>

                    <div className="ms-card p-5">
                        <h4 className="text-[10px] font-bold text-ms-gray uppercase tracking-widest mb-4">Pattern Maker</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-ms-beige flex items-center justify-center font-bold text-ms-black">
                                MA
                            </div>
                            <div>
                                <p className="text-sm font-bold text-ms-black">Muhammad Anas</p>
                                <p className="text-[10px] text-ms-gray">Studio Lead</p>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-ms-gray border border-ms-border rounded">Change Maker</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
