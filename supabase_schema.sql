-- ============================================================
-- STITCH OS – ENTERPRISE FASHION PLM DATABASE
-- Production Schema v2.1 | Maryam Shahid Studio
-- Compatible with: anonymous anon key + mock auth
-- Run this ONCE in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: CLEAN SLATE (Drop everything safely)
-- ============================================================
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS salary_payments CASCADE;
DROP TABLE IF EXISTS salary_contracts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS qc_reports CASCADE;
DROP TABLE IF EXISTS production_batches CASCADE;
DROP TABLE IF EXISTS vendor_invoices CASCADE;
DROP TABLE IF EXISTS client_invoices CASCADE;
DROP TABLE IF EXISTS cost_entries CASCADE;
DROP TABLE IF EXISTS sampling_logs CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS garments CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS collection_assignments CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS garment_stage CASCADE;

-- ============================================================
-- STEP 2: ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT');

CREATE TYPE garment_stage AS ENUM (
    'ILLUSTRATION',
    'PATTERN',
    'TECH_PACK',
    'SAMPLING',
    'PRE_PRODUCTION',
    'PRODUCTION',
    'QC',
    'PACKAGING',
    'DELIVERED'
);

-- ============================================================
-- STEP 3: ORGANIZATIONS (Multi-Tenancy Root)
-- ============================================================
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    brand_identity JSONB DEFAULT '{"colors": {"primary": "#0A0A0A", "accent": "#F5F2ED"}, "logo_url": null}',
    subscription_plan TEXT DEFAULT 'ENTERPRISE',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Maryam's studio with a FIXED UUID (used in auth.tsx)
INSERT INTO organizations (id, name, subscription_plan)
VALUES ('11111111-1111-1111-1111-111111111111', 'Maryam Shahid Studio', 'ENTERPRISE')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 4: ORGANIZATION MEMBERS (RBAC)
-- ============================================================
CREATE TABLE organization_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    role            user_role NOT NULL DEFAULT 'CLIENT',
    name            TEXT,
    email           TEXT,
    company         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ============================================================
-- STEP 5: COLLECTIONS (ERP Strategy Layer)
-- ============================================================
CREATE TABLE collections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    status              TEXT DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, COMPLETED

    -- Strategy
    season              TEXT,
    target_audience     TEXT,
    price_positioning   TEXT, -- Bridge, Premium, Luxury, Couture
    drop_type           TEXT,
    complexity_level    TEXT,

    -- Finance (ERP Core)
    contract_value      NUMERIC(15,2) DEFAULT 0,
    target_margin_pct   NUMERIC(5,2)  DEFAULT 60.00,
    currency            TEXT DEFAULT 'USD',
    billing_model       TEXT DEFAULT 'CONTRACT', -- CONTRACT, SALARY

    -- Timeline
    start_date          DATE,
    end_date            DATE,
    milestones          JSONB DEFAULT '[]',

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 6: GARMENTS (PLM Technical Kernel)
-- ============================================================
CREATE TABLE garments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    collection_id   UUID REFERENCES collections(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    sku             TEXT UNIQUE NOT NULL,
    category        TEXT, -- Dress, Top, Trouser, Outerwear, etc.
    current_stage   garment_stage DEFAULT 'ILLUSTRATION',
    is_locked       BOOLEAN DEFAULT FALSE,

    -- Tech Data
    measurement_table   JSONB DEFAULT '{}',
    bom_data            JSONB DEFAULT '[]', -- Bill of Materials
    tech_pack_url       TEXT,
    pattern_file_url    TEXT,
    thumbnail_url       TEXT,
    notes               TEXT,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 7: FILES (Cloud Document Store)
-- ============================================================
CREATE TABLE files (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- collection, garment, sample, production
    entity_id   UUID NOT NULL,
    file_name   TEXT NOT NULL,
    file_type   TEXT, -- image, pdf, dxf, video
    url         TEXT NOT NULL, -- Cloudinary or Supabase Storage URL
    uploaded_by TEXT,
    size_bytes  BIGINT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 8: VENDORS & SUPPLY CHAIN
-- ============================================================
CREATE TABLE vendors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    category        TEXT, -- FABRIC, TRIMS, LABOR, PACKAGING, LOGISTICS
    contact_name    TEXT,
    contact_email   TEXT,
    lead_time_days  INTEGER DEFAULT 0,
    moq_units       INTEGER DEFAULT 0,
    cost_per_unit   NUMERIC(15,2) DEFAULT 0,
    is_approved     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 9: SAMPLING & FIT LIFECYCLE
-- ============================================================
CREATE TABLE sampling_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    garment_id      UUID REFERENCES garments(id) ON DELETE CASCADE,
    sample_type     TEXT NOT NULL, -- PROTO, FIT, PPS
    version         INTEGER DEFAULT 1,
    tailor_assigned TEXT,
    fit_feedback    TEXT,
    revision_notes  TEXT,
    photo_urls      TEXT[] DEFAULT '{}',
    is_approved     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 10: COST CENTERS (Garment-Level Financial Control)
-- ============================================================
CREATE TABLE cost_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    garment_id      UUID REFERENCES garments(id) ON DELETE CASCADE,
    category        TEXT NOT NULL, -- FABRIC, TRIMS, LABOR, SAMPLING, PRODUCTION, PACKAGING, OVERHEAD
    estimated_cost  NUMERIC(15,2) DEFAULT 0,
    actual_cost     NUMERIC(15,2) DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 11: FINANCIALS – CLIENT INVOICES (Receivables)
-- ============================================================
CREATE TABLE client_invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    collection_id       UUID REFERENCES collections(id) ON DELETE CASCADE,
    milestone_name      TEXT NOT NULL,
    amount              NUMERIC(15,2) NOT NULL,
    due_date            DATE NOT NULL,
    status              TEXT DEFAULT 'UNPAID', -- UNPAID, PAID, OVERDUE, PENDING
    is_visible_to_client BOOLEAN DEFAULT TRUE,
    paid_date           DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 12: FINANCIALS – VENDOR INVOICES (Payables)
-- ============================================================
CREATE TABLE vendor_invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id       UUID REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name     TEXT, -- Denormalized for reference
    vendor_type     TEXT, -- FABRIC, TRIMS, LABOR, LOGISTICS
    amount          NUMERIC(15,2) NOT NULL,
    status          TEXT DEFAULT 'PENDING', -- PENDING, PAID, OVERDUE
    due_date        DATE,
    paid_date       DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 13: PRODUCTION BATCHES
-- ============================================================
CREATE TABLE production_batches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    garment_id          UUID REFERENCES garments(id) ON DELETE CASCADE,
    batch_number        INTEGER DEFAULT 1,
    quantity_total      INTEGER NOT NULL DEFAULT 0,
    quantity_by_size    JSONB DEFAULT '{}', -- {"XS": 10, "S": 20, "M": 30}
    progress_pct        INTEGER DEFAULT 0,
    defect_rate         NUMERIC(5,2) DEFAULT 0,
    rework_count        INTEGER DEFAULT 0,
    fabric_wastage_pct  NUMERIC(5,2) DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 14: SALARY CONTRACTS (Retainers)
-- ============================================================
CREATE TABLE salary_contracts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    collection_id       UUID UNIQUE REFERENCES collections(id) ON DELETE CASCADE,
    monthly_salary      NUMERIC(15,2) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE,
    status              TEXT DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, COMPLETED
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 15: SALARY PAYMENTS
-- ============================================================
CREATE TABLE salary_payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salary_contract_id  UUID NOT NULL REFERENCES salary_contracts(id) ON DELETE CASCADE,
    month               TEXT NOT NULL, -- e.g. "2026-02"
    amount_paid         NUMERIC(15,2) DEFAULT 0,
    payment_date        DATE,
    status              TEXT DEFAULT 'PENDING', -- PENDING, PAID
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 16: PROJECT EXPENSES (Reimbursements)
-- ============================================================
CREATE TABLE expenses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    collection_id       UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    category            TEXT NOT NULL,
    description         TEXT,
    vendor_name         TEXT,
    amount              NUMERIC(15,2) NOT NULL,
    invoice_url         TEXT,
    incurred_date       DATE DEFAULT CURRENT_DATE,
    reimbursement_status TEXT DEFAULT 'PENDING', -- PENDING, REIMBURSED
    reimbursement_date  DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 17: QC REPORTS
-- ============================================================
CREATE TABLE qc_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    garment_id      UUID REFERENCES garments(id) ON DELETE CASCADE,
    batch_id        UUID REFERENCES production_batches(id) ON DELETE SET NULL,
    inspector_name  TEXT,
    checks_passed   JSONB DEFAULT '[]', -- ["Stitching", "Measurement", "Finishing"]
    result          TEXT DEFAULT 'PENDING', -- PASSED, REJECTED, REWORK
    notes           TEXT,
    report_url      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 15: COMMENTS (Collaboration)
-- ============================================================
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL, -- collection, garment, sample
    entity_id       UUID NOT NULL,
    author_name     TEXT NOT NULL,
    author_role     TEXT NOT NULL, -- ADMIN, CLIENT
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 16: AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL,  -- TEXT to store mock user ID
    user_name       TEXT,
    action          TEXT NOT NULL,  -- e.g., "COLLECTION_CREATED", "STAGE_LOCKED"
    entity_type     TEXT,
    entity_id       UUID,
    payload         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 17: USER PROFILES (Extended metadata for auth users)
-- ============================================================
CREATE TABLE user_profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT,
    company     TEXT,
    location    TEXT,
    phone       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 18: COLLECTION CLIENT ASSIGNMENTS
-- Which clients can see which collections
-- ============================================================
CREATE TABLE collection_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id   UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    can_view_costs  BOOLEAN DEFAULT FALSE,
    assigned_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, user_id)
);

-- ============================================================
-- STEP 19: NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL, -- Target user
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    type            TEXT DEFAULT 'INFO', -- INFO, SUCCESS, WARNING, ERROR
    link            TEXT, -- Where to redirect on click
    metadata        JSONB DEFAULT '{}',
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 20: ROW LEVEL SECURITY
-- NOTE: Using permissive policies for anon key since we're 
-- using mock auth. In Production with real Supabase Auth,
-- replace these with auth.uid() checks.
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sampling_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE POLICIES (Anon key access – works with mock auth)
-- These allow all operations from the anon client.
CREATE POLICY "Allow all for anon" ON organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON garments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON client_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON vendor_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON cost_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON sampling_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON production_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON qc_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON organization_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON collection_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON salary_contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON salary_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- STEP 21: REALTIME SUBSCRIPTIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE collections, garments, sampling_logs, client_invoices, comments, notifications;

-- ============================================================
-- STEP 22: SUPABASE STORAGE BUCKET
-- Run this separately if it fails (storage is separate from DB)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('stitch-files', 'stitch-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads and reads on the bucket
-- Drop policies first to avoid conflicts if re-running
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete by uploader" ON storage.objects;

CREATE POLICY "Allow all uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'stitch-files');

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'stitch-files');

CREATE POLICY "Allow delete by uploader" ON storage.objects
  FOR DELETE USING (bucket_id = 'stitch-files');

-- ============================================================
-- STEP 23: AUTO-CREATE ORG MEMBER ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role, name, email)
  VALUES (
    '11111111-1111-1111-1111-111111111111', 
    NEW.id, 
    'CLIENT',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (organization_id, user_id) 
  DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
