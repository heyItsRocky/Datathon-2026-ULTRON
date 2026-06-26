# STATE & API — ULTRON Frontend Data Layer

> Version 2.0 · June 2026
> Purpose: Define every Zustand store, TanStack Query hook, API client pattern, DTO adaptation layer, and mock-mode strategy. Agent ownership: Foundation agent builds stores + client; feature agents build query hooks + adapters + mocks per domain.

---

## 1. Philosophy

Two types of state, two tools:

| State Type | Definition | Tool |
|------------|------------|------|
| **Server State** | Data that lives on the backend — crimes, criminals, incidents, stats | TanStack Query |
| **Client State** | Data that lives only in the browser — UI state, filters, graph workspace, auth session | Zustand |

**Rule:** If it comes from an API, use TanStack Query.  
**Rule:** If it's local UI-only, use Zustand.  
**Rule:** Never duplicate server state in client stores.

### Agent Ownership Rules

| Layer | Owner | When |
|-------|-------|------|
| API client instance | Foundation agent | Phase 0 |
| Error normalizer | Foundation agent | Phase 0 |
| Mock mode infrastructure | Foundation agent | Phase 0 |
| DTO adapter pattern + base adapters | Foundation agent | Phase 0 |
| Zustand stores (auth, nav, ui) | Foundation agent | Phase 0 |
| filterStore | Foundation agent | Phase 0 (extended by feature agents) |
| graphStore | Intel Graph agent | Phase 7 |
| TanStack Query hooks (per domain) | Feature agent for that domain | Per phase |
| Mock data files | Feature agent for that domain | Per phase |
| Domain-specific DTO adapters | Feature agent for that domain | Per phase |

---

## 2. Zustand Stores

### 2.1 `authStore` — Owner: Foundation Agent

```typescript
interface AuthState {
  // State
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'sudo' | 'user';
    badgeNumber: string;
    district: string;
    avatar?: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (requiredRole: string[]) => boolean;
}
```

### 2.2 `navStore` — Owner: Foundation Agent

```typescript
interface NavState {
  // State
  activeSection: SectionKey | null;
  sidebarCollapsed: boolean;
  previousSection: SectionKey | null;
  breadcrumbs: Breadcrumb[];

  // Actions
  navigateTo: (section: SectionKey, subPath?: string) => void;
  toggleSidebar: () => void;
  setBreadcrumbs: (crumbs: Breadcrumb[]) => void;
  goBack: () => void;
}

type SectionKey =
  | 'dashboard'
  | 'crime'
  | 'cyber'
  | 'maps'
  | 'network'
  | 'intelligence'
  | 'intel-graph'
  | 'data'
  | 'admin';
```

### 2.3 `filterStore` — Owner: Foundation Agent (extended per feature)

```typescript
interface FilterState {
  // Global filters (persist across pages within a session)
  globalDateRange: { from: string; to: string };
  globalDistrict: string | null;
  globalCrimeType: string | null;

  // Page-local filters
  crimeFilters: CrimeFilter;
  cyberFilters: CyberFilter;
  mapFilters: MapFilter;
  networkFilters: NetworkFilter;

  // Actions
  setGlobalDateRange: (range: { from: string; to: string }) => void;
  setGlobalDistrict: (district: string | null) => void;
  setCrimeFilters: (filters: Partial<CrimeFilter>) => void;
  setCyberFilters: (filters: Partial<CyberFilter>) => void;
  resetFilters: () => void;
}

interface CrimeFilter {
  status: 'all' | 'open' | 'investigating' | 'resolved';
  crimeType: string[];
  district: string[];
  dateFrom: string;
  dateTo: string;
  severity: 'all' | 'low' | 'medium' | 'high' | 'extreme';
  search: string;
}

interface CyberFilter {
  incidentType: string[];
  status: 'all' | 'open' | 'investigating' | 'resolved';
  sourceIp: string;
  targetDomain: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

interface MapFilter {
  layers: ('crime_pins' | 'hotspot' | 'district_shading' | 'red_zone' | 'predictive' | 'socio_economic' | 'police_stations')[];
  timeRange: 'all' | 'week' | 'month' | 'quarter' | 'year';
  crimeType: string[];
  showLabels: boolean;
}

interface NetworkFilter {
  graphType: 'crime' | 'cyber' | 'correlation';
  entitySearch: string;
  minWeight: number;
  maxNodes: number;
  timelinePosition: [number, number]; // [start, end] epoch
  nodeTypes: string[];
  edgeTypes: string[];
}
```

**Rule for feature agents extending filterStore:** You may add page-local filters. You may NOT remove or rename existing fields. You must use the existing actions.

### 2.4 `graphStore` (Intel Graph Workspace) — Owner: Intel Graph Agent

```typescript
interface GraphState {
  // State
  nodes: IntelNode[];
  edges: IntelEdge[];
  selectedNodeId: string | null;
  graphName: string;
  isDirty: boolean;

  // Actions
  addNode: (type: IntelNodeType, position: { x: number; y: number }) => string;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<IntelNodeData>) => void;
  connectNodes: (source: string, target: string, label?: string) => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  clearGraph: () => void;
  exportGraph: () => IntelGraphExport;
  loadGraph: (graph: IntelGraphExport) => void;
  loadTemplate: (templateName: string) => void;
}

type IntelNodeType = 'ip' | 'name' | 'place' | 'object' | 'how' | 'why' | 'what';

interface IntelNode {
  id: string;
  type: IntelNodeType;
  position: { x: number; y: number };
  data: IntelNodeData;
}

interface IntelNodeData {
  label: string;
  // Type-specific fields
  ip?: string;
  isp?: string;
  geo?: string;
  fullName?: string;
  alias?: string;
  dob?: string;
  address?: string;
  lat?: number;
  lng?: number;
  description?: string;
  seizedFrom?: string;
  method?: string;
  tools?: string[];
  motive?: string;
  trigger?: string;
  crimeCategory?: string;
  firNumber?: string;
  date?: string;
  status?: string;
}

interface IntelGraphExport {
  name: string;
  nodes: IntelNode[];
  edges: IntelEdge[];
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
}

interface IntelEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}
```

### 2.5 `uiStore` — Owner: Foundation Agent

```typescript
interface UiState {
  // State
  theme: 'dark';
  rightPanelOpen: boolean;
  rightPanelContent: 'none' | 'entity-detail' | 'quick-actions' | 'evidence-preview';
  rightPanelEntityId: string | null;
  toasts: Toast[];
  modalStack: ModalConfig[];
  globalLoading: boolean;

  // Actions
  openRightPanel: (content: UiState['rightPanelContent'], entityId?: string) => void;
  closeRightPanel: () => void;
  pushModal: (modal: ModalConfig) => void;
  popModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  setGlobalLoading: (loading: boolean) => void;
}
```

---

## 3. TanStack Query Hooks

### 3.1 Query Key Conventions

```
['dashboard', 'stats']
['dashboard', 'stats', { district, dateRange }]

['crime', 'list', filters]
['crime', 'detail', id]
['crime', 'hotspots', { timeRange }]
['crime', 'trends', { period }]

['criminal', 'list', { search, page }]
['criminal', 'detail', id]
['criminal', 'risk', id]
['criminal', 'mo', id]

['cyber', 'incidents', filters]
['cyber', 'incident', id]
['cyber', 'ip', address]
['cyber', 'domain', domain]
['cyber', 'flows', { sourceIp }]
['cyber', 'threats']
['cyber', 'stats']
['cyber', 'trends']

['analysis', 'anomalies', { district }]
['analysis', 'correlations', { district }]

['intelligence', 'brief']
['intelligence', 'trending', { days }]
['intelligence', 'predictive-zones']

['network', 'crime']
['network', 'cyber']
['network', 'correlation']

['admin', 'users']
['admin', 'system-health']
['admin', 'ml-models']
['admin', 'audit-logs']
['admin', 'activity']

['scrape', 'sources']
['scrape', 'ingestion-logs']
```

### 3.2 Key Query Hook Signatures — Owner: Per Feature Agent

```typescript
// ── Dashboard ── (Owner: Foundation Agent, Phase 1)
function useDashboardStats(filters?: GlobalFilters): UseQueryResult<DashboardStats>;

// ── Crime ── (Owner: Crime Agent, Phase 2)
function useCrimeList(filters?: CrimeFilter): UseQueryResult<PaginatedResponse<Crime>>;
function useCrimeDetail(id: string): UseQueryResult<CrimeDetail>;
function useCrimeHotspots(timeRange?: string): UseQueryResult<Hotspot[]>;
function useCrimeTrends(period?: string): UseQueryResult<Trend[]>;

// ── Criminal ── (Owner: Crime Agent, Phase 2)
function useCriminalList(params?: { search: string; page: number }): UseQueryResult<PaginatedResponse<Criminal>>;
function useCriminalDetail(id: string): UseQueryResult<CriminalDetail>;
function useCriminalRisk(id: string): UseQueryResult<RiskScore>;
function useMoMatches(criminalId: string): UseQueryResult<MoMatch[]>;

// ── Cyber ── (Owner: Cyber Agent, Phase 3)
function useCyberIncidents(filters?: CyberFilter): UseQueryResult<PaginatedResponse<CyberIncident>>;
function useCyberIncidentDetail(id: string): UseQueryResult<CyberIncidentDetail>;
function useIpIntelligence(ip: string): UseQueryResult<IpIntelligence>;
function useDomainIntelligence(domain: string): UseQueryResult<DomainIntelligence>;
function useCyberFlows(filters?: FlowFilter): UseQueryResult<NetworkFlow[]>;

// ── Maps ── (Owner: Maps Agent, Phase 4)
function useDistrictData(districtId?: string): UseQueryResult<DistrictData>;
function useHotspotData(timeRange: string): UseQueryResult<HotspotCluster[]>;
function useRedZones(): UseQueryResult<RedZone[]>;
function usePredictiveZones(): UseQueryResult<PredictiveZone[]>;

// ── Intelligence ── (Owner: Intel Agent, Phase 6)
function useIntelBrief(): UseQueryResult<IntelBrief>;
function useEmergingTrends(days: number): UseQueryResult<EmergingTrend[]>;

// ── Network ── (Owner: Network Agent, Phase 5)
function useCrimeNetwork(): UseQueryResult<NetworkGraph>;
function useCyberNetwork(): UseQueryResult<NetworkGraph>;
function useCorrelationGraph(): UseQueryResult<NetworkGraph>;

// ── Admin ── (Owner: Admin Agent, Phase 8)
function useUsers(): UseQueryResult<User[]>;
function useSystemHealth(): UseQueryResult<SystemHealth>;
function useMlModelStatus(): UseQueryResult<MlModelStatus[]>;
function useAuditLogs(): UseQueryResult<AuditLog[]>;
```

### 3.3 Mutation Hooks — Owner: Per Feature Agent

```typescript
// ── Auth ── (Owner: Foundation Agent)
function useLogin(): UseMutationResult<AuthResponse, Error, LoginCredentials>;
function useRegister(): UseMutationResult<void, Error, RegisterData>;

// ── Crime ── (Owner: Crime Agent)
function useCreateCrime(): UseMutationResult<Crime, Error, CreateCrimeInput>;
function useUpdateCrime(): UseMutationResult<Crime, Error, { id: string; data: UpdateCrimeInput }>;
function useDeleteCrime(): UseMutationResult<void, Error, string>;
function useBulkUpload(): UseMutationResult<BulkUploadResult, Error, FormData>;

// ── Cyber ── (Owner: Cyber Agent)
function useCreateCyberIncident(): UseMutationResult<CyberIncident, Error, CreateIncidentInput>;
function useUpdateCyberIncident(): UseMutationResult<CyberIncident, Error, { id: string; data: UpdateIncidentInput }>;
function useEnrichIp(): UseMutationResult<IpIntelligence, Error, string>;

// ── Scrape ── (Owner: Admin Agent)
function useTriggerScrape(): UseMutationResult<void, Error, string[]>;
function useAddScrapeSource(): UseMutationResult<void, Error, ScrapeSourceInput>;

// ── ML ── (Owner: Admin Agent)
function useRetrainModel(): UseMutationResult<void, Error, string>;

// ── Admin ── (Owner: Admin Agent)
function useUpdateUserRole(): UseMutationResult<void, Error, { userId: string; role: string }>;
```

---

## 4. API Client Architecture — Owner: Foundation Agent (Phase 0, frozen thereafter)

### 4.1 Client Instance

```typescript
// shared/api/client.ts

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error);
    // If 401, attempt token refresh or force logout
    if (normalized.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(normalized);
  }
);

export default apiClient;
```

**Rule:** No agent may modify the API client after Phase 0. If changes are needed, the orchestrator must approve.

### 4.2 Error Normalizer — Owner: Foundation Agent (Frozen)

```typescript
interface NormalizedApiError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, string[]>;
  isNetworkError: boolean;
  retryable: boolean;
}

function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || 'An unexpected error occurred',
        code: error.response.data?.code || 'UNKNOWN_ERROR',
        details: error.response.data?.details,
        isNetworkError: false,
        retryable: error.response.status >= 500,
      };
    }
    if (error.request) {
      return {
        status: 0,
        message: 'Unable to reach the server. Please check your connection.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
        retryable: true,
      };
    }
  }
  return {
    status: 0,
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    isNetworkError: false,
    retryable: false,
  };
}
```

### 4.3 API Module Pattern — Owner: Per Feature Agent

```typescript
// features/crime/api/crimeApi.ts

export const crimeApi = {
  list: (filters?: CrimeFilter): Promise<PaginatedResponse<Crime>> =>
    apiClient.get('/crime/list', { params: filters }).then(r => r.data),

  detail: (id: string): Promise<CrimeDetail> =>
    apiClient.get(`/crime/${id}`).then(r => r.data),

  create: (data: CreateCrimeInput): Promise<Crime> =>
    apiClient.post('/crime', data).then(r => r.data),

  update: (id: string, data: UpdateCrimeInput): Promise<Crime> =>
    apiClient.put(`/crime/${id}`, data).then(r => r.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/crime/${id}`),

  bulk: (file: FormData): Promise<BulkUploadResult> =>
    apiClient.post('/crime/bulk', file).then(r => r.data),

  hotspots: (timeRange?: string): Promise<Hotspot[]> =>
    apiClient.get('/crime/hotspots', { params: { range: timeRange } }).then(r => r.data),

  trends: (period?: string): Promise<Trend[]> =>
    apiClient.get('/crime/trends', { params: { period } }).then(r => r.data),

  redZones: (): Promise<RedZone[]> =>
    apiClient.get('/crime/red-zones').then(r => r.data),

  moMatch: (description: string): Promise<MoMatchResult> =>
    apiClient.post('/crime/match-mo', { description }).then(r => r.data),

  moProfile: (criminalId: string): Promise<MoProfile> =>
    apiClient.get(`/crime/mo/${criminalId}`).then(r => r.data),
};
```

**All feature agents must follow this exact module pattern** when creating their own API modules.

---

## 5. DTO Adaptation Layer

### 5.1 Why We Need It

Backend APIs in hackathons change shape. Field names differ, nulls appear unexpectedly, enums get new values. A DTO layer prevents these changes from breaking the frontend.

### 5.2 Pattern — Owner: Per Feature Agent

```typescript
// shared/api/dto-adapters/crime-adapters.ts

export function adaptCrime(raw: unknown): Crime {
  const data = raw as Record<string, unknown>;
  return {
    id: String(data.id ?? data.ID ?? data.crime_id ?? ''),
    firNumber: String(data.fir_number ?? data.FIR_No ?? data.firNo ?? ''),
    type: String(data.type ?? data.crime_type ?? data.Crime_Head ?? 'Unknown'),
    date: String(data.date ?? data.Date ?? data.incident_date ?? ''),
    time: String(data.time ?? data.Time ?? ''),
    district: String(data.district ?? data.District ?? 'Unknown'),
    location: {
      lat: Number(data.lat ?? data.Latitude ?? data.latitude ?? 0),
      lng: Number(data.lng ?? data.Longitude ?? data.longitude ?? 0),
    },
    status: normalizeCrimeStatus(data.status ?? data.Status),
    description: String(data.description ?? data.Description ?? data.MO_Description ?? ''),
    severity: calculateSeverity(data),
  };
}

function normalizeCrimeStatus(status: unknown): CrimeStatus {
  const s = String(status).toLowerCase();
  if (['open', 'under investigation', 'investigating'].includes(s)) return 'investigating';
  if (['resolved', 'closed', 'solved'].includes(s)) return 'resolved';
  return 'open';
}

function calculateSeverity(data: Record<string, unknown>): Severity {
  // Derive severity from crime type, risk score, or other signals
  return 'medium'; // fallback
}
```

### 5.3 Adapter Collection

```
shared/api/dto-adapters/
├── crime-adapters.ts        # Crime, CrimeDetail, CrimeList — Owner: Crime Agent
├── criminal-adapters.ts     # Criminal, CriminalDetail, RiskScore — Owner: Crime Agent
├── cyber-adapters.ts        # CyberIncident, IpIntel, DomainIntel — Owner: Cyber Agent
├── analysis-adapters.ts     # Hotspot, Anomaly, Correlation — Owner: Maps Agent
├── dashboard-adapters.ts    # DashboardStats — Owner: Foundation Agent
├── intelligence-adapters.ts # IntelBrief, EmergingTrend, PredictiveZone — Owner: Intel Agent
├── network-adapters.ts      # NetworkGraph (crime + cyber) — Owner: Network Agent
└── admin-adapters.ts        # User, SystemHealth, AuditLog — Owner: Admin Agent
```

---

## 6. Mock Mode Architecture

### 6.1 Strategy — Owner: Foundation Agent (Phase 0)

The frontend must work **entirely without a backend**. A single flag controls this:

```typescript
// shared/config.ts
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || true; // default true during dev
```

### 6.2 Mock Data Layer — Owner: Foundation Agent (base), Feature Agents (per domain)

```typescript
// shared/api/mock/handlers.ts

export const mockHandlers: Record<string, () => Promise<unknown>> = {
  'dashboard-stats': () => import('@/mocks/dashboard-stats.json').then(m => m.default),
  'crime-list': () => import('@/mocks/crime-list.json').then(m => m.default),
  'crime-detail': () => import('@/mocks/crime-detail.json').then(m => m.default),
  'cyber-incidents': () => import('@/mocks/cyber-incidents.json').then(m => m.default),
  'ip-intel': () => import('@/mocks/ip-intel.json').then(m => m.default),
  'network-crime': () => import('@/mocks/network-crime.json').then(m => m.default),
  // ... one handler per query key pattern
};
```

**Rule for feature agents:** Add your mock data files to `src/mocks/` and register handlers in `mockHandlers`. Never delete or modify existing mock data.

### 6.3 Integration

```typescript
// shared/api/client.ts — conditional fetch
async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  if (MOCK_MODE) {
    const mockKey = deriveMockKey(url, params);
    return mockHandlers[mockKey]() as Promise<T>;
  }
  return apiClient.get(url, { params }).then(r => r.data);
}
```

### 6.4 Mock Data Requirements — Owner: Per Feature Agent

| Dataset | Records | File | Owner |
|---------|---------|------|-------|
| Crime records | 500+ | `mocks/crime-list.json` | Crime Agent |
| Crime detail samples | 5 | `mocks/crime-detail.json` | Crime Agent |
| Criminal profiles | 200+ | `mocks/criminal-list.json` | Crime Agent |
| Criminal detail samples | 5 | `mocks/criminal-detail.json` | Crime Agent |
| Cyber incidents | 200+ | `mocks/cyber-incidents.json` | Cyber Agent |
| IP intelligence samples | 10 | `mocks/ip-intel.json` | Cyber Agent |
| Domain intelligence samples | 10 | `mocks/domain-intel.json` | Cyber Agent |
| Dashboard stats | 1 | `mocks/dashboard-stats.json` | Foundation Agent |
| Network graph (crime) | 1 graph | `mocks/network-crime.json` | Network Agent |
| Network graph (cyber) | 1 graph | `mocks/network-cyber.json` | Network Agent |
| Karnataka districts | 31 | `mocks/districts.json` | Maps Agent |
| Hotspot clusters | 50 | `mocks/hotspots.json` | Maps Agent |
| Red zones | 5 | `mocks/red-zones.json` | Maps Agent |
| Intel brief | 1 | `mocks/intel-brief.json` | Intel Agent |
| Emerging trends | 10 | `mocks/emerging-trends.json` | Intel Agent |
| Users | 10 | `mocks/users.json` | Admin Agent |

---

*This document defines every data layer contract and its agent owner. Components query data through these hooks and stores only — never directly through fetch or axios. Version 2.0 adds agent ownership per section, freeze rules, and mock data ownership.*
