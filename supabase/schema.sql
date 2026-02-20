
-- MS STUDIO OS: ERP + PLM DATABASE SCHEMA
-- Multi-tenant, Financial-centric, RBAC-ready

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subscription_plan TEXT DEFAULT 'basic',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users (Profile metadata, Auth handled by Supabase)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Organization Members (RBAC Junction)
CREATE TABLE organization_members (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'STUDIO_ADMIN', 'PRODUCTION_MANAGER', 'PATTERN_MASTER', 'FINANCE_MANAGER', 'CLIENT')),
    PRIMARY KEY (organization_id, user_id)
);

-- 5. Collections
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    season TEXT,
    status TEXT DEFAULT 'pending',
    
    -- Financial Targets
    contract_value DECIMAL(12,2) DEFAULT 0,
    target_margin_pct DECIMAL(5,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Garments (PLM Items)
CREATE TABLE garments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT,
    status TEXT DEFAULT 'pending',
    current_module INTEGER DEFAULT 1,
    
    -- Financial Tracking
    cost_estimate DECIMAL(12,2) DEFAULT 0,
    cost_actual DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Cost Centers (Granular Financials)
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_id UUID REFERENCES garments(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vendor Invoices (Accounts Payable)
CREATE TABLE vendor_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL, -- Links to a vendors table if needed
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT DEFAULT 'unpaid',
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Client Invoices (Accounts Receivable)
CREATE TABLE client_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    module TEXT,
    entity_id UUID,
    old_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Get Organization for User
CREATE OR REPLACE FUNCTION get_user_orgs()
RETURNS TABLE (organization_id UUID) AS $$
BEGIN
    RETURN QUERY SELECT om.organization_id FROM organization_members om WHERE om.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies: Access restricted to organization members
CREATE POLICY "Users can only see their orgs" ON organizations 
FOR SELECT USING (id IN (SELECT get_user_orgs()));

CREATE POLICY "Org members can see collections" ON collections 
FOR ALL USING (organization_id IN (SELECT get_user_orgs()));

CREATE POLICY "Org members can see garments" ON garments 
FOR ALL USING (organization_id IN (SELECT get_user_orgs()));

CREATE POLICY "Finance managers and admin can see invoices" ON vendor_invoices 
FOR ALL USING (
    organization_id IN (SELECT get_user_orgs()) AND 
    EXISTS (
        SELECT 1 FROM organization_members 
        WHERE user_id = auth.uid() 
        AND organization_id = vendor_invoices.organization_id 
        AND role IN ('STUDIO_ADMIN', 'FINANCE_MANAGER', 'SUPER_ADMIN')
    )
);
-- (Add more specific RBAC policies here)
