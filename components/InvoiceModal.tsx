
"use client"

import React from 'react';
import { X, Printer, Download, Mail, Building2, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { ClientInvoice, Collection } from '@/types';
import { cn } from '@/lib/utils';

interface InvoiceModalProps {
    invoice: ClientInvoice;
    collection: Collection;
    onClose: () => void;
}

export function InvoiceModal({ invoice, collection, onClose }: InvoiceModalProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ms-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
                {/* Modal Header (UI only, not part of print) */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-ms-border p-4 flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-ms-beige rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-sm font-black uppercase tracking-widest text-ms-black">Invoice Preview</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="ms-button-secondary py-2 px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Printer className="w-4 h-4" /> Print PDF
                        </button>
                        <button
                            className="ms-button-primary bg-ms-black py-2 px-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                {/* Invoice Document Content */}
                <div id="invoice-document" className="p-12 md:p-20 text-ms-black font-sans print:p-0">
                    {/* Brand Header */}
                    <div className="flex justify-between items-start mb-20">
                        <div>
                            <h1 className="text-3xl font-serif italic font-bold tracking-tighter">Maryam Shahid Studio</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ms-gray mt-2">Design & Production House</p>
                            <div className="mt-6 space-y-1 text-[11px] text-ms-gray">
                                <p>Studio 42, Textile District</p>
                                <p>London, E1 6QL</p>
                                <p>contact@maryamshahid.com</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-5xl font-serif italic text-ms-black/10 absolute right-12 top-20 md:right-20 print:text-6xl uppercase pointer-events-none">Invoice</h2>
                            <div className="relative z-10 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Invoice Number</p>
                                <p className="text-lg font-bold font-mono">INV-{invoice.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mt-4">Date Issued</p>
                                <p className="text-sm font-bold">{new Date(invoice.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing Info */}
                    <div className="grid grid-cols-2 gap-20 mb-20">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray border-b border-ms-border pb-2 mb-4">Bill To</p>
                            <div className="space-y-1">
                                <p className="text-lg font-bold font-serif italic">{collection.name}</p>
                                <p className="text-xs text-ms-gray">Collection Portfolio</p>
                                <p className="text-xs text-ms-gray mt-4">Project ID: {collection.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray border-b border-ms-border pb-2 mb-4">Payment Status</p>
                            <div className="mt-2">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-2",
                                    invoice.status === 'PAID' ? "bg-green-50 text-green-700 border border-green-100" :
                                        invoice.status === 'PENDING' ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                            "bg-orange-50 text-orange-700 border border-orange-100"
                                )}>
                                    {invoice.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                                    {invoice.status === 'PENDING' ? 'Processing Verification' : invoice.status}
                                </span>
                                <p className="text-[10px] text-ms-gray mt-3 font-bold uppercase tracking-widest opacity-60">
                                    Due Date: {new Date(invoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-20">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-ms-black text-[10px] font-black uppercase tracking-widest">
                                    <th className="py-4 font-black">Description & Milestone</th>
                                    <th className="py-4 font-black text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ms-border">
                                <tr>
                                    <td className="py-8">
                                        <p className="font-bold text-ms-black">{invoice.milestone_name}</p>
                                        <p className="text-[11px] text-ms-gray mt-1 leading-relaxed max-w-md">
                                            This billing milestone represents a scheduled payment for the {collection.name} project as per the agreed contract.
                                        </p>
                                    </td>
                                    <td className="py-8 text-right align-top">
                                        <p className="text-lg font-bold font-mono">{collection.currency} {Number(invoice.amount).toLocaleString()}</p>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="py-8 text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Total Amount Due</p>
                                    </td>
                                    <td className="py-8 text-right bg-ms-beige/20 px-4">
                                        <p className="text-3xl font-bold font-serif italic">{collection.currency} {Number(invoice.amount).toLocaleString()}</p>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer / Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-black">Payment Instructions</p>
                            <div className="bg-ms-beige/10 p-6 rounded-xl space-y-3 text-[11px] text-ms-gray leading-relaxed border border-ms-border/50">
                                <p><strong>Bank:</strong> Global Fashion Bank, London</p>
                                <p><strong>IBAN:</strong> GB42 GFAB 6016 1332 5542 90</p>
                                <p><strong>SWIFT:</strong> GFABGB22</p>
                                <p><strong>Reference:</strong> MS-{invoice.id.slice(0, 6)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end text-ms-gray text-[10px] uppercase tracking-widest text-right leading-loose opacity-60">
                            <p>Thank you for your business</p>
                            <p>© 2026 Maryam Shahid Studio</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
