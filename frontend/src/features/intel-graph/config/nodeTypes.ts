import type { LucideIcon } from 'lucide-react';
import { Crosshair, FileSearch, Globe, Heart, MapPin, Siren, User } from 'lucide-react';
import type { IntelNodeType } from '@/stores/graphStore';

export interface IntelNodeTypeConfig {
  type: IntelNodeType;
  label: string;
  color: string;
  icon: LucideIcon;
  defaultLabel: string;
}

export const NODE_TYPE_CONFIGS: Record<IntelNodeType, IntelNodeTypeConfig> = {
  person: { type: 'person', label: 'Person', color: '#3b82f6', icon: User, defaultLabel: 'New Person' },
  ipAddress: { type: 'ipAddress', label: 'IP Address', color: '#8b5cf6', icon: Globe, defaultLabel: 'New IP Address' },
  location: { type: 'location', label: 'Location', color: '#10b981', icon: MapPin, defaultLabel: 'New Location' },
  evidence: { type: 'evidence', label: 'Evidence', color: '#f59e0b', icon: FileSearch, defaultLabel: 'New Evidence' },
  method: { type: 'method', label: 'Method', color: '#ef4444', icon: Crosshair, defaultLabel: 'New Method' },
  motive: { type: 'motive', label: 'Motive', color: '#ec4899', icon: Heart, defaultLabel: 'New Motive' },
  crimeType: { type: 'crimeType', label: 'Crime Type', color: '#f97316', icon: Siren, defaultLabel: 'New Crime Type' },
};

export function isIntelNodeType(value: string): value is IntelNodeType {
  return value in NODE_TYPE_CONFIGS;
}
