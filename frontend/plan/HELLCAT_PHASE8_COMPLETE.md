# HELLCAT — PHASE 8: ADMIN & DATA OPERATIONS PROMPT

> Build the 7 admin pages + ReportsPage for the ULTRON Intelligence Suite.
> Phase: 8 of 10 | Focus: Admin dashboard, user/role management, data operations, audit, system health

---

## 0. CONTEXT

**Project root:** `D:\Datathon-2026-ULTRON\frontend`

Previous 7 phases are complete (Phases 0-7). All existing pages, components, mock data, and routes are in place.

### What's Already Built

All infrastructure from Phases 0-7: AppShell, shared components, Recharts, Leaflet, Cytoscape, React Flow, Lucide icons, tanstack/react-query, design tokens (`var(--color-gold)`, `var(--color-crime-red)`, etc.), glass-card theme, store pattern (`zustand`).

### What's Missing — Phase 8

**8 pages total — ALL are 2-line stubs using `createPlaceholderPage()`:**

| # | Page | Route | Permission |
|:-:|------|-------|------------|
| 1 | `SystemHealthPage.tsx` | `/admin/system-health` | `admin:health` |
| 2 | `AdminOverviewPage.tsx` | `/admin` | `admin:read` |
| 3 | `UserManagementPage.tsx` | `/admin/users` | `admin:users` |
| 4 | `RolePermissionsPage.tsx` | `/admin/roles` | `admin:roles` |
| 5 | `DataIngestionPage.tsx` | `/admin/data-ingestion` | `admin:data` |
| 6 | `DataQualityPage.tsx` | `/admin/data-quality` | `admin:data` |
| 7 | `AuditLogPage.tsx` | `/admin/audit-log` | `admin:audit` |
| 8 | `ReportsPage.tsx` | `/dashboard/reports` | (no permission) |

### Infrastructure That Does NOT Exist Yet

| Item | Status | Action Needed |
|------|--------|:-------------:|
| `features/admin/` directory | ❌ Doesn't exist | Create with `api/`, `hooks/`, `components/`, `pages/` |
| `features/data-ops/` directory | ❌ Doesn't exist | Create with `api/`, `hooks/`, `components/`, `pages/` |
| Admin mock data files | ❌ Doesn't exist | Create 5 mock JSON files |
| Admin mock handlers | ❌ Not in `handlers.ts` | Register all admin endpoints |
| Admin DTO adapters | ❌ Not created | `shared/api/dto-adapters/admin-adapters.ts` |
| Admin API module | ❌ Not created | `features/admin/api/adminApi.ts` |
| Admin hooks | ❌ Not created | `useUsers`, `useSystemHealth`, `useAuditLogs`, `useMlModelStatus`, `useDataIngestionJobs` |
| Admin shared components | ❌ Not created | `RoleMatrix`, `SystemHealthPanel`, `ServiceStatusCard`, `MlModelStatusCard`, `AuditLogTimeline`, `UsersTable` |
| Data Ops components | ❌ Not created | `BulkUploadDropzone`, `CSVPreviewTable`, `ScrapeSourceManager`, `ScrapeSourceCard`, `IngestionStatusPanel` |
| Reports components | ❌ Not created | Report list/generation panel |

---

## 1. HARD RULES

| Rule | Detail |
|------|--------|
| **Do NOT modify** | `globals.css`, `shared/layout/*`, `shared/ui-kit/*`, `shared/api/client.ts`, `stores/*` |
| **Do NOT modify** | Already-built pages, existing mock handlers (append only), existing routes |
| **Do NOT add new routes** — all 8 routes are pre-registered |
| **No new design tokens** | Use CSS variables only (gold, crime-red, crime-amber, cyber-cyan, network-purple, intel-violet, text-primary, text-secondary, text-muted, border, radius-2xl/xl/lg) |
| **No component duplication** | Check `src/shared/components/index.ts` first |
| **All 4 states** | `isLoading` → `ErrorState` → `EmptyState` → populated content on every page |
| **Icons** | Lucide icons only |
| **Types** | No `any` — use proper types or `unknown` with type guards |
| **Named exports** for all components, hooks, and pages |
| **Dark theme** — all cards use `glass-card` class |
| **Route permissions** are already enforced via the router — no need to add auth logic in pages |

---

## 2. BUILD ORDER

### Step 1: Mock Data (5 files in `src/mocks/`)

**`src/mocks/users.json`** — 10-15 users:
```json
[
  {
    "id": "USR-001",
    "name": "Arjun Sharma",
    "email": "arjun.sharma@ksp.gov.in",
    "role": "admin",
    "district": "Bengaluru Urban",
    "lastLogin": "2026-06-25T08:30:00Z",
    "status": "active",
    "createdAt": "2025-01-15T00:00:00Z"
  }
]
```
Roles: `admin`, `supervisor`, `analyst`, `viewer`, `sudo`
Status: `active`, `inactive`, `suspended`

**`src/mocks/system-services.json`** — 8-10 services:
```json
[
  {
    "id": "SVC-001",
    "name": "Crime Intelligence API",
    "type": "api",
    "status": "healthy",
    "latency": "45ms",
    "uptime": "99.8%",
    "lastChecked": "2026-06-25T10:00:00Z"
  }
]
```
Types: `api`, `database`, `ml-model`, `cache`, `queue`
Status: `healthy`, `degraded`, `down`

**`src/mocks/ml-models.json`** — 5-6 ML models:
```json
[
  {
    "id": "ML-001",
    "name": "Crime Risk Predictor",
    "algorithm": "Random Forest",
    "version": "2.1.0",
    "status": "healthy",
    "accuracy": 87.3,
    "lastTrained": "2026-06-20T00:00:00Z",
    "trainHistory": [
      { "date": "2026-06-20", "accuracy": 87.3 },
      { "date": "2026-06-15", "accuracy": 86.1 }
    ]
  }
]
```
Status: `healthy`, `training`, `degraded`, `down`

**`src/mocks/audit-logs.json`** — 20-30 audit entries:
```json
[
  {
    "id": "AUD-001",
    "timestamp": "2026-06-25T09:15:00Z",
    "actor": "Arjun Sharma",
    "actorId": "USR-001",
    "action": "USER_ROLE_CHANGE",
    "target": "USR-003",
    "details": "Changed role from analyst to supervisor",
    "ip": "10.0.1.45",
    "severity": "info"
  }
]
```
Action types: `USER_LOGIN`, `USER_ROLE_CHANGE`, `USER_CREATED`, `DATA_INGESTION`, `DATA_EXPORT`, `SYSTEM_CONFIG_CHANGE`, `ML_RETRAIN`, `BULK_UPLOAD`, `SCRAPE_TRIGGERED`, `REPORT_GENERATED`
Severity: `info`, `warning`, `critical`

**`src/mocks/data-ingestion.json`** — 10-15 ingestion jobs:
```json
[
  {
    "id": "ING-001",
    "fileName": "crime_records_q2_2026.csv",
    "type": "crime",
    "rowCount": 512,
    "successCount": 509,
    "errorCount": 3,
    "status": "completed",
    "startedAt": "2026-06-24T14:00:00Z",
    "completedAt": "2026-06-24T14:00:12Z",
    "uploadedBy": "USR-001",
    "errors": [
      { "row": 45, "field": "district", "message": "Unknown district code" }
    ]
  }
]
```
Status: `pending`, `running`, `completed`, `failed`, `partial`
Types: `crime`, `criminal`, `cyber`, `district`

### Step 2: Admin DTO Adapter

**Create `src/shared/api/dto-adapters/admin-adapters.ts`:**
```typescript
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  district: string;
  lastLogin: string;
  status: string;
  createdAt: string;
}

export interface SystemServiceDTO {
  id: string;
  name: string;
  type: string;
  status: string;
  latency: string;
  uptime: string;
  lastChecked: string;
}

export interface MlModelDTO {
  id: string;
  name: string;
  algorithm: string;
  version: string;
  status: string;
  accuracy: number;
  lastTrained: string;
  trainHistory: Array<{ date: string; accuracy: number }>;
}

export interface AuditLogDTO {
  id: string;
  timestamp: string;
  actor: string;
  actorId: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  severity: string;
}

export interface IngestionJobDTO {
  id: string;
  fileName: string;
  type: string;
  rowCount: number;
  successCount: number;
  errorCount: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  uploadedBy: string;
  errors: Array<{ row: number; field: string; message: string }>;
}

export interface ReportDTO {
  id: string;
  title: string;
  type: string;
  format: 'pdf' | 'csv' | 'xlsx';
  generatedAt: string;
  generatedBy: string;
  status: 'completed' | 'generating' | 'failed';
  size?: string;
  districts?: string[];
  dateRange: { from: string; to: string };
}
```

### Step 3: Mock Handlers Registration

**Append to `src/shared/api/mock/handlers.ts`:**
- Import: `users`, `systemServices`, `mlModels`, `auditLogs`, `dataIngestion`
- Add registry entries: `/admin/users`, `/admin/system-services`, `/admin/ml-models`, `/admin/audit-logs`, `/admin/data-ingestion`
- Add param-based lookups for `/admin/users/:userId`, `/admin/audit-logs/:logId`

### Step 4: Admin API Module

**Create `src/features/admin/api/adminApi.ts`:**
```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/shared/api/client';
import type { UserDTO, SystemServiceDTO, MlModelDTO, AuditLogDTO, IngestionJobDTO } from '@/shared/api/dto-adapters/admin-adapters';

export async function fetchUsers(): Promise<UserDTO[]> { return apiGet('/admin/users'); }
export async function fetchUser(id: string): Promise<UserDTO> { return apiGet(`/admin/users/${id}`); }
export async function updateUserRole(userId: string, role: string): Promise<void> { return apiPut(`/admin/users/${userId}/role`, { role }); }
export async function fetchSystemServices(): Promise<SystemServiceDTO[]> { return apiGet('/admin/system-services'); }
export async function fetchMlModels(): Promise<MlModelDTO[]> { return apiGet('/admin/ml-models'); }
export async function retrainModel(modelId: string): Promise<void> { return apiPost(`/admin/ml-models/${modelId}/retrain`, {}); }
export async function fetchAuditLogs(): Promise<AuditLogDTO[]> { return apiGet('/admin/audit-logs'); }
export async function fetchDataIngestion(): Promise<IngestionJobDTO[]> { return apiGet('/admin/data-ingestion'); }
```

### Step 5: Admin Hooks

**Create `src/features/admin/hooks/useAdminData.ts`:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/adminApi';
import type { UserDTO, SystemServiceDTO, MlModelDTO, AuditLogDTO, IngestionJobDTO } from '@/shared/api/dto-adapters/admin-adapters';

// Users
export function useUsers() { return useQuery<UserDTO[]>({ queryKey: ['admin', 'users'], queryFn: adminApi.fetchUsers }); }
export function useUser(id: string) { return useQuery<UserDTO>({ queryKey: ['admin', 'users', id], queryFn: () => adminApi.fetchUser(id), enabled: !!id }); }
export function useUpdateUserRole() { /* mutation + invalidate ['admin', 'users'] */ }

// System
export function useSystemHealth() { return useQuery<SystemServiceDTO[]>({ queryKey: ['admin', 'system'], queryFn: adminApi.fetchSystemServices }); }
export function useMlModels() { return useQuery<MlModelDTO[]>({ queryKey: ['admin', 'ml-models'], queryFn: adminApi.fetchMlModels }); }
export function useRetrainModel() { /* mutation + invalidate ['admin', 'ml-models'] */ }

// Audit
export function useAuditLogs() { return useQuery<AuditLogDTO[]>({ queryKey: ['admin', 'audit-logs'], queryFn: adminApi.fetchAuditLogs }); }

// Ingestion
export function useDataIngestion() { return useQuery<IngestionJobDTO[]>({ queryKey: ['admin', 'ingestion'], queryFn: adminApi.fetchDataIngestion }); }
```

### Step 6: Admin Shared Components

**Create `src/features/admin/components/`:**
1. `UsersTable.tsx` — User table with role dropdown editor, search, status badges
2. `RoleMatrix.tsx` — User+role matrix view with inline role editing
3. `SystemHealthPanel.tsx` — Grid of service health cards
4. `ServiceStatusCard.tsx` — Single service card (healthy/degraded/down)
5. `MlModelStatusCard.tsx` — ML model card with accuracy, last trained, retrain button
6. `AuditLogTimeline.tsx` — Scrollable timeline of audit entries
7. `IngestionJobTable.tsx` — Ingestion job history table with status badges
8. `BulkUploadDropzone.tsx` — File drop zone for data upload
9. `CSVPreviewTable.tsx` — Read-only CSV preview with schema validation
10. `ReportList.tsx` — Report listing with generate/download actions

**Component Prop Shapes (from COMPONENT_INVENTORY.md):**

```typescript
// UsersTable
{ users: UserDTO[]; onRoleChange?: (userId: string, role: string) => void }

// RoleMatrix
{ users: UserDTO[]; roles: string[]; onRoleUpdate: (userId: string, newRole: string) => void }

// SystemHealthPanel
{ services: SystemServiceDTO[]; loading?: boolean }

// ServiceStatusCard
{ name: string; status: 'healthy' | 'degraded' | 'down'; latency?: string; details?: string }

// MlModelStatusCard
{ model: MlModelDTO; onRetrain?: (modelId: string) => void }

// AuditLogTimeline
{ logs: AuditLogDTO[]; loading?: boolean; maxItems?: number }

// IngestionJobTable
{ jobs: IngestionJobDTO[]; loading?: boolean }

// BulkUploadDropzone
{ onFileDrop: (file: File) => void; accept?: string; maxSize?: number }

// CSVPreviewTable
{ rows: Record<string, unknown>[]; columns: string[]; maxRows?: number }

// ReportList
{ reports: ReportDTO[]; onGenerate: (type: string) => void; onDownload: (id: string) => void }
```

### Step 7: Build 8 Pages

For each page, replace the 2-line stub with a full component following the patterns from existing pages (AdminOverview → SystemHealth → UserManagement → RolePermissions → DataIngestion → DataQuality → AuditLog → Reports).

---

## 3. PAGE SPECS

### PAGE 1: SystemHealthPage (`/admin/system-health`)

**Purpose:** Real-time system health monitoring dashboard.

**Layout:**
- `PageHeader` — title "System Health", subtitle with last-checked timestamp
- KPI row — Total Services, Healthy Count, Degraded Count, Down Count
- **System Health Panel** (glass-card grid): `SystemHealthPanel` → `ServiceStatusCard[]`
  - Cards grouped by type: API Services, Databases, ML Models, Infrastructure
  - Each card: service name, status indicator (green/yellow/red dot), latency, uptime %, last checked time
  - Clicking a down/degraded card shows a brief error detail popover
- **ML Models Section**: `MlModelStatusCard[]` in a sub-grid
  - Each card: model name, algorithm, version, accuracy bar, last trained date, retrain button
  - Retrain button triggers `useRetrainModel` mutation with loading spinner and success toast
  - Training history sparkline (tiny Recharts AreaChart inline)

**States:** Loading (skeleton grid) → Error (retry) → Empty (no services) → Populated (grid)

---

### PAGE 2: AdminOverviewPage (`/admin`)

**Purpose:** High-level admin summary dashboard.

**Layout:**
- `PageHeader` — title "Admin Overview", subtitle "System administration and monitoring"
- **Summary KPI row** — Total Users, Active Sessions, Pending Ingestion Jobs, System Uptime
- **Quick Action cards** — glass-card grid linking to each admin section:
  - User Management → `/admin/users`
  - Role Permissions → `/admin/roles`
  - Data Ingestion → `/admin/data-ingestion`
  - Data Quality → `/admin/data-quality`
  - Audit Log → `/admin/audit-log`
  - System Health → `/admin/system-health`
  - Generate Report → `/dashboard/reports`
- **Recent Activity Feed** — last 10 audit log entries in a compact timeline
- **System Health Summary** — compact `SystemHealthPanel` showing only status counts and critical alerts

**States:** Loading (skeleton cards) → Error (retry) → Empty → Populated

---

### PAGE 3: UserManagementPage (`/admin/users`)

**Purpose:** Manage system users and roles.

**Layout:**
- `PageHeader` — title "User Management", subtitle with total user count
- `SearchInput` for filtering by name/email
- Filter dropdown: role (All/Admin/Supervisor/Analyst/Viewer/Sudo), status (All/Active/Inactive/Suspended)
- **UsersTable** — glass-card table:
  - Columns: Name, Email, Role (editable dropdown), District, Last Login, Status (badge), Actions
  - Role dropdown: on change calls `useUpdateUserRole` mutation
  - Click row → expand drawer or link to user detail (future)
- Optional: Summary bar showing user counts per role

**States:** Loading (skeleton table rows) → Error (retry) → Empty (no users) → Populated

---

### PAGE 4: RolePermissionsPage (`/admin/roles`)

**Purpose:** View and understand role-permission mappings.

**Layout:**
- `PageHeader` — title "Role Permissions", subtitle "Role-based access control matrix"
- **Role cards** — one glass-card per role (sudo, admin, supervisor, analyst, viewer):
  - Role name + user count badge
  - Description of role's scope
  - Permission list with checkmarks (✅) — fixed permissions per role
- **Permissions legend** at bottom showing all available permissions and which roles have them

**States:** Loading → Error → Empty → Populated

*Note: This is read-only for now. Permission editing can be added later.*

---

### PAGE 5: DataIngestionPage (`/admin/data-ingestion`)

**Purpose:** Manage data ingestion jobs and bulk uploads.

**Layout:**
- `PageHeader` — title "Data Ingestion", subtitle with total jobs count
- **Tab view**: Upload | Job History
- **Upload tab:**
  - `BulkUploadDropzone` — accepts CSV, JSON files
  - After file drop: show `CSVPreviewTable` with schema validation warnings
  - Upload button with progress
- **Job History tab:**
  - Filter: type (All/Crime/Criminal/Cyber/District), status (All/Completed/Failed/Running/Pending)
  - `IngestionJobTable` — glass-card table:
    - Columns: File Name, Type, Rows (Success/Error/Total), Status (badge), Started, Completed, Uploaded By
    - Error rows expanded inline or in modal
    - Retry button for failed jobs

**States:** Loading → Error → Empty (no jobs) → Populated

---

### PAGE 6: DataQualityPage (`/admin/data-quality`)

**Purpose:** Monitor data quality across intelligence domains.

**Layout:**
- `PageHeader` — title "Data Quality", subtitle "Data integrity and validation status"
- **KPI row** — Total Records, Error Rate %, Missing Fields, Last Validation
- **Domain quality cards** — one per data domain (Crime, Cyber, Maps, Network, Intel):
  - Domain name, total records, completeness %, accuracy %, last validated date
  - Quality score ring/bar (color-coded: green >90%, amber 70-90%, red <70%)
- **Recent validation errors table** — most recent data issues
- **"Run Validation" button** — triggers mock validation action

**States:** Loading → Error → Empty → Populated

---

### PAGE 7: AuditLogPage (`/admin/audit-log`)

**Purpose:** Track all system actions in a searchable timeline.

**Layout:**
- `PageHeader` — title "Audit Log", subtitle "Chronological record of system actions"
- **Filter bar**: search input, action type dropdown, severity dropdown (All/Info/Warning/Critical), date range
- **AuditLogTimeline** — glass-card scrollable timeline:
  - Each entry: timestamp, actor avatar+name, action badge (color-coded by type), target, details
  - Severity indicator strip on left (green/yellow/red)
  - Click entry → expanded detail view with IP, full description
- **Export button** — exports current filtered view

**States:** Loading (skeleton timeline) → Error (retry) → Empty ("No audit records found") → Populated

---

### PAGE 8: ReportsPage (`/dashboard/reports`)

**Purpose:** Generate and download intelligence reports.

**Layout:**
- `PageHeader` — title "Reports", subtitle "Generate and download intelligence reports"
- **KPI row** — Total Reports, Generated This Week, Most Downloaded Type
- **Report generation section** — glass-card with:
  - Report type selector: Crime Summary, Cyber Summary, District Comparison, Full Intelligence Report
  - Format selector: PDF, CSV, XLSX
  - Date range picker
  - District filter (multi-select)
  - "Generate Report" button → adds to report list with "generating" status
- **Report list/table** — `ReportList` component:
  - Columns: Title, Type, Format, Date Range, Generated, Status, Size, Actions (Download)
  - Status badges: Completed (green), Generating (yellow spinner), Failed (red)
  - Download button for completed reports

**States:** Loading → Error → Empty ("No reports generated yet") → Populated

---

## 4. REFERENCE PATTERNS

### Query Pattern (from existing pages)
```typescript
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['admin', 'users'],
  queryFn: fetchUsers,
});
```

### Mutation Pattern
```typescript
const { mutate: updateRole, isPending } = useMutation({
  mutationFn: ({ userId, role }: { userId: string; role: string }) => adminApi.updateUserRole(userId, role),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
});
```

### Glass Card Layout
```tsx
<section className="glass-card rounded-[var(--radius-2xl)] p-5">
  <h2 className="text-xl font-bold mb-4">Section Title</h2>
  {/* content */}
</section>
```

### State Pattern
```tsx
if (isLoading) return <LoadingSkeleton variant="card" count={6} />;
if (isError) return <ErrorState message={error?.message ?? 'Failed to load'} onRetry={refetch} />;
if (!data?.length) return <EmptyState icon={Shield} title="No data" description="..." />;
return <>{/* populated content */}</>;
```

### Import Paths
```typescript
import { PageHeader, LoadingSkeleton, ErrorState, EmptyState, StatusBadge } from '@/shared/components';
import { SearchInput, Select, Button, Badge } from '@/shared/ui-kit';
import { useUsers, useUpdateUserRole, useSystemHealth } from '@/features/admin/hooks/useAdminData';
import { UsersTable, SystemHealthPanel, AuditLogTimeline } from '@/features/admin/components';
import type { UserDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { Shield, Database, Activity, Users, FileText, AlertTriangle } from 'lucide-react';
```

---

## 5. DELIVERABLES

### Files to Create

**Mock Data:**
- [ ] `src/mocks/users.json`
- [ ] `src/mocks/system-services.json`
- [ ] `src/mocks/ml-models.json`
- [ ] `src/mocks/audit-logs.json`
- [ ] `src/mocks/data-ingestion.json`

**DTO Adapters:**
- [ ] `src/shared/api/dto-adapters/admin-adapters.ts`

**API Module:**
- [ ] `src/features/admin/api/adminApi.ts`

**Hooks:**
- [ ] `src/features/admin/hooks/useAdminData.ts`

**Components:**
- [ ] `src/features/admin/components/UsersTable.tsx`
- [ ] `src/features/admin/components/RoleMatrix.tsx`
- [ ] `src/features/admin/components/SystemHealthPanel.tsx`
- [ ] `src/features/admin/components/ServiceStatusCard.tsx`
- [ ] `src/features/admin/components/MlModelStatusCard.tsx`
- [ ] `src/features/admin/components/AuditLogTimeline.tsx`
- [ ] `src/features/admin/components/IngestionJobTable.tsx`
- [ ] `src/features/admin/components/BulkUploadDropzone.tsx`
- [ ] `src/features/admin/components/CSVPreviewTable.tsx`
- [ ] `src/features/admin/components/ReportList.tsx`

**Pages (replace stubs):**
- [ ] `src/pages/admin/AdminOverviewPage.tsx`
- [ ] `src/pages/admin/UserManagementPage.tsx`
- [ ] `src/pages/admin/RolePermissionsPage.tsx`
- [ ] `src/pages/admin/DataIngestionPage.tsx`
- [ ] `src/pages/admin/DataQualityPage.tsx`
- [ ] `src/pages/admin/AuditLogPage.tsx`
- [ ] `src/pages/admin/SystemHealthPage.tsx`
- [ ] `src/pages/dashboard/ReportsPage.tsx`

**Modified:**
- [ ] `src/shared/api/mock/handlers.ts` (append admin imports + registry)

**Other:**
- [ ] `changes.md` — Phase 8 completion entry
- [ ] Any additional files needed for proper build

### Acceptance Criteria
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] All 8 pages show 4 states: loading → error → empty → populated
- [ ] All admin routes load the correct page
- [ ] Role dropdown editing works in UserManagementPage
- [ ] Retrain button works in SystemHealthPage
- [ ] File drop zone renders in DataIngestionPage upload tab
- [ ] AuditLogPage filtering works
- [ ] ReportsPage generates/updates report list
- [ ] Design tokens match — no new CSS variables
- [ ] No frozen files modified
- [ ] No shared components duplicated

---

## 6. BUILD PROTOCOL

1. **Read reference pages first**: `CrimeOverviewPage.tsx`, `CyberOverviewPage.tsx` for patterns
2. **Build in order**: Mock data → DTOs → API → Hooks → Components → Pages
3. **Verify after each page**: `npx tsc --noEmit` must pass
4. **Do NOT modify** frozen files or already-completed pages
5. **Do NOT proceed** to Phase 9 — stop after Phase 8 is complete
6. **Report back** with build summary, any issues, verification results
