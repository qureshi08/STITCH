# STITCH – Development & UX Standards (Enterprise v2.0)

### 1. Application Layout & Navigation
```text
/app
  /page.tsx               # High-level Studio overview (Admin) / Selection Hub (Client)
  /collections            # Collection Management
    /[id]                 # Collection Hub (Strategy, Finance, Timeline)
    /[id]/garments
      /[garmentId]        # The PLM Cockpit (9-Stage Tabbed View)
  /finance                # The ERP Ledger (AR/AP/Cashflow)
  /vendors                # Supplier Relationship Management
  /settings               # User & Org Management
```

### 2. Design System: "Boutique Industrial"
*   **Aesthetic**: Premium, minimalist, high-contrast. Minimal rounding, fine-line borders (0.5px), large typography for headers.
*   **Colors**:
    *   **Ebony**: `#0A0A0A`
    *   **Canvas**: `#F5F2ED`
    *   **Primary Green**: `#0D9488` (Teal-tinted for Professionalism)
    *   **Warning Gold**: `#B45309` (Variance Alerts)

### 3. PLM Module UX (The "No Scroll" Rule)
Each garment stage uses a standard **Tabbed Interface** within the `/garments/[garmentId]` page:

| Tab | Content | Component Strategy |
| :--- | :--- | :--- |
| **Strategy** | Drop type, Timeline, Status | Static Info Cards + Milestone Stepper |
| **Design** | Sketches, Flats, Flats | Cloudinary Gallery + Drawers for Notes |
| **Pattern** | Pattern V1/V2, Grading | File Upload List + Version History |
| **Tech Pack** | BOM, Measurements | Paginated Tables + Spec Builder |
| **Sampling** | Revision Logs, Proto Photos | Timeline Feed + Checkbox Sign-offs |
| **Costing** | Cost Centers, Variances | Locked Tables (Admin Only) |
| **Production** | Batches, Wastage | Gauge Charts + Inline Batch Edit |
| **QC** | Testing Reports, Final Seal | PDF Viewer + Pass/Fail Toggle |

### 4. Real-time Communication
*   **Activity Feed**: A sidebar present on all Garment and Collection pages.
*   **Notifications**: Supabase Realtime-powered toast notifications for "Stage Approved" or "Invoice Overdue."
*   **Comment Thread**: Scoped to the individual garment/module to keep feedback technical.

### 5. Performance Engineering
*   **Server Components**: Fetching the core Collection/Garment metadata.
*   **Optimistic UI**: Applying stage changes locally before the Supabase transaction completes.
*   **Cashing Strategy**: Use `lib/api.ts` to maintain a local mirror of the active collection for instant lateral navigation between garments.
