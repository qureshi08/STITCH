
import { supabase } from './supabase';
import {
    Collection,
    Garment,
    ClientInvoice,
    VendorInvoice,
    CostCenter,
    Vendor,
    SamplingLog,
    FileRecord,
    ProductionBatch,
    QCReport,
    Comment,
    AppNotification,
    SalaryContract,
    SalaryPayment,
    ProjectExpense
} from '@/types';

// ============================================================
// COLLECTIONS
// ============================================================

export async function getCollections(orgId: string, role?: string, userId?: string): Promise<Collection[]> {
    let query = supabase
        .from('collections')
        .select('*')
        .eq('organization_id', orgId);

    // If it's a client, only show collections they are assigned to
    if (role === 'CLIENT' && userId) {
        const { data: assignments } = await supabase
            .from('collection_assignments')
            .select('collection_id')
            .eq('user_id', userId);

        const ids = (assignments || []).map(a => a.collection_id);
        if (ids.length === 0) return [];
        query = query.in('id', ids);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data as Collection[];
}

export async function getCollectionDetail(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
    if (error) { console.error(error); return null; }
    return data as Collection;
}

export async function createCollection(collection: Partial<Collection>): Promise<Collection | null> {
    const { data, error } = await supabase
        .from('collections')
        .insert([collection])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as Collection;
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<boolean> {
    const { error } = await supabase
        .from('collections')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

export async function deleteCollection(id: string): Promise<boolean> {
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// GARMENTS (PLM Core)
// ============================================================

export async function getCollectionGarments(collectionId: string): Promise<Garment[]> {
    const { data, error } = await supabase
        .from('garments')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data as Garment[];
}

export async function getGarmentDetail(id: string): Promise<Garment | null> {
    const { data, error } = await supabase
        .from('garments')
        .select('*')
        .eq('id', id)
        .single();
    if (error) { console.error(error); return null; }
    return data as Garment;
}

export async function createGarment(garment: Partial<Garment>): Promise<Garment | null> {
    const { data, error } = await supabase
        .from('garments')
        .insert([garment])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as Garment;
}

export async function updateGarment(id: string, updates: Partial<Garment>): Promise<boolean> {
    const { error } = await supabase
        .from('garments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

export async function deleteGarment(id: string): Promise<boolean> {
    const { error } = await supabase.from('garments').delete().eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// COST ENTRIES
// ============================================================

export async function getCostEntries(garmentId: string): Promise<CostCenter[]> {
    const { data, error } = await supabase
        .from('cost_entries')
        .select('*')
        .eq('garment_id', garmentId)
        .order('category');
    if (error) { console.error(error); return []; }
    return data as CostCenter[];
}

export async function getCollectionCostEntries(collectionId: string): Promise<CostCenter[]> {
    const { data: garments } = await supabase
        .from('garments')
        .select('id')
        .eq('collection_id', collectionId);

    const garmentIds = (garments || []).map(g => g.id);
    if (garmentIds.length === 0) return [];

    const { data, error } = await supabase
        .from('cost_entries')
        .select('*')
        .in('garment_id', garmentIds);

    if (error) { console.error(error); return []; }
    return data as CostCenter[];
}

export async function saveCostEntry(entry: Partial<CostCenter>): Promise<boolean> {
    const { error } = await supabase
        .from('cost_entries')
        .upsert([entry], { onConflict: 'id' });
    if (error) { console.error(error); return false; }
    return true;
}

export async function deleteCostEntry(id: string): Promise<boolean> {
    const { error } = await supabase.from('cost_entries').delete().eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// SAMPLING LOGS
// ============================================================

export async function getSamplingLogs(garmentId: string): Promise<SamplingLog[]> {
    const { data, error } = await supabase
        .from('sampling_logs')
        .select('*')
        .eq('garment_id', garmentId)
        .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data as SamplingLog[];
}

export async function createSamplingLog(log: Partial<SamplingLog>): Promise<SamplingLog | null> {
    const { data, error } = await supabase
        .from('sampling_logs')
        .insert([log])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as SamplingLog;
}

export async function updateSamplingLog(id: string, updates: Partial<SamplingLog>): Promise<boolean> {
    const { error } = await supabase
        .from('sampling_logs')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// CLIENT INVOICES (Receivables)
// ============================================================

export async function getClientInvoices(orgId: string, role?: string, userId?: string): Promise<ClientInvoice[]> {
    let query = supabase
        .from('client_invoices')
        .select('*')
        .eq('organization_id', orgId);

    // If it's a client, only show invoices for their collections
    if (role === 'CLIENT' && userId) {
        const { data: assignments } = await supabase
            .from('collection_assignments')
            .select('collection_id')
            .eq('user_id', userId);

        const ids = (assignments || []).map(a => a.collection_id);
        if (ids.length === 0) return [];
        query = query.in('collection_id', ids);
    }

    const { data, error } = await query.order('due_date', { ascending: true });
    if (error) { console.error(error); return []; }
    return data as ClientInvoice[];
}

export async function getCollectionMilestones(collectionId: string): Promise<ClientInvoice[]> {
    const { data, error } = await supabase
        .from('client_invoices')
        .select('*')
        .eq('collection_id', collectionId)
        .order('due_date', { ascending: true });
    if (error) { console.error(error); return []; }
    return data as ClientInvoice[];
}

export async function createClientInvoice(invoice: Partial<ClientInvoice>): Promise<ClientInvoice | null> {
    const { data, error } = await supabase
        .from('client_invoices')
        .insert([invoice])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as ClientInvoice;
}

export async function updateClientInvoice(id: string, updates: Partial<ClientInvoice>): Promise<boolean> {
    const { error } = await supabase
        .from('client_invoices')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

export async function deleteClientInvoice(id: string): Promise<boolean> {
    const { error } = await supabase.from('client_invoices').delete().eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// VENDOR INVOICES (Payables)
// ============================================================

export async function getVendorInvoices(orgId: string): Promise<VendorInvoice[]> {
    const { data, error } = await supabase
        .from('vendor_invoices')
        .select('*')
        .eq('organization_id', orgId)
        .order('due_date', { ascending: true });
    if (error) { console.error(error); return []; }
    return data as VendorInvoice[];
}

export async function createVendorInvoice(invoice: Partial<VendorInvoice>): Promise<VendorInvoice | null> {
    const { data, error } = await supabase
        .from('vendor_invoices')
        .insert([invoice])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as VendorInvoice;
}

export async function updateVendorInvoice(id: string, updates: Partial<VendorInvoice>): Promise<boolean> {
    const { error } = await supabase
        .from('vendor_invoices')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// PRODUCTION BATCHES
// ============================================================

export async function getProductionBatches(garmentId: string): Promise<ProductionBatch[]> {
    const { data, error } = await supabase
        .from('production_batches')
        .select('*')
        .eq('garment_id', garmentId)
        .order('batch_number');
    if (error) { console.error(error); return []; }
    return data as ProductionBatch[];
}

export async function createProductionBatch(batch: Partial<ProductionBatch>): Promise<ProductionBatch | null> {
    const { data, error } = await supabase
        .from('production_batches')
        .insert([batch])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as ProductionBatch;
}

export async function updateProductionBatch(id: string, updates: Partial<ProductionBatch>): Promise<boolean> {
    const { error } = await supabase
        .from('production_batches')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// QC REPORTS
// ============================================================

export async function getQCReports(garmentId: string): Promise<QCReport[]> {
    const { data, error } = await supabase
        .from('qc_reports')
        .select('*')
        .eq('garment_id', garmentId)
        .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data as QCReport[];
}

export async function createQCReport(report: Partial<QCReport>): Promise<QCReport | null> {
    const { data, error } = await supabase
        .from('qc_reports')
        .insert([report])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as QCReport;
}

export async function updateQCReport(id: string, updates: Partial<QCReport>): Promise<boolean> {
    const { error } = await supabase
        .from('qc_reports')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// COMMENTS
// ============================================================

export async function getComments(entityType: string, entityId: string): Promise<Comment[]> {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data as Comment[];
}

export async function createComment(comment: Partial<Comment>): Promise<Comment | null> {
    const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as Comment;
}

// ============================================================
// VENDORS
// ============================================================

export async function getVendors(orgId: string): Promise<Vendor[]> {
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('organization_id', orgId)
        .order('name');
    if (error) { console.error(error); return []; }
    return data as Vendor[];
}

export async function createVendor(vendor: Partial<Vendor>): Promise<Vendor | null> {
    const { data, error } = await supabase
        .from('vendors')
        .insert([vendor])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as Vendor;
}

export async function updateVendor(id: string, updates: Partial<Vendor>): Promise<boolean> {
    const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

// ============================================================
// DASHBOARD ANALYTICS
// ============================================================

// ============================================================
// MODEL 1 – SALARY & EXPENSES
// ============================================================

export async function getSalaryContract(collectionId: string): Promise<SalaryContract | null> {
    const { data, error } = await supabase
        .from('salary_contracts')
        .select('*')
        .eq('collection_id', collectionId)
        .single();
    if (error) return null;
    return data as SalaryContract;
}

export async function createSalaryContract(contract: Partial<SalaryContract>): Promise<SalaryContract | null> {
    const { data, error } = await supabase
        .from('salary_contracts')
        .insert([contract])
        .select();
    if (error) { console.error('Error creating salary contract:', error); return null; }
    return (data && data.length > 0) ? (data[0] as SalaryContract) : null;
}

export async function getSalaryPayments(contractId: string): Promise<SalaryPayment[]> {
    const { data, error } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('salary_contract_id', contractId)
        .order('month', { ascending: false });
    if (error) { console.error(error); return []; }
    return data as SalaryPayment[];
}

export async function createSalaryPayment(payment: Partial<SalaryPayment>): Promise<SalaryPayment | null> {
    const { data, error } = await supabase
        .from('salary_payments')
        .insert([payment])
        .select();
    if (error) { console.error('Error creating salary payment:', error); return null; }
    return (data && data.length > 0) ? (data[0] as SalaryPayment) : null;
}

export async function updateSalaryPayment(id: string, updates: Partial<SalaryPayment>): Promise<boolean> {
    const { error } = await supabase
        .from('salary_payments')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

export async function getProjectExpenses(collectionId: string): Promise<ProjectExpense[]> {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('collection_id', collectionId)
        .order('incurred_date', { ascending: false });
    if (error) { console.error(error); return []; }
    return data as ProjectExpense[];
}

export async function createProjectExpense(expense: Partial<ProjectExpense>): Promise<ProjectExpense | null> {
    const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select();
    if (error) { console.error('Error creating project expense:', error); return null; }
    return (data && data.length > 0) ? (data[0] as ProjectExpense) : null;
}

export async function updateProjectExpense(id: string, updates: Partial<ProjectExpense>): Promise<boolean> {
    const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

export async function deleteProjectExpense(id: string): Promise<boolean> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

export async function getDashboardStats(orgId: string, role?: string, userId?: string) {
    const [collections, invoices, salaryPayments, projectExpenses, vendorInvoices] = await Promise.all([
        getCollections(orgId, role, userId),
        getClientInvoices(orgId, role, userId),
        supabase.from('salary_payments').select('*').eq('status', 'PAID'),
        supabase.from('expenses').select('*').eq('organization_id', orgId),
        getVendorInvoices(orgId)
    ]);

    const sPayments = (salaryPayments.data || []) as SalaryPayment[];
    const pExpenses = (projectExpenses.data || []) as ProjectExpense[];

    const unpaid = invoices.filter(i => i.status !== 'PAID');
    const overdue = unpaid.filter(i => new Date(i.due_date) < new Date());
    const totalReceivable = unpaid.reduce((s, i) => s + Number(i.amount), 0);
    const totalContractValue = collections.reduce((s, c) => s + Number(c.contract_value || 0), 0);

    // Earnings from both models
    const invoiceEarnings = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.amount), 0);
    const salaryEarnings = sPayments.reduce((s, p) => s + Number(p.amount_paid), 0);
    const totalEarnings = invoiceEarnings + salaryEarnings;

    // Outflow from both models
    const vendorOutflow = vendorInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.amount), 0);
    const projectOutflow = pExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalOutflow = vendorOutflow + projectOutflow;

    return {
        activeCollections: collections.filter(c => c.status === 'ACTIVE').length,
        totalCollections: collections.length,
        totalContractValue,
        totalEarnings,
        totalOutflow,
        netLiquidity: totalEarnings - totalOutflow,
        overdueCount: overdue.length,
        totalReceivable,
        upcomingInvoices: unpaid
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 5),
    };
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Supabase Error (getNotifications):', error.message || error, error.code);
        return [];
    }
    return data as AppNotification[];
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    if (error) { console.error(error); return false; }
    return true;
}

export async function createNotification(notif: Partial<AppNotification>): Promise<AppNotification | null> {
    const { data, error } = await supabase
        .from('notifications')
        .insert([notif])
        .select()
        .single();
    if (error) { console.error(error); return null; }
    return data as AppNotification;
}
