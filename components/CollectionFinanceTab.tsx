
"use client"

import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, CheckCircle2, AlertCircle, Loader2, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    getCollectionMilestones,
    getCollectionCostEntries,
    createClientInvoice,
    updateClientInvoice,
    deleteClientInvoice,
    createNotification,
    getSalaryContract,
    getSalaryPayments,
    getProjectExpenses,
    createSalaryPayment,
    updateSalaryPayment,
    createProjectExpense,
    updateProjectExpense,
    deleteProjectExpense
} from '@/lib/api';
import { Collection, ClientInvoice, PaymentStatus, CostCenter, SalaryContract, SalaryPayment, ProjectExpense } from '@/types';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { InvoiceModal } from './InvoiceModal';

interface CollectionFinanceTabProps {
    collection: Collection;
    onUpdate: () => void;
}

export function CollectionFinanceTab({ collection, onUpdate }: CollectionFinanceTabProps) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
    const [costs, setCosts] = useState<CostCenter[]>([]); // Model 2 Legacy costs
    const [salaryContract, setSalaryContract] = useState<SalaryContract | null>(null);
    const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
    const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<'salary' | 'expenses' | 'milestones'>(
        collection.billing_model === 'SALARY' ? 'salary' : 'milestones'
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [currentMonthName, setCurrentMonthName] = useState('');
    const [expenseForm, setExpenseForm] = useState({
        category: 'Fabric',
        description: '',
        vendor_name: '',
        amount: '',
        incurred_date: new Date().toISOString().split('T')[0]
    });
    const [form, setForm] = useState({
        milestone_name: '',
        amount: '',
        due_date: '',
        is_visible_to_client: true
    });

    const load = async () => {
        setIsLoading(true);
        try {
            if (collection.billing_model === 'SALARY') {
                const contract = await getSalaryContract(collection.id);
                setSalaryContract(contract);
                if (contract) {
                    const [payments, exp] = await Promise.all([
                        getSalaryPayments(contract.id),
                        getProjectExpenses(collection.id)
                    ]);
                    setSalaryPayments(payments);
                    setExpenses(exp);
                } else {
                    setSalaryPayments([]);
                    setExpenses([]);
                }
            } else {
                const [invData, costData] = await Promise.all([
                    getCollectionMilestones(collection.id),
                    getCollectionCostEntries(collection.id)
                ]);
                setInvoices(invData);
                setCosts(costData);
            }
        } catch (err) {
            console.error('Failed to load finance data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        setCurrentMonthName(new Date().toLocaleString('default', { month: 'short' }));
        load();
    }, [collection.id]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.milestone_name || !form.amount || !form.due_date) return;
        setIsSaving(true);
        const inv = await createClientInvoice({
            organization_id: collection.organization_id,
            collection_id: collection.id,
            milestone_name: form.milestone_name,
            amount: Number(form.amount),
            due_date: form.due_date,
            status: 'UNPAID',
            is_visible_to_client: form.is_visible_to_client
        });

        // Notify client
        if (inv && form.is_visible_to_client) {
            try {
                const { data: assignments } = await supabase
                    .from('collection_assignments')
                    .select('user_id')
                    .eq('collection_id', collection.id);

                if (assignments) {
                    for (const ass of assignments) {
                        await createNotification({
                            organization_id: collection.organization_id,
                            user_id: ass.user_id,
                            title: 'New Billing Milestone',
                            content: `Maryam created a new invoice: ${form.milestone_name} ($${Number(form.amount).toLocaleString()}).`,
                            type: 'INFO',
                            link: user?.role === 'ADMIN' ? `/admin/collections/${collection.id}?tab=finance` : `/client/collections/${collection.id}?tab=finance`
                        });
                    }
                }
            } catch (e) { console.error('Notification failed:', e); }
        }
        setIsSaving(false);
        setIsAdding(false);
        setForm({ milestone_name: '', amount: '', due_date: '', is_visible_to_client: true });
        load();
        onUpdate();
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseForm.amount || !expenseForm.category) return;
        setIsSaving(true);
        try {
            const exp = await createProjectExpense({
                organization_id: collection.organization_id,
                collection_id: collection.id,
                category: expenseForm.category,
                description: expenseForm.description,
                vendor_name: expenseForm.vendor_name,
                amount: Number(expenseForm.amount),
                incurred_date: expenseForm.incurred_date,
                reimbursement_status: 'PENDING'
            });

            if (exp) {
                setIsAddingExpense(false);
                setExpenseForm({
                    category: 'Fabric',
                    description: '',
                    vendor_name: '',
                    amount: '',
                    incurred_date: new Date().toISOString().split('T')[0]
                });
                load();
            } else {
                alert('Failed to log expense. Please ensure the database schema is up to date.');
            }
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred while logging expense.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateExpense = async (id: string, status: 'PENDING' | 'REIMBURSED') => {
        setUpdatingId(id);
        await updateProjectExpense(id, {
            reimbursement_status: status,
            reimbursement_date: status === 'REIMBURSED' ? new Date().toISOString().split('T')[0] : undefined
        });
        setUpdatingId(null);
        load();
    };

    const handleModelToggle = async () => {
        const newModel = collection.billing_model === 'SALARY' ? 'CONTRACT' : 'SALARY';
        if (!confirm(`Switch to ${newModel} billing model?`)) return;

        const { error } = await supabase
            .from('collections')
            .update({ billing_model: newModel })
            .eq('id', collection.id);

        if (!error) onUpdate();
    };

    const handleInitSalary = async (amount: number) => {
        if (!amount || amount <= 0) return;
        setIsSaving(true);
        try {
            const contract = await supabase.from('salary_contracts').insert([{
                organization_id: collection.organization_id,
                collection_id: collection.id,
                monthly_salary: amount,
                start_date: new Date().toISOString().split('T')[0],
                status: 'ACTIVE'
            }]).select();

            if (contract.error) {
                console.error('Failed to init salary:', contract.error);
                alert('Database Error: Could not initialize salary contract. Ensure you have run the latest SQL update.');
            }
        } finally {
            setIsSaving(false);
            load();
        }
    };

    const handleLogSalaryPayment = async () => {
        if (!salaryContract) return;
        setIsSaving(true);
        try {
            const month = new Date().toISOString().slice(0, 7); // YYYY-MM
            const payment = await createSalaryPayment({
                salary_contract_id: salaryContract.id,
                month,
                amount_paid: salaryContract.monthly_salary,
                status: 'PAID',
                payment_date: new Date().toISOString().split('T')[0]
            });

            if (payment) {
                load();
            } else {
                alert('Failed to log salary payment.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: PaymentStatus) => {
        setUpdatingId(id);
        const inv = invoices.find(i => i.id === id);
        if (!inv) {
            setUpdatingId(null);
            return;
        }

        const updates: Partial<ClientInvoice> = { status };
        if (status === 'PAID') {
            updates.paid_date = new Date().toISOString().split('T')[0];
        }

        await updateClientInvoice(id, updates);

        // Add automated notification
        try {
            if (status === 'PENDING' && user?.role === 'CLIENT') {
                // Notify Admins
                const { data: admins } = await supabase
                    .from('organization_members')
                    .select('user_id')
                    .eq('organization_id', collection.organization_id)
                    .eq('role', 'ADMIN');

                if (admins) {
                    for (const adm of admins) {
                        await createNotification({
                            organization_id: collection.organization_id,
                            user_id: adm.user_id,
                            title: 'Payment Sent',
                            content: `${user.name} marked "${inv.milestone_name}" as paid. Please verify.`,
                            type: 'WARNING',
                            link: user?.role === 'ADMIN' ? `/admin/collections/${collection.id}?tab=finance` : `/client/collections/${collection.id}?tab=finance`
                        });
                    }
                }
            } else if (status === 'PAID' && user?.role === 'ADMIN') {
                // Notify Clients assigned to this collection
                const { data: assignments } = await supabase
                    .from('collection_assignments')
                    .select('user_id')
                    .eq('collection_id', collection.id);

                if (assignments) {
                    for (const ass of assignments) {
                        await createNotification({
                            organization_id: collection.organization_id,
                            user_id: ass.user_id,
                            title: 'Payment Verified',
                            content: `Maryam verified your payment for "${inv.milestone_name}". Thank you!`,
                            type: 'SUCCESS',
                            link: user?.role === 'ADMIN' ? `/admin/collections/${collection.id}?tab=finance` : `/client/collections/${collection.id}?tab=finance`
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Notification failed:', e);
        }

        setUpdatingId(null);
        load();
        onUpdate();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this invoice?')) return;
        await deleteClientInvoice(id);
        load();
        onUpdate();
    };

    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + Number(inv.amount), 0);
    const totalActualSpend = costs.reduce((sum, c) => sum + Number(c.actual_cost || 0), 0);
    const expectedSpend = costs.reduce((sum, c) => sum + Number(c.estimated_cost || 0), 0);
    const grossProfit = totalInvoiced - totalActualSpend;
    const marginPct = totalInvoiced > 0 ? (grossProfit / totalInvoiced) * 100 : 0;

    const remaining = Number(collection.contract_value || 0) - totalInvoiced;

    // Filter invoices for client view
    const visibleInvoices = user?.role === 'CLIENT'
        ? invoices.filter(inv => inv.is_visible_to_client)
        : invoices;

    // Model 1 Calculations
    const totalExpLogged = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const clientReimbursed = expenses.filter(e => e.reimbursement_status === 'REIMBURSED').reduce((s, e) => s + Number(e.amount), 0);
    const outstandingExp = totalExpLogged - clientReimbursed;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlySalary = salaryContract?.monthly_salary || 0;
    const salaryReceivedThisMonth = salaryPayments.filter(p => p.month === currentMonth && p.status === 'PAID').reduce((s, p) => s + p.amount_paid, 0);
    const salaryPending = monthlySalary - salaryReceivedThisMonth;
    const ytdSalary = salaryPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount_paid, 0);

    if (isLoading || isAuthLoading) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-ms-gray" />
            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-40">Synchronizing Financial Data...</p>
        </div>
    );

    if (collection.billing_model === 'SALARY') {
        return (
            <div className="space-y-12 animate-in fade-in duration-500">
                {/* Model Header / Control */}
                {user?.role === 'ADMIN' && (
                    <div className="flex items-center justify-between pb-4 border-b border-ms-border/30">
                        <div>
                            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-ms-black">Salary-Based Fiscal Model</h2>
                            <p className="text-[10px] text-ms-gray mt-1 uppercase tracking-widest font-bold opacity-40">Client Accountability Mode Enabled</p>
                        </div>
                        <button
                            onClick={handleModelToggle}
                            className="text-[9px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black border border-ms-border px-3 py-1.5 rounded-lg transition-all"
                        >
                            Switch to Contract Model
                        </button>
                    </div>
                )}

                {/* ADMIN View Model 1 */}
                {user?.role === 'ADMIN' && (
                    <>
                        {/* SECTION A: Personal Salary Tracker */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-ms-black opacity-40 flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5" /> Personal Salary Tracking
                            </h3>
                            {!salaryContract ? (
                                <div className="ms-card p-12 text-center bg-ms-beige/20 border-dashed">
                                    <p className="text-sm font-bold text-ms-black">Salary Model Not Initialized</p>
                                    <p className="text-[10px] text-ms-gray uppercase tracking-widest mt-2 mb-6">Define your monthly retainer for this project</p>
                                    <button
                                        onClick={() => {
                                            const amt = prompt('Enter Monthly Salary Amount:');
                                            if (amt) handleInitSalary(Number(amt));
                                        }}
                                        className="ms-button-primary bg-ms-black py-2 px-6 text-[10px] font-black uppercase tracking-widest mx-auto"
                                    >
                                        Initialize Salary Retainer
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="ms-card p-6 bg-ms-beige/30">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Monthly Salary</p>
                                        <p className="text-xl font-bold font-serif italic mt-1">{collection.currency} {monthlySalary.toLocaleString()}</p>
                                    </div>
                                    <div className="ms-card p-6 border-ms-black/5 flex justify-between items-center group">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Salary Received ({currentMonthName})</p>
                                            <p className="text-xl font-bold font-serif italic mt-1 text-green-600">{collection.currency} {salaryReceivedThisMonth.toLocaleString()}</p>
                                        </div>
                                        {salaryPending > 0 && (
                                            <button
                                                onClick={handleLogSalaryPayment}
                                                className="p-2 bg-green-50 text-green-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-[9px] font-black uppercase"
                                            >
                                                Log Payment
                                            </button>
                                        )}
                                    </div>
                                    <div className="ms-card p-6 border-ms-black/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Salary Pending</p>
                                        <p className="text-xl font-bold font-serif italic mt-1 text-orange-600">{collection.currency} {salaryPending.toLocaleString()}</p>
                                    </div>
                                    <div className="ms-card p-6 border-ms-black/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">YTD Salary Received</p>
                                        <p className="text-xl font-bold font-serif italic mt-1">{collection.currency} {ytdSalary.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECTION B: Project Expense Command Center */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-ms-black opacity-40 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Project Expense Hub
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                        outstandingExp > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                    )}>
                                        Expense Gap: {collection.currency} {outstandingExp.toLocaleString()}
                                    </div>
                                    <button
                                        onClick={() => setIsAddingExpense(!isAddingExpense)}
                                        className="ms-button-primary bg-ms-black py-1.5 px-4 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        {isAddingExpense ? 'Cancel' : <><Plus className="w-3 h-3" /> Log Expense</>}
                                    </button>
                                </div>
                            </div>

                            {isAddingExpense && (
                                <form onSubmit={handleAddExpense} className="ms-card p-6 border-ms-black bg-ms-beige/5 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-ms-gray tracking-tighter">Category</label>
                                            <select
                                                className="w-full border border-ms-border rounded p-2 text-xs font-bold bg-white"
                                                value={expenseForm.category}
                                                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                            >
                                                {['Fabric', 'Trims', 'Sampling', 'Production', 'Logistics', 'Misc'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[8px] font-black uppercase text-ms-gray tracking-tighter">Description / Vendor</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Italian Silk - Saree Fabric"
                                                className="w-full border border-ms-border rounded p-2 text-xs bg-white"
                                                value={expenseForm.description}
                                                onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-ms-gray tracking-tighter">Amount</label>
                                            <input
                                                required
                                                type="number"
                                                placeholder="0.00"
                                                className="w-full border border-ms-border rounded p-2 text-xs bg-white font-mono font-bold"
                                                value={expenseForm.amount}
                                                onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="w-full bg-ms-black text-white rounded p-2 text-[9px] font-black uppercase tracking-widest hover:bg-ms-black/80 flex items-center justify-center h-[34px]"
                                            >
                                                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Log'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="ms-card p-6 bg-ms-black text-white">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Total Expenses Logged</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2">{collection.currency} {totalExpLogged.toLocaleString()}</p>
                                </div>
                                <div className="ms-card p-6 border-ms-black/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Client Reimbursed</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2 text-ms-black">{collection.currency} {clientReimbursed.toLocaleString()}</p>
                                </div>
                                <div className="ms-card p-6 border-ms-black/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Outstanding Reimbursement</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2 text-orange-600">{collection.currency} {outstandingExp.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION C: Expense Table */}
                        <div className="ms-card overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-ms-beige/30 border-b border-ms-border">
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray">Category</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray">Vendor / Description</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray text-right">Amount</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray text-center">Status</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ms-border/40">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-ms-gray/40 text-[10px] font-bold uppercase tracking-widest">No expenses logged for this project</td>
                                        </tr>
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp.id} className="hover:bg-ms-beige/5 transition-colors">
                                                <td className="p-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-ms-beige px-2 py-0.5 rounded">{exp.category}</span>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm font-bold text-ms-black">{exp.vendor_name || '—'}</p>
                                                    <p className="text-[10px] text-ms-gray mt-0.5">{exp.description}</p>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <p className="text-sm font-bold font-mono text-ms-black">{collection.currency} {Number(exp.amount).toLocaleString()}</p>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleUpdateExpense(exp.id, exp.reimbursement_status === 'REIMBURSED' ? 'PENDING' : 'REIMBURSED')}
                                                        disabled={updatingId === exp.id}
                                                        className={cn(
                                                            "text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-colors",
                                                            exp.reimbursement_status === 'REIMBURSED' ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                                        )}
                                                    >
                                                        {updatingId === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : exp.reimbursement_status}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <p className="text-[10px] font-bold text-ms-gray">{new Date(exp.incurred_date).toLocaleDateString()}</p>
                                                        <button
                                                            onClick={async () => { if (confirm('Delete expense?')) { await deleteProjectExpense(exp.id); load(); } }}
                                                            className="text-ms-gray hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* CLIENT View Model 1 */}
                {user?.role === 'CLIENT' && (
                    <>
                        {/* SECTION A: Retainer Summary */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-ms-black opacity-40">Monthly Retainer Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="ms-card p-6 bg-ms-black text-white">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Monthly Salary</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2">{collection.currency} {monthlySalary.toLocaleString()}</p>
                                </div>
                                <div className="ms-card p-6 bg-ms-beige/30">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-black">Salary Paid</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2 text-ms-black">{collection.currency} {salaryReceivedThisMonth.toLocaleString()}</p>
                                </div>
                                <div className="ms-card p-6 border-ms-black/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Salary Outstanding</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2 text-orange-600">{collection.currency} {salaryPending.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION B: Project Expense Summary */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-ms-black opacity-40">Project Expense Accountability</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="ms-card p-6 border-ms-black/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Total Project Expenses</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2 text-ms-black">{collection.currency} {totalExpLogged.toLocaleString()}</p>
                                </div>
                                <div className="ms-card p-6 bg-green-50/30 border-green-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-green-700">Total Paid (Reimbursed)</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2 text-green-700">{collection.currency} {clientReimbursed.toLocaleString()}</p>
                                </div>
                                <div className="ms-card p-6 bg-orange-50/30 border-orange-100">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-700">Total Outstanding</p>
                                    <p className="text-2xl font-bold font-serif italic mt-2 text-orange-700">{collection.currency} {outstandingExp.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION C: Detailed Expense Log */}
                        <div className="ms-card overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-ms-beige/30 border-b border-ms-border">
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray">Expense Log</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray">Category</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray text-right">Amount</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray text-center">Receipt</th>
                                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-ms-gray text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ms-border/40">
                                    {expenses.map(exp => (
                                        <tr key={exp.id} className="hover:bg-ms-beige/5 transition-colors">
                                            <td className="p-4">
                                                <p className="text-[11px] font-bold text-ms-black">{exp.description || exp.vendor_name}</p>
                                                <p className="text-[9px] text-ms-gray mt-0.5 uppercase tracking-tighter">{new Date(exp.incurred_date).toLocaleDateString()}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[9px] font-black uppercase bg-ms-beige/50 px-2 py-0.5 rounded text-ms-gray">{exp.category}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <p className="text-sm font-bold font-mono text-ms-black">{collection.currency} {Number(exp.amount).toLocaleString()}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                {exp.invoice_url ? (
                                                    <a href={exp.invoice_url} target="_blank" className="p-1 px-2 border border-ms-border rounded text-[9px] font-black uppercase hover:bg-ms-black hover:text-white transition-all inline-flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> View
                                                    </a>
                                                ) : <span className="text-[9px] text-ms-gray opacity-30 italic">No Scan</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-tighter",
                                                    exp.reimbursement_status === 'REIMBURSED' ? "text-green-600" : "text-orange-600"
                                                )}>
                                                    {exp.reimbursement_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Model Header / Control */}
            {user?.role === 'ADMIN' && (
                <div className="flex items-center justify-between pb-4 border-b border-ms-border/30">
                    <div>
                        <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-ms-black">Project-Based Fiscal Model</h2>
                        <p className="text-[10px] text-ms-gray mt-1 uppercase tracking-widest font-bold opacity-40">Contract Value & Margin Strategy Enabled</p>
                    </div>
                    <button
                        onClick={handleModelToggle}
                        className="text-[9px] font-black uppercase tracking-widest text-ms-gray hover:text-ms-black border border-ms-border px-3 py-1.5 rounded-lg transition-all"
                    >
                        Switch to Salary Model
                    </button>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="ms-card p-6 bg-ms-black text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Contract Value</p>
                    <p className="text-2xl font-bold font-serif italic mt-2">
                        {collection.currency} {Number(collection.contract_value || 0).toLocaleString()}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Progress</span>
                        <span className="text-[9px] font-black font-mono">{Math.round((totalInvoiced / (Number(collection.contract_value) || 1)) * 100)}%</span>
                    </div>
                </div>

                <div className="ms-card p-6 border-ms-black/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Revenue Collected</p>
                    <p className="text-2xl font-bold font-serif italic mt-2 text-ms-black">
                        {collection.currency} {totalCollected.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-ms-gray opacity-60 mt-2">
                        {invoices.filter(i => i.status === 'PAID').length} of {invoices.length} milestones paid
                    </p>
                </div>

                {user?.role === 'ADMIN' ? (
                    <>
                        <div className="ms-card p-6 border-ms-black/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Project Spend (COGS)</p>
                            <p className={cn(
                                "text-2xl font-bold font-serif italic mt-2",
                                totalActualSpend > expectedSpend && expectedSpend > 0 ? "text-red-600" : "text-ms-black"
                            )}>
                                {collection.currency} {totalActualSpend.toLocaleString()}
                            </p>
                            <p className="text-[10px] font-bold text-ms-gray opacity-60 mt-2">
                                Across {costs.length} cost entries
                            </p>
                        </div>

                        <div className={cn(
                            "ms-card p-6 border-ms-black/10",
                            marginPct < 30 ? "bg-orange-50/50" : "bg-ms-beige/30"
                        )}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-black">Actual Project Margin</p>
                            <p className="text-2xl font-bold font-serif italic mt-2 text-ms-black">
                                {marginPct.toFixed(1)}%
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1 bg-ms-black/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-ms-black" style={{ width: `${Math.max(0, Math.min(100, marginPct))}%` }} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="ms-card p-6 border-ms-black/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray">Outstanding Balance</p>
                            <p className="text-2xl font-bold font-serif italic mt-2 text-orange-600">
                                {collection.currency} {(totalInvoiced - totalCollected).toLocaleString()}
                            </p>
                            <p className="text-[10px] font-bold text-ms-gray opacity-60 mt-2">
                                Invoiced and pending
                            </p>
                        </div>
                        <div className="ms-card p-6 border-ms-black/10 bg-ms-beige/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-black">Pending Milestones</p>
                            <p className="text-2xl font-bold font-serif italic mt-2 text-ms-black">
                                {invoices.filter(i => i.status !== 'PAID').length}
                            </p>
                            <p className="text-[10px] font-bold text-ms-gray opacity-60 mt-2">
                                Upcoming requirements
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Billing Milestones
                    </h3>
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="ms-button-secondary py-2 px-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                            {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Milestone</>}
                        </button>
                    )}
                </div>

                {user?.role === 'CLIENT' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Payment Process</p>
                            <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                                Once you have settled a milestone payment via bank transfer or your preferred method, click <strong>"Mark as Sent"</strong>.
                                Our finance team will verify the transaction and update your status to <strong>"Paid"</strong> within 24 hours.
                            </p>
                        </div>
                    </div>
                )}

                {isAdding && (
                    <form onSubmit={handleAdd} className="ms-card p-8 space-y-6 border-ms-black animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Milestone / Invoice Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 50% Advance"
                                    className="w-full border border-ms-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                    value={form.milestone_name}
                                    onChange={e => setForm({ ...form, milestone_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Amount ({collection.currency})</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full border border-ms-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-ms-gray">Due Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-ms-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                    value={form.due_date}
                                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full ms-button-primary bg-ms-black h-[46px] flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create Invoice
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    {visibleInvoices.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed border-ms-border rounded-2xl bg-ms-beige/5">
                            <DollarSign className="w-12 h-12 text-ms-gray/20 mx-auto mb-4" />
                            <p className="text-sm font-bold text-ms-black">No billing milestones created</p>
                            <p className="text-[10px] text-ms-gray font-black uppercase tracking-widest mt-2 opacity-50">Add advance payments or completion milestones</p>
                        </div>
                    ) : (
                        visibleInvoices.map(inv => (
                            <div
                                key={inv.id}
                                onClick={() => setSelectedInvoice(inv)}
                                className="ms-card p-6 flex items-center justify-between group hover:border-ms-black transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-ms-beige/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center",
                                        inv.status === 'PAID' ? "bg-green-50 text-green-600" :
                                            inv.status === 'PENDING' ? "bg-blue-50 text-blue-600" :
                                                "bg-ms-beige text-ms-gray"
                                    )}>
                                        <DollarSign className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-ms-black">{inv.milestone_name}</h4>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Due {new Date(inv.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-ms-border" />
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                                inv.status === 'PAID' ? "bg-green-50 text-green-700" :
                                                    inv.status === 'PENDING' ? "bg-blue-50 text-blue-700" :
                                                        "bg-orange-50 text-orange-700"
                                            )}>
                                                {inv.status === 'PENDING' ? 'VERIFYING' : inv.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="text-right hidden md:block border-r border-ms-border pr-8 mr-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mb-1 opacity-60">Action</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-black hover:underline underline-offset-4">View Invoice →</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-ms-black font-mono">
                                            {collection.currency} {Number(inv.amount).toLocaleString()}
                                        </p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-50 mt-1">
                                            INVOICE VAL.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 relative z-10" onClick={e => e.stopPropagation()}>
                                        {user?.role === 'CLIENT' ? (
                                            inv.status === 'PAID' ? (
                                                <span className="px-4 py-2 border border-green-100 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                    Paid
                                                </span>
                                            ) : inv.status === 'PENDING' ? (
                                                <span className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                    Verifying...
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusUpdate(inv.id, 'PENDING')}
                                                    disabled={updatingId === inv.id}
                                                    className="px-4 py-2 bg-ms-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-ms-black/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {updatingId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    Mark as Sent
                                                </button>
                                            )
                                        ) : (
                                            <>
                                                {inv.status === 'PENDING' ? (
                                                    <button
                                                        onClick={() => handleStatusUpdate(inv.id, 'PAID')}
                                                        disabled={updatingId === inv.id}
                                                        className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {updatingId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        Verify Payment
                                                    </button>
                                                ) : inv.status !== 'PAID' ? (
                                                    <button
                                                        onClick={() => handleStatusUpdate(inv.id, 'PAID')}
                                                        className="px-4 py-2 bg-ms-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-ms-black/80 transition-colors flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Mark Paid
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusUpdate(inv.id, 'UNPAID')}
                                                        className="px-4 py-2 border border-ms-border text-ms-gray text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-ms-beige transition-colors"
                                                    >
                                                        Undo Paid
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="p-2 text-ms-gray hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedInvoice && (
                <InvoiceModal
                    invoice={selectedInvoice}
                    collection={collection}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
}
