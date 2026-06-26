import { lazy } from 'react';

const UnifiedDashboardPage = lazy(() => import('@/pages/dashboard/UnifiedDashboardPage'));
const AlertsPage = lazy(() => import('@/pages/dashboard/AlertsPage'));
const ReportsPage = lazy(() => import('@/pages/dashboard/ReportsPage'));
const CrimeOverviewPage = lazy(() => import('@/pages/crime/CrimeOverviewPage'));
const CrimeTrendsPage = lazy(() => import('@/pages/crime/CrimeTrendsPage'));
const CrimeHotspotsPage = lazy(() => import('@/pages/crime/CrimeHotspotsPage'));
const CrimeCasesPage = lazy(() => import('@/pages/crime/CrimeCasesPage'));
const CrimeCaseDetailPage = lazy(() => import('@/pages/crime/CrimeCaseDetailPage'));
const CriminalListPage = lazy(() => import('@/pages/crime/CriminalListPage'));
const CriminalDetailPage = lazy(() => import('@/pages/crime/CriminalDetailPage'));
const CrimePatternsPage = lazy(() => import('@/pages/crime/CrimePatternsPage'));
const CrimePredictivePage = lazy(() => import('@/pages/crime/CrimePredictivePage'));
const CyberOverviewPage = lazy(() => import('@/pages/cyber/CyberOverviewPage'));
const CyberThreatsPage = lazy(() => import('@/pages/cyber/CyberThreatsPage'));
const CyberCasesPage = lazy(() => import('@/pages/cyber/CyberCasesPage'));
const CyberCaseDetailPage = lazy(() => import('@/pages/cyber/CyberCaseDetailPage'));
const IpIntelligencePage = lazy(() => import('@/pages/cyber/IpIntelligencePage'));
const DomainIntelligencePage = lazy(() => import('@/pages/cyber/DomainIntelligencePage'));
const FraudAnalyticsPage = lazy(() => import('@/pages/cyber/FraudAnalyticsPage'));
const DigitalEvidencePage = lazy(() => import('@/pages/cyber/DigitalEvidencePage'));
const CyberHeatmapPage = lazy(() => import('@/pages/cyber/CyberHeatmapPage'));
const NetworkFlowPage = lazy(() => import('@/pages/cyber/NetworkFlowPage'));
const MapsOverviewPage = lazy(() => import('@/pages/maps/MapsOverviewPage'));
const HotspotMapPage = lazy(() => import('@/pages/maps/HotspotMapPage'));
const PatrolMapPage = lazy(() => import('@/pages/maps/PatrolMapPage'));
const GeoFencePage = lazy(() => import('@/pages/maps/GeoFencePage'));
const DistrictMapPage = lazy(() => import('@/pages/maps/DistrictMapPage'));
const RouteAnalysisPage = lazy(() => import('@/pages/maps/RouteAnalysisPage'));
const NetworkOverviewPage = lazy(() => import('@/pages/network/NetworkOverviewPage'));
const LinkAnalysisPage = lazy(() => import('@/pages/network/LinkAnalysisPage'));
const EntityExplorerPage = lazy(() => import('@/pages/network/EntityExplorerPage'));
const NetworkClustersPage = lazy(() => import('@/pages/network/NetworkClustersPage'));
const SuspectProfilePage = lazy(() => import('@/pages/network/SuspectProfilePage'));
const AssociationMatrixPage = lazy(() => import('@/pages/network/AssociationMatrixPage'));
const IntelHubPage = lazy(() => import('@/pages/intel/IntelHubPage'));
const BriefingsPage = lazy(() => import('@/pages/intel/BriefingsPage'));
const IntelReportsPage = lazy(() => import('@/pages/intel/IntelReportsPage'));
const WatchlistsPage = lazy(() => import('@/pages/intel/WatchlistsPage'));
const SignalsPage = lazy(() => import('@/pages/intel/SignalsPage'));
const StrategicForecastPage = lazy(() => import('@/pages/intel/StrategicForecastPage'));
const IntelGraphWorkspacePage = lazy(() => import('@/pages/intel-graph/IntelGraphWorkspacePage'));
const GraphBuilderPage = lazy(() => import('@/pages/intel-graph/GraphBuilderPage'));
const GraphSearchPage = lazy(() => import('@/pages/intel-graph/GraphSearchPage'));
const GraphTimelinePage = lazy(() => import('@/pages/intel-graph/GraphTimelinePage'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'));
const RolePermissionsPage = lazy(() => import('@/pages/admin/RolePermissionsPage'));
const DataIngestionPage = lazy(() => import('@/pages/admin/DataIngestionPage'));
const DataQualityPage = lazy(() => import('@/pages/admin/DataQualityPage'));
const AuditLogPage = lazy(() => import('@/pages/admin/AuditLogPage'));
const SystemHealthPage = lazy(() => import('@/pages/admin/SystemHealthPage'));

export interface AppRouteDefinition {
  path: string;
  element: React.LazyExoticComponent<() => React.JSX.Element>;
  permission?: string;
}

export const protectedRoutes: AppRouteDefinition[] = [
  { path: '/dashboard', element: UnifiedDashboardPage },
  { path: '/dashboard/alerts', element: AlertsPage },
  { path: '/dashboard/reports', element: ReportsPage },
  { path: '/crime', element: CrimeOverviewPage },
  { path: '/crime/trends', element: CrimeTrendsPage },
  { path: '/crime/hotspots', element: CrimeHotspotsPage },
  { path: '/crime/cases', element: CrimeCasesPage },
  { path: '/crime/cases/:caseId', element: CrimeCaseDetailPage },
  { path: '/crime/criminals', element: CriminalListPage },
  { path: '/crime/criminals/:criminalId', element: CriminalDetailPage },
  { path: '/crime/patterns', element: CrimePatternsPage },
  { path: '/crime/predictive', element: CrimePredictivePage },
  { path: '/cyber', element: CyberOverviewPage },
  { path: '/cyber/threats', element: CyberThreatsPage },
  { path: '/cyber/cases', element: CyberCasesPage },
  { path: '/cyber/cases/:caseId', element: CyberCaseDetailPage },
  { path: '/cyber/ip/:ip', element: IpIntelligencePage },
  { path: '/cyber/domain/:domain', element: DomainIntelligencePage },
  { path: '/cyber/fraud-analytics', element: FraudAnalyticsPage },
  { path: '/cyber/digital-evidence', element: DigitalEvidencePage },
  { path: '/cyber/heatmap', element: CyberHeatmapPage },
  { path: '/cyber/flows', element: NetworkFlowPage },
  { path: '/maps', element: MapsOverviewPage },
  { path: '/maps/hotspots', element: HotspotMapPage },
  { path: '/maps/patrol', element: PatrolMapPage },
  { path: '/maps/geofences', element: GeoFencePage },
  { path: '/maps/districts/:districtId', element: DistrictMapPage },
  { path: '/maps/routes', element: RouteAnalysisPage },
  { path: '/network', element: NetworkOverviewPage },
  { path: '/network/crime', element: NetworkOverviewPage },
  { path: '/network/cyber', element: NetworkOverviewPage },
  { path: '/network/correlation', element: NetworkOverviewPage },
  { path: '/network/link-analysis', element: LinkAnalysisPage },
  { path: '/network/entities', element: EntityExplorerPage },
  { path: '/network/clusters', element: NetworkClustersPage },
  { path: '/network/suspects/:suspectId', element: SuspectProfilePage },
  { path: '/network/association-matrix', element: AssociationMatrixPage },
  { path: '/intel', element: IntelHubPage },
  { path: '/intel/briefings', element: BriefingsPage },
  { path: '/intel/reports', element: IntelReportsPage },
  { path: '/intel/watchlists', element: WatchlistsPage },
  { path: '/intel/signals', element: SignalsPage },
  { path: '/intel/forecast', element: StrategicForecastPage },
  { path: '/intel-graph', element: IntelGraphWorkspacePage },
  { path: '/intel-graph/builder', element: GraphBuilderPage },
  { path: '/intel-graph/search', element: GraphSearchPage },
  { path: '/intel-graph/timeline', element: GraphTimelinePage },
  { path: '/admin', element: AdminOverviewPage, permission: 'admin:read' },
  { path: '/admin/users', element: UserManagementPage, permission: 'admin:users' },
  { path: '/admin/roles', element: RolePermissionsPage, permission: 'admin:roles' },
  { path: '/admin/data-ingestion', element: DataIngestionPage, permission: 'admin:data' },
  { path: '/admin/data-quality', element: DataQualityPage, permission: 'admin:data' },
  { path: '/admin/audit-log', element: AuditLogPage, permission: 'admin:audit' },
  { path: '/admin/system-health', element: SystemHealthPage, permission: 'admin:health' },
];
