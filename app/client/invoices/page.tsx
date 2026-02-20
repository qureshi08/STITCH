
"use client"

import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    ArrowDownLeft,
    Clock,
    Loader2,
    CheckCircle2,
    FileText
} from 'lucide-react';
import {
    getClientInvoices,
    getCollections,
    getProjectExpenses,
    getSalaryContract,
    getSalaryPayments
} from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ClientInvoice, ProjectExpense, SalaryContract, SalaryPayment } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ClientInvoicePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
    const [salaryConfigs, setSalaryConfigs] = useState<Record<string, { contract: SalaryContract, payments: SalaryPayment[] }>>({});

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'CLIENT') {
            router.push('/');
        }
    }, [user, router]);

    const loadData = async () => {
        if (!user?.organization_id || user.role !== 'CLIENT') return;
        setIsLoading(true);
        try {
            const [ci, cols] = await Promise.all([
                getClientInvoices(user.organization_id, user.role, user.id),
                getCollections(user.organization_id, user.role, user.id)
            ]);
            setClientInvoices(ci);
            setCollections(cols);

            // Fetch expenses and salary data for each collection
            const expPromises = cols.map(c => getProjectExpenses(c.id));
            const allExpenses = await Promise.all(expPromises);
            setExpenses(allExpenses.flat());

            const salaryData: Record<string, { contract: SalaryContract, payments: SalaryPayment[] }> = {};
            for (const col of cols) {
                if (col.billing_model === 'SALARY') {
                    const contract = await getSalaryContract(col.id);
                    if (contract) {
                        const payments = await getSalaryPayments(contract.id);
                        salaryData[col.id] = { contract, payments };
                    }
                }
            }
            setSalaryConfigs(salaryData);

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (isMounted) loadData();
    }, [user?.organization_id, isMounted]);

    if (!isMounted || user?.role !== 'CLIENT') return null;

    const totalInvoiceOutstanding = clientInvoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalExpensesReimbursed = expenses.filter(e => e.reimbursement_status === 'REIMBURSED').reduce((s, e) => s + Number(e.amount), 0);
    const totalExpensesPending = totalExpenses - totalExpensesReimbursed;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-5xl font-bold text-ms-black font-serif italic tracking-tighter">Financial Statement</h1>
                    <p className="text-[10px] font-black text-ms-gray uppercase tracking-[0.2em] mt-2">Personalized project billing & expense tracking</p>
                </div>
            </div>

            {/* Salary & Expense KPIs (Strictly Client Relevant) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="ms-card p-8 space-y-3 bg-ms-black text-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Total Outstanding</p>
                    <h3 className="text-4xl font-bold font-serif italic">${(totalInvoiceOutstanding + totalExpensesPending).toLocaleString()}</h3>
                    <p className="text-[10px] opacity-30 uppercase font-bold">Unpaid Invoices + Pending Expenses</p>
                </div>
                <div className="ms-card p-8 space-y-3 bg-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ms-gray">Project Expenses Tracking</p>
                    <h3 className="text-4xl font-bold font-serif italic">${totalExpenses.toLocaleString()}</h3>
                    <p className="text-[10px] text-ms-gray/30 uppercase font-bold">${totalExpensesReimbursed.toLocaleString()} Reimbursed</p>
                </div>
                <div className="ms-card p-8 space-y-3 bg-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-ms-gray">Total Paid to Studio</p>
                    <h3 className="text-4xl font-bold font-serif italic">
                        ${(clientInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.amount), 0) +
                            Object.values(salaryConfigs).reduce((s, config) => s + config.payments.reduce((sp, p) => sp + Number(p.amount_paid), 0), 0)
                        ).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-ms-gray/30 uppercase font-bold">Invoices + Salary Retainers</p>
                </div>
            </div>

            {/* Detailed Salary Tracking section */}
            {Object.keys(salaryConfigs).length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Monthly Salary Retainers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(salaryConfigs).map(([colId, config]) => {
                            const collection = collections.find(c => c.id === colId);
                            const totalPaid = config.payments.reduce((s, p) => s + Number(p.amount_paid), 0);
                            return (
                                <div key={colId} className="ms-card p-6 border-ms-black/5">
                                    <h4 className="text-base font-bold text-ms-black mb-4 font-serif italic">{collection?.name}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Monthly Retainer</p>
                                            <p className="text-xl font-bold font-serif italic mt-1 font-mono">${Number(config.contract.monthly_salary).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Total Paid YTD</p>
                                            <p className="text-xl font-bold font-serif italic mt-1 text-green-600 font-mono">${totalPaid.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Invoices and Expenses Tabs */}
            <div className="ms-card overflow-hidden border-ms-border bg-white">
                <div className="p-5 border-b border-ms-border bg-ms-beige/10 flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black">Transaction & Expense History</h3>
                </div>
                <div className="divide-y divide-ms-border min-h-[400px]">
                    {isLoading ? (
                        <div className="p-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>
                    ) : (clientInvoices.length === 0 && expenses.length === 0) ? (
                        <div className="p-32 text-center text-ms-gray font-serif italic opacity-40">No historical data available.</div>
                    ) : (
                        <>
                            {clientInvoices.map(inv => (
                                <div key={inv.id} className="p-8 flex items-center justify-between hover:bg-ms-beige/5 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-ms-black text-white rounded-full flex items-center justify-center">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold font-serif italic text-ms-black">{inv.milestone_name}</p>
                                            <p className="text-[10px] text-ms-gray font-black uppercase tracking-widest mt-1">
                                                Invoiced Milestone · {collections.find(c => c.id === inv.collection_id)?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold font-serif italic text-ms-black">${Number(inv.amount).toLocaleString()}</p>
                                        <div className="flex items-center gap-3 justify-end mt-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Due {new Date(inv.due_date).toLocaleDateString()}</span>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded inline-block",
                                                inv.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-ms-beige text-ms-gray border border-ms-border'
                                            )}>
                                                {inv.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {expenses.map(exp => (
                                <div key={exp.id} className="p-8 flex items-center justify-between hover:bg-ms-beige/5 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-ms-beige border border-ms-border text-ms-black rounded-full flex items-center justify-center">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold font-serif italic text-ms-black">{exp.category} - {exp.vendor_name || 'Project Expense'}</p>
                                            <p className="text-[10px] text-ms-gray font-black uppercase tracking-widest mt-1">
                                                Reimbursable Expense · {collections.find(c => c.id === exp.collection_id)?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold font-serif italic text-ms-black">${Number(exp.amount).toLocaleString()}</p>
                                        <div className="flex items-center gap-3 justify-end mt-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Incurred {new Date(exp.incurred_date).toLocaleDateString()}</span>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded inline-block",
                                                exp.reimbursement_status === 'REIMBURSED' ? 'bg-green-500 text-white' : 'bg-red-50 text-red-600 border border-red-100'
                                            )}>
                                                {exp.reimbursement_status === 'REIMBURSED' ? 'PAID' : 'PENDING REIMBURSEMENT'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
