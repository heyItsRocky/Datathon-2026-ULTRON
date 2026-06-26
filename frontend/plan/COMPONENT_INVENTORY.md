# COMPONENT INVENTORY — ULTRON Frontend

> Version 2.0 · June 2026
> Purpose: Catalog every reusable UI component in the system — organized by domain with props sketches, state handling, parent-child relationships, and agent ownership.

---

## 0. Component Ownership Rules

| Component Group | Owner | When Built | Rule |
|----------------|-------|------------|------|
| **Layout Components** | Foundation agent | Phase 0 | One agent, frozen after Phase 0 |
| **Shared/UI Kit** | Foundation agent | Phase 0 | Feature agents may NOT build alternatives |
| **Data Display** | Foundation agent | Phase 0 | Feature agents consume, don't duplicate |
| **Table Components** | Foundation agent builds base `DataTable` | Phase 0 | Feature agents extend with domain-specific columns |
| **Map Components** | Maps agent | Phase 4 | Specialized — Foundation agent does not build |
| **Graph Components** | Network agent | Phase 5 | Specialized — Foundation agent does not build |
| **Intel Graph Components** | Intel Graph agent | Phase 7 | Specialized — Foundation agent does not build |
| **Intelligence Components** | Intel agent | Phase 6 | Domain-specific |
| **Data Ops Components** | Admin agent | Phase 8 | Domain-specific |
| **Admin Components** | Admin agent | Phase 8 | Domain-specific |

**No component may be built outside this inventory without updating this document.**  
**No feature agent may build a component that duplicates an existing shared component.**

---

## 1. Layout Components — Owner: Foundation Agent (Phase 0, Frozen)

### `AppShell`
```
Props: none (reads from router outlet)
Children: TopHeader, SidebarNav, Outlet, RightContextPanel, FooterBar
States: sidebar-collapsed, sidebar-expanded
```
The outer frame for all operational pages. Reads `navStore` for sidebar state and `uiStore` for right panel state.

### `TopHeader`
```
Props: none (reads from authStore, navStore)
Children: KSPEmblem, ULTRONLogo, RoleBadge, GlobalSearch, NotificationBell, UserMenu
States: authenticated, unauthenticated
```
Sticky top bar. Shows KSP branding left, user controls right. GlobalSearch triggers command palette overlay.

### `SidebarNav`
```
Props: none (reads from navStore)
Children: SidebarItem[]
States: collapsed, expanded
```
Collapsible navigation rail. Groups sections visually. Active state driven by current route. Tooltips in collapsed mode.

### `SidebarItem`
```
Props: { icon: LucideIcon; label: string; route: string; badge?: number; disabled?: boolean }
States: active, inactive, disabled
```

### `SectionToolbar`
```
Props: { breadcrumbs: Breadcrumb[]; filters?: ReactNode; actions?: ReactNode }
Children: Breadcrumbs, FilterDropdown[], SearchInput, ExportButton, ActionButton[]
```
Per-page toolbar appearing below the TopHeader. Context-aware — content differs per route.

### `Breadcrumbs`
```
Props: { items: { label: string; route?: string }[] }
States: single-item (no back arrow), multi-item (clickable ancestors)
```

### `RightContextPanel`
```
Props: none (reads from uiStore)
Children: EntityDetailPanel, QuickActions, RelatedCases
States: open, closed, empty
```
Slide-in drawer from right edge. Content driven by `uiStore.rightPanelContent`.

### `FooterBar`
```
Props: { lastUpdated?: string; dataSource?: string }
States: visible, hidden
```
Shows data freshness indicator and source attribution.

---

## 2. Data Display Components — Owner: Foundation Agent (Phase 0-1, Frozen)

### `KpiCard`
```
Props: { title: string; value: string | number; delta?: { value: number; direction: 'up' | 'down' | 'flat' }; icon: LucideIcon; color?: string; onClick?: () => void }
States: loading (skeleton), loaded, error
```
Primary metric display. Gold top-border accent. Count-up animation on initial render. Clickable drill-down.

### `TrendCard`
```
Props: { title: string; data: { date: string; value: number }[]; color?: string; height?: number; loading?: boolean }
States: loading (skeleton chart), loaded, empty
```
Mini Recharts area chart wrapped in a glass card. Click to expand to full chart.

### `AlertFeed`
```
Props: { alerts: Alert[]; maxItems?: number; onDismiss?: (id: string) => void }
States: loading (skeleton list), empty ("No recent alerts"), populated
Children: AlertItem
```
Scrollable list of time-ordered alerts. Each has severity dot, title, timestamp, district tag.

### `AlertItem`
```
Props: { severity: 'critical' | 'warning' | 'info'; title: string; timestamp: string; district?: string; onClick?: () => void }
States: read, unread (bold)
```

### `InsightCard`
```
Props: { icon: string; title: string; summary: string; severity?: 'low' | 'medium' | 'high'; source?: string; onClick?: () => void }
```
AI-generated intelligence brief card. Used on Strategic Intelligence Hub.

### `MetricDelta`
```
Props: { value: number; direction: 'up' | 'down' | 'flat'; format?: 'percent' | 'absolute' }
```
Inline trend indicator. Green for positive (reduction in crime), red for negative (increase), gray for flat.

### `StatusBadge`
```
Props: { status: string; variant?: 'crime' | 'cyber' | 'general' }
```
Colored pill: Open=red, Investigating=yellow, Resolved=green. Variant affects color mapping.

### `SeverityBadge`
```
Props: { level: 'low' | 'medium' | 'high' | 'extreme' }
```
Colored pill matching severity color scale.

### `RiskBadge`
```
Props: { score: number }
```
Automatically determines tier (Low/Medium/High/Extreme) from score and renders accordingly.

---

## 3. Table Components — Owner: Foundation Agent builds DataTable (Phase 0), Feature Agents extend

### `DataTable` (generic wrapper over TanStack Table) — Owner: Foundation Agent
```
Props: { columns: ColumnDef[]; data: unknown[]; loading?: boolean; emptyMessage?: string; onRowClick?: (row: unknown) => void }
States: loading (skeleton rows), empty, populated, error
Children: TableHeader, TableBody, Pagination
```
Universal table with sorting, column visibility, sticky header. Skinny scrollbar styling.

### `CrimeTable` — Owner: Crime Agent
```
Props: { crimes: Crime[]; loading?: boolean; onSelect?: (crime: Crime) => void }
Columns: FIR_No, Type, District, Date, Status, Severity
Special: Row click → navigate to detail. Color-coded severity column.
```
Extends DataTable with crime-specific columns.

### `CriminalTable` — Owner: Crime Agent
```
Props: { criminals: Criminal[]; loading?: boolean; onSelect?: (criminal: Criminal) => void }
Columns: Name, Alias, District, Risk (with badge), Priors, Last Crime
Special: Risk column uses RiskBadge. Name is a link to detail.
```
Extends DataTable with criminal-specific columns.

### `CyberIncidentTable` — Owner: Cyber Agent
```
Props: { incidents: CyberIncident[]; loading?: boolean; onSelect?: (incident: CyberIncident) => void }
Columns: Case_No, Type, Status, Source_IP, Target_Domain, Date
Special: IP and Domain are monospace. Status has colored badge.
```
Extends DataTable with cyber-specific columns.

### `EvidenceTable` — Owner: Cyber Agent
```
Props: { evidence: Evidence[]; loading?: boolean }
Columns: Item ID, Type (photo/video/doc), Description, Seized From, Date, Chain (status indicator)
```

### `UsersTable` — Owner: Admin Agent
```
Props: { users: User[]; onRoleChange?: (userId: string, role: string) => void }
Columns: Name, Email, Role (with dropdown editor), District, Last Login, Status
```

---

## 4. Map Components — Owner: Maps Agent (Phase 4)

### `KarnatakaMap`
```
Props: { districts: DistrictGeoJSON; layers: MapLayer[]; onDistrictClick?: (districtId: string) => void; onDistrictHover?: (districtId: string) => void; center?: [number, number]; zoom?: number }
States: loading (map skeleton), loaded, empty (no districts), error
Children: DistrictLayer[] (one per enabled layer)
```
Base map component. Renders Karnataka with Leaflet. All other map components are layers within this.

### `DistrictOverlayMap`
```
Props: { districtId: string; crimeData: Crime[]; hotspotData: HotspotCluster[] }
```
Zoomed-in view of a single district. Shows crime pins, hotspot clusters, and street-level detail.

### `HotspotLayer`
```
Props: { clusters: HotspotCluster[]; visible: boolean }
```
Renders DBSCAN cluster circles on the map. Circle radius = cluster spread. Opacity = density. Click to show cluster detail popup.

### `PredictiveRiskLayer`
```
Props: { zones: PredictiveZone[]; opacity: number }
```
Overlays tomorrow's risk zones as a gradient heat layer (green → yellow → red) on the map.

### `RedZoneLayer`
```
Props: { zones: RedZone[]; visible: boolean }
```
Pulsing district borders for districts with active anomaly alerts.

### `SocioEconomicOverlayPanel`
```
Props: { districtId: string; metric: 'literacy' | 'poverty' | 'density' }
```
Not a map layer itself — renders a side panel with socio-economic data when a district is selected on the map.

### `CrimePinLayer`
```
Props: { crimes: Crime[]; visible: boolean; onPinClick?: (crime: Crime) => void }
```
Renders individual crime markers. Colored by type: red=violent, orange=property, blue=cyber, purple=women/child, gray=other.

### `MapLegend`
```
Props: { layers: { label: string; color: string; active: boolean }[] }
```
Bottom-right legend showing what each color on the map represents, based on active layers.

### `LayerControl`
```
Props: { layers: LayerToggle[]; onToggle: (layerId: string, enabled: boolean) => void }
```
Top-right overlay panel for toggling map layers on/off.

---

## 5. Graph Components — Owner: Network Agent (Phase 5)

### `CrimeNetworkGraph` (Cytoscape.js)
```
Props: { graph: NetworkGraphData; onNodeClick?: (nodeId: string) => void; onEdgeClick?: (edgeId: string) => void; layout?: string; filters?: NetworkFilter }
States: loading (canvas skeleton), loaded, empty ("No connections found"), error
Children: GraphControls (integrated toolbar)
```
Full-screen Cytoscape canvas for criminal relationship visualization.

### `CyberNetworkGraph` (Cytoscape.js)
```
Props: { graph: NetworkGraphData; threatLevel?: string; onNodeClick?: (nodeId: string) => void }
```
Similar to CrimeNetworkGraph but with cyber-themed node styling and threat-level edge coloring.

### `CorrelationGraph` (Cytoscape.js)
```
Props: { crimeGraph: NetworkGraphData; cyberGraph: NetworkGraphData; onNodeClick?: (nodeId: string) => void }
```
Dual-source graph showing cross-domain connections between crime and cyber entities.

### `GraphControls`
```
Props: { onSearch: (query: string) => void; onFilterChange: (filters: Record<string, unknown>) => void; onLayoutChange: (layout: string) => void; onTimelineChange: (range: [number, number]) => void; onExport: () => void }
```
Toolbar overlay for graph interaction — search, filter, layout selector, timeline slider, export.

### `NodeDetailDrawer`
```
Props: { node: GraphNode; onClose: () => void; onNavigate?: (route: string) => void }
```
Slide-in panel showing entity details when a graph node is clicked. Includes cross-module navigation links.

---

## 6. Intel Graph Components — Owner: Intel Graph Agent (Phase 7)

### `IntelGraphCanvas`
```
Props: { nodes: IntelNode[]; edges: IntelEdge[]; onNodesChange: (changes: NodeChange[]) => void; onEdgesChange: (changes: EdgeChange[]) => void; onConnect: (connection: Connection) => void; onNodeClick: (nodeId: string) => void }
```
React Flow canvas wrapper. Dark background, dot grid, handles for connection.

### `NodePalette`
```
Props: { nodeTypes: IntelNodeTypeConfig[]; onDragStart: (type: IntelNodeType, event: DragEvent) => void }
Children: NodePaletteItem[]
```
Left sidebar palette with 7 draggable node types. Each shows color swatch, icon, label.

### `NodePaletteItem`
```
Props: { config: IntelNodeTypeConfig; onDragStart: (event: DragEvent) => void }
Config: { type: IntelNodeType; label: string; color: string; icon: LucideIcon }
```

### `IntelNodeEditor`
```
Props: { node: IntelNode; onSave: (data: IntelNodeData) => void; onDelete: () => void }
States: loaded, saving
```
Right panel that slides open on node click. Renders dynamic form fields based on node type.

### `GraphActionBar`
```
Props: { onSave: () => void; onExport: () => void; onLoadTemplate: (name: string) => void; onClear: () => void; nodeCount: number; edgeCount: number; graphName: string; onNameChange: (name: string) => void }
```
Top toolbar with save, export, load template, clear actions. Shows node/edge count.

### `ReportPreview`
```
Props: { nodes: IntelNode[]; edges: IntelEdge[] }
```
Bottom bar that auto-generates a text summary of the graph as nodes and edges are added.

---

## 7. Intelligence Components — Owner: Intel Agent (Phase 6)

### `RedZonePanel`
```
Props: { zones: RedZone[]; loading?: boolean }
States: loading, empty ("No active red zones"), populated
```
Card or table showing districts currently in anomaly red-zone status. Each has severity, trend, and action button.

### `EmergingTrendsPanel`
```
Props: { trends: EmergingTrend[]; loading?: boolean; days?: number }
States: loading, empty, populated
```
Ranked list of fastest-rising crime types with percent change, volume, and district breakdown.

### `MoMatchPanel`
```
Props: { matches: MoMatch[]; loading?: boolean; onSelectCriminal: (id: string) => void }
States: loading, empty ("No MO matches found"), populated
```
Shows matched criminals for MO-based search. Match percentage bar, shared crime types, link to criminal profile.

### `PredictiveZonesPanel`
```
Props: { zones: PredictiveZone[]; loading?: boolean }
States: loading, empty, populated
```
Tomorrow's predicted high-risk zones with confidence scores, top crime types, and recommendations.

### `IntelBriefCard`
```
Props: { brief: IntelBrief; onDismiss?: () => void }
States: loaded, dismissing
```
AI-generated intelligence brief. Icon, title, summary paragraph, severity indicator, source attribution.

---

## 8. Data Operations Components — Owner: Admin Agent (Phase 8)

### `BulkUploadDropzone`
```
Props: { onFileDrop: (file: File) => void; accept?: string; maxSize?: number }
States: idle, dragging, uploading, success, error, rejected
```
Drag-and-drop zone with visual feedback. Shows file type restrictions and size limits.

### `CSVPreviewTable`
```
Props: { rows: Record<string, unknown>[]; columns: string[]; maxRows?: number }
States: empty ("No data to preview"), populated
```
Read-only table showing first N rows of uploaded CSV. Schema validation warnings shown above.

### `ScrapeSourceManager`
```
Props: { sources: ScrapeSource[]; onAdd: (source: ScrapeSource) => void; onRemove: (id: string) => void; onTrigger: (id: string) => void; loading?: boolean }
Children: ScrapeSourceCard[]
States: loading, empty ("No scrape sources configured"), populated
```

### `ScrapeSourceCard`
```
Props: { source: ScrapeSource; onEdit: () => void; onDelete: () => void; onTrigger: () => void }
States: idle, scraping, error
```

### `IngestionStatusPanel`
```
Props: { jobs: IngestionJob[]; loading?: boolean }
States: loading, empty, populated
```
Timeline/history of data ingestion jobs. Shows file name, row count, status, timestamp, error details.

---

## 9. Admin Components — Owner: Admin Agent (Phase 8)

### `RoleMatrix`
```
Props: { users: User[]; roles: string[]; onRoleUpdate: (userId: string, newRole: string) => void }
States: loading, populated, saving
```
User table with inline role editing via dropdown. Color-coded role badges.

### `SystemHealthPanel`
```
Props: { services: ServiceStatus[]; loading?: boolean }
Children: ServiceStatusCard[]
States: loading, populated, degraded, critical
```
Dashboard of all backend service health indicators.

### `ServiceStatusCard`
```
Props: { name: string; status: 'healthy' | 'degraded' | 'down'; latency?: string; details?: string }
States: healthy, degraded, down
```

### `MlModelStatusCard`
```
Props: { model: MlModelStatus; onRetrain?: (modelId: string) => void }
States: healthy, training, degraded, down
```
Shows model name, algorithm, last trained, accuracy, status. Retrain button for Sudo/Admin.

### `AuditLogTimeline`
```
Props: { logs: AuditLog[]; loading?: boolean; maxItems?: number }
States: loading, empty ("No audit records"), populated
```
Scrollable timeline of system actions. Each entry: timestamp, actor, action, target, details.

---

## 10. Shared/UI Kit Components — Owner: Foundation Agent (Phase 0, Frozen)

### `PageHeader`
```
Props: { title: string; subtitle?: string; actions?: ReactNode; backRoute?: string }
```

### `LoadingSkeleton`
```
Props: { variant: 'card' | 'table-row' | 'chart' | 'map' | 'text'; count?: number }
```
Shimmer animation skeletons for every content type.

### `EmptyState`
```
Props: { icon: LucideIcon; title: string; description: string; action?: { label: string; onClick: () => void } }
```

### `ErrorState`
```
Props: { message: string; details?: string; onRetry?: () => void; onGoBack?: () => void }
```

### `ErrorBoundary`
```
Props: { fallback?: ReactNode; children: ReactNode }
```
Class component wrapping each page or major section.

### `SearchInput`
```
Props: { value: string; onChange: (value: string) => void; placeholder?: string; onClear?: () => void; shortcut?: string }
```
Glass-styled input with magnifying glass icon, clear button, keyboard shortcut hint (⌘K or Ctrl+K).

### `DateRangePicker`
```
Props: { start: string; end: string; onChange: (range: { from: string; to: string }) => void }
```

### `FilterDropdown`
```
Props: { label: string; options: { value: string; label: string }[]; value: string | string[]; onChange: (value: string | string[]) => void; multi?: boolean }
```

### `ExportButton`
```
Props: { onExport: (format: 'csv' | 'pdf' | 'json') => void; formats?: ('csv' | 'pdf' | 'json')[]; loading?: boolean }
```
Dropdown button with format selection. Shows loading state during generation.

### `NotificationToast`
```
Uses: Sonner (library)
Props as provided by sonner toast()
Types: success, error, warning, info
```

### `ConfirmDialog`
```
Props: { open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; variant?: 'danger' | 'default'; onConfirm: () => void; onCancel: () => void }
```

### `SlideOver`
```
Props: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: 'md' | 'lg' | 'xl' }
```
Generic slide-in panel from right. Used by RightContextPanel, IntelNodeEditor, and form panels.

---

*This inventory is exhaustive. Every component listed is used by at least one page defined in the Page Specs document. Version 2.0 adds agent ownership per component group, build phase assignment, and rules against component duplication.*
