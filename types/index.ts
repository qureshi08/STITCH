
export type UserRole = 'ADMIN' | 'CLIENT';

export type StageStatus = 'pending' | 'in-progress' | 'revision' | 'approved' | 'blocked';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'OVERDUE' | 'PENDING';
export type BillingModel = 'CONTRACT' | 'SALARY';

export type GarmentStage =
  | 'ILLUSTRATION'
  | 'PATTERN'
  | 'TECH_PACK'
  | 'SAMPLING'
  | 'PRE_PRODUCTION'
  | 'PRODUCTION'
  | 'QC'
  | 'PACKAGING'
  | 'DELIVERED';

export interface Organization {
  id: string;
  name: string;
  brand_identity: {
    colors: { primary: string; accent: string };
    logo_url: string | null;
  };
  subscription_plan: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization_id: string;
}

export interface Collection {
  id: string;
  organization_id: string;
  name: string;
  status: string;
  season?: string;
  target_audience?: string;
  price_positioning?: string;
  drop_type?: string;
  complexity_level?: string;
  contract_value: number;
  target_margin_pct: number;
  currency: string;
  billing_model: BillingModel;
  start_date?: string;
  end_date?: string;
  milestones: any[];
  created_at: string;
  updated_at?: string;
}

export interface Garment {
  id: string;
  collection_id: string;
  organization_id: string;
  name: string;
  sku: string;
  category: string;
  current_stage: GarmentStage;
  is_locked: boolean;
  measurement_table: any;
  bom_data: any[];
  tech_pack_url?: string;
  pattern_file_url?: string;
  thumbnail_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CostCenter {
  id: string;
  garment_id: string;
  organization_id: string;
  category: string;
  estimated_cost: number;
  actual_cost: number;
  notes?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  contact_name?: string;
  contact_email?: string;
  lead_time_days: number;
  moq_units: number;
  cost_per_unit: number;
  is_approved: boolean;
  created_at: string;
}

export interface ClientInvoice {
  id: string;
  organization_id: string;
  collection_id: string;
  milestone_name: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  is_visible_to_client: boolean;
  paid_date?: string;
  created_at: string;
}

export interface VendorInvoice {
  id: string;
  organization_id: string;
  vendor_id?: string;
  vendor_name?: string;
  vendor_type?: string;
  amount: number;
  status: PaymentStatus;
  due_date: string;
  paid_date?: string;
  created_at: string;
}

export interface SamplingLog {
  id: string;
  organization_id: string;
  garment_id: string;
  sample_type: string; // PROTO | FIT | PPS
  version: number;
  tailor_assigned?: string;
  fit_feedback?: string;
  revision_notes?: string;
  photo_urls: string[];
  is_approved: boolean;
  created_at: string;
}

export interface FileRecord {
  id: string;
  organization_id: string;
  entity_type: string; // collection | garment | sample | production
  entity_id: string;
  file_name: string;
  file_type?: string; // image | pdf | dxf | video
  url: string;
  uploaded_by?: string;
  size_bytes?: number;
  created_at: string;
}

export interface ProductionBatch {
  id: string;
  organization_id: string;
  garment_id: string;
  batch_number: number;
  quantity_total: number;
  quantity_by_size: Record<string, number>;
  progress_pct: number;
  defect_rate: number;
  rework_count: number;
  fabric_wastage_pct: number;
  notes?: string;
  created_at: string;
}

export interface QCReport {
  id: string;
  organization_id: string;
  garment_id: string;
  batch_id?: string;
  inspector_name?: string;
  checks_passed: string[];
  result: 'PENDING' | 'PASSED' | 'REJECTED' | 'REWORK';
  notes?: string;
  report_url?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_id: string;
  author_name: string;
  author_role: UserRole;
  content: string;
  created_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  // Extended profile (stored in users table or metadata)
  name?: string;
  email?: string;
  company?: string;
  location?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  content: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

export interface SalaryContract {
  id: string;
  organization_id: string;
  collection_id: string;
  monthly_salary: number;
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  created_at: string;
}

export interface SalaryPayment {
  id: string;
  salary_contract_id: string;
  month: string;
  amount_paid: number;
  payment_date?: string;
  status: 'PENDING' | 'PAID';
  created_at: string;
}

export interface ProjectExpense {
  id: string;
  organization_id: string;
  collection_id: string;
  category: string;
  description?: string;
  vendor_name?: string;
  amount: number;
  invoice_url?: string;
  incurred_date: string;
  reimbursement_status: 'PENDING' | 'REIMBURSED';
  reimbursement_date?: string;
  created_at: string;
}
