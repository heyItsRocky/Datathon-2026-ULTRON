import { BarChart3, Brain, Building2, Command, Database, FileSearch, Fingerprint, GitBranch, Globe2, Home, KeyRound, Layers3, Link2, Lock, Map, Network, Radar, RadioTower, Route, Search, Settings, ShieldAlert, ShieldCheck, Siren, Users, Workflow, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItemConfig {
  label: string;
  path: string;
  section: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export const navItems: NavItemConfig[] = [
  { label: 'Command Center', path: '/', section: 'command', icon: Command },
  { label: 'Unified Dashboard', path: '/dashboard', section: 'command', icon: Home },
  { label: 'Crime Overview', path: '/crime', section: 'crime', icon: Siren, badge: '12' },
  { label: 'Crime Trends', path: '/crime/trends', section: 'crime', icon: BarChart3 },
  { label: 'Cyber Overview', path: '/cyber', section: 'cyber', icon: ShieldAlert, badge: '8' },
  { label: 'Cyber Threats', path: '/cyber/threats', section: 'cyber', icon: Lock },
  { label: 'Maps', path: '/maps', section: 'maps', icon: Map },
  { label: 'Hotspots', path: '/maps/hotspots', section: 'maps', icon: Radar },
  { label: 'Network Graph', path: '/network', section: 'network', icon: Network },
  { label: 'Link Analysis', path: '/network/link-analysis', section: 'network', icon: Link2 },
  { label: 'Intel Hub', path: '/intel', section: 'intel', icon: Brain },
  { label: 'Intel Graph', path: '/intel-graph', section: 'intel-graph', icon: GitBranch },
  { label: 'Admin', path: '/admin', section: 'admin', icon: Settings },
];

export const routeIconMap: Record<string, LucideIcon> = {
  command: Command,
  dashboard: Home,
  crime: Siren,
  cyber: ShieldAlert,
  maps: Map,
  network: Network,
  intel: Brain,
  admin: Settings,
  search: Search,
  database: Database,
  users: Users,
  building: Building2,
  layers: Layers3,
  file: FileSearch,
  globe: Globe2,
  key: KeyRound,
  route: Route,
  shield: ShieldCheck,
  tower: RadioTower,
  workflow: Workflow,
  zap: Zap,
  fingerprint: Fingerprint,
};
