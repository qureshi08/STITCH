
import { supabase } from './supabase';

export async function seedProjectData(orgId: string) {
    try {
        // 1. Create a sample collection
        const { data: collection, error: collError } = await supabase
            .from('collections')
            .insert([
                {
                    organization_id: orgId,
                    name: 'Spring/Summer 2026',
                    season: 'SS26',
                    target_audience: 'Premium Boutique',
                    price_positioning: 'Luxury',
                    status: 'in-progress',
                    contract_value: 125000,
                    target_margin_pct: 65,
                    total_receivable: 85000,
                    total_payable: 15000,
                    currency: 'USD'
                }
            ])
            .select()
            .single();

        if (collError) throw collError;

        if (collection) {
            // 2. Create sample garments
            await supabase
                .from('garments')
                .insert([
                    {
                        collection_id: collection.id,
                        organization_id: orgId,
                        name: 'Silk Drape Gown',
                        sku: 'SS26-GOWN-01',
                        category: 'Dresses',
                        status: 'in-progress',
                        current_module: 3,
                        cost_estimate: 450,
                        cost_actual: 480
                    },
                    {
                        collection_id: collection.id,
                        organization_id: orgId,
                        name: 'Signature Blazer V2',
                        sku: 'SS26-BLZ-04',
                        category: 'Outerwear',
                        status: 'approved',
                        current_module: 8,
                        cost_estimate: 320,
                        cost_actual: 310
                    }
                ]);

            // 3. Create sample invoices
            await supabase
                .from('client_invoices')
                .insert([
                    {
                        organization_id: orgId,
                        collection_id: collection.id,
                        milestone_name: 'Project Advance',
                        amount: 35000,
                        due_date: new Date().toISOString(),
                        status: 'paid'
                    },
                    {
                        organization_id: orgId,
                        collection_id: collection.id,
                        milestone_name: 'Technical Approval',
                        amount: 25000,
                        due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
                        status: 'unpaid'
                    }
                ]);
        }

        return collection;
    } catch (err) {
        console.warn("STITCH Seed Bypass: Database schema is still propagating. Falling back to local state.", err);
        return null;
    }
}

