import dashboardStats from '@/mocks/dashboard-stats.json';
import crimeCases from '@/mocks/crime-cases.json';
import criminals from '@/mocks/criminals.json';
import cyberIncidents from '@/mocks/cyber-incidents.json';
import domainIntelligence from '@/mocks/domain-intelligence.json';
import evidenceRecords from '@/mocks/evidence-records.json';
import ipIntelligence from '@/mocks/ip-intelligence.json';
import networkFlows from '@/mocks/network-flows.json';
import districtStats from '@/mocks/district-stats.json';
import hotspots from '@/mocks/hotspots.json';
import predictiveZones from '@/mocks/predictive-zones.json';
import redZones from '@/mocks/red-zones.json';
import patrolZones from '@/mocks/patrol-zones.json';
import geofences from '@/mocks/geofences.json';
import routeAnalysis from '@/mocks/route-analysis.json';
import networkCrime from '@/mocks/network-crime.json';
import networkCyber from '@/mocks/network-cyber.json';
import networkCorrelation from '@/mocks/network-correlation.json';
import intelBriefs from '@/mocks/intel-briefs.json';
import intelEmergingTrends from '@/mocks/intel-emerging-trends.json';
import intelRedZones from '@/mocks/intel-red-zones.json';
import intelPredictiveZones from '@/mocks/intel-predictive-zones.json';
import intelSocioEconomic from '@/mocks/intel-socio-economic.json';
import users from '@/mocks/users.json';
import systemServices from '@/mocks/system-services.json';
import mlModels from '@/mocks/ml-models.json';
import auditLogs from '@/mocks/audit-logs.json';
import dataIngestion from '@/mocks/data-ingestion.json';

type MockCrimeCase = typeof crimeCases[number];
type MockCriminal = typeof criminals[number];
type MockCyberIncident = typeof cyberIncidents[number];
type MockIpIntelligence = typeof ipIntelligence[number];
type MockDomainIntelligence = typeof domainIntelligence[number];
type MockUser = typeof users[number];
type MockAuditLog = typeof auditLogs[number];

interface CrimeStats {
  totals: {
    totalCases: number;
    openCases: number;
    resolvedRate: number;
    avgResponseDays: number;
  };
  typeBreakdown: Array<{ type: string; count: number }>;
  monthlyTrend: Array<{ month: string; cases: number }>;
  recentCases: MockCrimeCase[];
}

interface MoMatchResult {
  criminalId: string;
  criminalName: string;
  matchPercentage: number;
  priors: number;
  similarCases: number;
  district: string;
}

function buildCrimeStats(): CrimeStats {
  const typeCounts = crimeCases.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
  const resolved = crimeCases.filter((item) => item.status === 'Resolved').length;
  const openCases = crimeCases.filter((item) => item.status !== 'Resolved').length;
  const monthlyCounts = crimeCases.reduce<Record<string, number>>((acc, item) => {
    const month = item.date.slice(0, 7);
    acc[month] = (acc[month] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totals: {
      totalCases: crimeCases.length,
      openCases,
      resolvedRate: Math.round((resolved / crimeCases.length) * 100),
      avgResponseDays: 2.4,
    },
    typeBreakdown: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
    monthlyTrend: Object.entries(monthlyCounts).map(([month, cases]) => ({ month, cases })),
    recentCases: [...crimeCases].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
  };
}

function buildMoMatches(): MoMatchResult[] {
  return (criminals as MockCriminal[])
    .filter((criminal) => criminal.riskScore >= 70)
    .slice(0, 5)
    .map((criminal, index) => ({
      criminalId: criminal.id,
      criminalName: criminal.name,
      matchPercentage: [94, 88, 81, 76, 69][index] ?? 65,
      priors: criminal.priors,
      similarCases: criminal.associatedCrimes.length,
      district: criminal.district,
    }));
}

function buildCyberStats() {
  const typeCounts = cyberIncidents.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
  const monthlyCounts = cyberIncidents.reduce<Record<string, number>>((acc, item) => {
    const month = item.date.slice(0, 7);
    acc[month] = (acc[month] ?? 0) + 1;
    return acc;
  }, {});
  return {
    totals: {
      totalIncidents: cyberIncidents.length,
      openIncidents: cyberIncidents.filter((item) => item.status !== 'Resolved' && item.status !== 'False Positive').length,
      criticalCount: cyberIncidents.filter((item) => item.severity === 'extreme').length,
      avgResponseHours: 6,
    },
    typeBreakdown: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
    monthlyTrend: Object.entries(monthlyCounts).map(([month, incidents]) => ({ month, incidents })),
    recentCritical: [...cyberIncidents].filter((item) => item.severity === 'extreme' || item.severity === 'high').slice(0, 5),
  };
}

const registry: Record<string, unknown> = {
  '/dashboard/stats': dashboardStats,
  'dashboard-stats': dashboardStats,
  '/crime/cases': crimeCases,
  '/crime/criminals': criminals,
  '/crime/stats': buildCrimeStats(),
  '/crime/mo-match': buildMoMatches(),
  '/cyber/incidents': cyberIncidents,
  '/cyber/evidence': evidenceRecords,
  '/cyber/flows': networkFlows,
  '/cyber/stats': buildCyberStats(),
  '/maps/hotspots': hotspots,
  '/maps/red-zones': redZones,
  '/maps/predictive-zones': predictiveZones,
  '/maps/patrol-zones': patrolZones,
  '/maps/geofences': geofences,
  '/maps/route-analysis': routeAnalysis,
  '/network/crime': networkCrime,
  '/network/cyber': networkCyber,
  '/network/correlation': networkCorrelation,
  '/intel/briefs': intelBriefs,
  '/intel/trends': intelEmergingTrends,
  '/intel/red-zones': intelRedZones,
  '/intel/predictive-zones': intelPredictiveZones,
  '/intel/socio-economic': intelSocioEconomic,
  '/admin/users': users,
  '/admin/system-services': systemServices,
  '/admin/ml-models': mlModels,
  '/admin/audit-logs': auditLogs,
  '/admin/data-ingestion': dataIngestion,
};

export async function mockFetch<T>(key: string): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, 120));

  if (key.startsWith('/crime/cases/')) {
    const caseId = decodeURIComponent(key.slice('/crime/cases/'.length));
    const found = (crimeCases as MockCrimeCase[]).find((crimeCase) => crimeCase.id === caseId);
    if (!found) throw new Error(`Crime case not found: ${caseId}`);
    return found as T;
  }

  if (key.startsWith('/crime/criminals/')) {
    const criminalId = decodeURIComponent(key.slice('/crime/criminals/'.length));
    const found = (criminals as MockCriminal[]).find((criminal) => criminal.id === criminalId);
    if (!found) throw new Error(`Criminal not found: ${criminalId}`);
    return found as T;
  }

  if (key.startsWith('/cyber/incidents/')) {
    const id = decodeURIComponent(key.slice('/cyber/incidents/'.length));
    const found = (cyberIncidents as MockCyberIncident[]).find((incident) => incident.id === id);
    if (!found) throw new Error(`Incident not found: ${id}`);
    return found as T;
  }

  if (key.startsWith('/cyber/ip/')) {
    const ip = decodeURIComponent(key.slice('/cyber/ip/'.length));
    const found = (ipIntelligence as MockIpIntelligence[]).find((item) => item.ip === ip);
    if (!found) throw new Error(`IP not found: ${ip}`);
    return found as T;
  }

  if (key.startsWith('/cyber/domain/')) {
    const domain = decodeURIComponent(key.slice('/cyber/domain/'.length));
    const found = (domainIntelligence as MockDomainIntelligence[]).find((item) => item.domain === domain);
    if (!found) throw new Error(`Domain not found: ${domain}`);
    return found as T;
  }

  if (key.startsWith('/maps/districts/')) {
    const id = decodeURIComponent(key.slice('/maps/districts/'.length));
    const found = (districtStats as Record<string, unknown>)[id];
    if (!found) throw new Error(`District not found: ${id}`);
    return found as T;
  }

  if (key.startsWith('/admin/users/')) {
    const userId = decodeURIComponent(key.slice('/admin/users/'.length));
    const found = (users as MockUser[]).find((user) => user.id === userId);
    if (!found) throw new Error(`User not found: ${userId}`);
    return found as T;
  }

  if (key.startsWith('/admin/audit-logs/')) {
    const logId = decodeURIComponent(key.slice('/admin/audit-logs/'.length));
    const found = (auditLogs as MockAuditLog[]).find((log) => log.id === logId);
    if (!found) throw new Error(`Audit log not found: ${logId}`);
    return found as T;
  }

  if (!(key in registry)) throw new Error(`No mock handler registered for ${key}`);
  return registry[key] as T;
}
