# STITCH – Fashion Collection Operating System
## Master Business & Product Definition (Enterprise v2.0)

**Project Lead:** Muhammad Anas  
**Owner:** Maryam Shahid (MS)  
**Classification:** Professional Internal ERP + Technical PLM

---

### 1. Vision & Strategy
STITCH is an enterprise-grade operating system designed to digitize the manual pre-production workflows of professional fashion houses. It bridges the gap between creative design (Illustration), technical engineering (Pattern/Tech Pack), and financial management (ERP). 

**Core Principle:** No manual data silos. Every garment is a technical asset with a live financial identity.

---

### 2. Dual-Role RBAC (Role-Based Access Control)
The system is built on a strict "Privacy by Default" multi-tenant architecture. Only two authenticated states exist:

| Role | Responsibility | Data Visibility |
| :--- | :--- | :--- |
| **Admin (Maryam)** | Studio Owner | Unlimited control: Financials, Stage Locking, Cost Variance, Vendor Management, Client Onboarding. |
| **Client** | Brand Partner | Milestone view, approved files only, progress tracking. No internal cost centers. |

---

### 3. The 9-Stage PLM Workflow
Nothing is skipped. Success requires moving through the "Technical Gate" of each stage:

1.  **ILLUSTRATION**: Creative concept locking. Sketch-to-spec transition.
2.  **PATTERN**: Engineering the shape. Versioned DXF/PDF pattern uploads & grading.
3.  **TECH PACK**: The "Garment Bible." measurement tables, BOM, trim specs, iron/fold notes.
4.  **SAMPLING**: Proto -> Fit -> PPS. Detailed revision logging with photo history.
5.  **PRE-PRODUCTION**: The final audit. Measurement tolerance checks & fabric shrinkage tests.
6.  **PRODUCTION**: Bulk batching. Batches by size, daily progress %, rework logs.
7.  **QC (Quality Control)**: Measurement verification & stitch audit reports.
8.  **PACKAGING**: Care labels, final counts, and dispatch verification.
9.  **DELIVERED**: Archival of technical data and project closure.

---

### 4. Integrated Finance (ERP Architecture)
Finance is not a separate module; it is the "Nervous System" of the garments.

*   **Garment-Level Cost Centers**: Every SKU tracks Fabric, Trims, Labor, and Overheads.
*   **Variance Engine**: Real-time alerts when `Actual Cost` exceeds `Estimated Cost` during sampling.
*   **Dual-Ledger Ledger**:
    *   **Accounts Receivable**: Automated client billing tied to collection milestones.
    *   **Accounts Payable**: Track liabilities to fabric mills, tailors, and shipping partners.
*   **Net Position**: Live calculation of total collection margin and studio cash flow.

---

### 5. Technical Specification

*   **Logic Engine**: Next.js 15 (Single Source of Truth) with TypeScript.
*   **Data Kernel**: Supabase Realtime (Stage updates reflect across CEO and Client portals instantly).
*   **Security Foundation**: Postgres Row Level Security (RLS). Clients are physically blocked from the `cost_entries` and `vendor_invoices` tables at the database level.
*   **Digital Assets**:
    *   **Supabase Storage**: DXF patterns, Technical PDFs, Spec sheets.
    *   **Cloudinary CDN**: Optimized delivery of illustrations, fit photos, and product flats.

---

### 6. UX Philosophy: "The Studio cockpit"
*   **Tab-Based Logic**: No scrolling chaos. Each garment is managed in a dashboard-within-a-dashboard environment.
*   **Critical Gatelocking**: Production stages are locked until the Admin (Maryam) signs off on the "PPS" (Pre-production Sample).
*   **Real-time Collaboration**: Dedicated comment threads per garment ensure feedback isn't lost in email chains.

---

### 7. SaaS Foundation
Although for internal use, the schema is SaaS-ready. It supports unlimited `organizations`, each with their own isolated data, users, and brand identity settings.
