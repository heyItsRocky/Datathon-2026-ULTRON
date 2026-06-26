import type { GraphTemplate, IntelEdge, IntelNode, IntelNodeType } from '@/stores/graphStore';

function node(id: string, type: IntelNodeType, label: string, x: number, y: number, description: string): IntelNode {
  return { id, type, position: { x, y }, data: { label, type, description, confidence: 72, source: 'Template', riskLevel: 'medium' } };
}

function edge(id: string, source: string, target: string, label: string): IntelEdge {
  return { id, source, target, type: 'smoothstep', animated: false, data: { label } };
}

export const TEMPLATES: GraphTemplate[] = [
  {
    name: 'Phishing Investigation',
    description: 'Trace an email phishing campaign from infrastructure to suspect and victim evidence.',
    nodes: [
      node('tpl-phish-ip', 'ipAddress', '185.44.12.90', 0, 120, 'Suspicious relay used in credential harvesting.'),
      node('tpl-phish-method', 'method', 'Credential Phishing', 240, 80, 'Fake bank login form delivered by email.'),
      node('tpl-phish-evidence', 'evidence', 'Email Header Log', 480, 120, 'Recovered email headers and IOC bundle.'),
      node('tpl-phish-person', 'person', 'Ravi Kumar', 720, 120, 'Person of interest linked to registered domain.'),
    ],
    edges: [edge('tpl-phish-e1', 'tpl-phish-ip', 'tpl-phish-method', 'hosts'), edge('tpl-phish-e2', 'tpl-phish-method', 'tpl-phish-evidence', 'produced'), edge('tpl-phish-e3', 'tpl-phish-evidence', 'tpl-phish-person', 'points to')],
  },
  {
    name: 'Burglary Case',
    description: 'Connect suspect, location, physical evidence, and crime type for a property crime file.',
    nodes: [
      node('tpl-burg-person', 'person', 'Unknown Suspect A', 0, 100, 'Seen near entry point by CCTV.'),
      node('tpl-burg-location', 'location', 'Indiranagar Residence', 240, 100, 'Residential burglary scene.'),
      node('tpl-burg-evidence', 'evidence', 'Latent Fingerprint', 480, 60, 'Recovered from window frame.'),
      node('tpl-burg-crime', 'crimeType', 'Burglary', 720, 100, 'Night-time forced entry.'),
    ],
    edges: [edge('tpl-burg-e1', 'tpl-burg-person', 'tpl-burg-location', 'seen near'), edge('tpl-burg-e2', 'tpl-burg-location', 'tpl-burg-evidence', 'contains'), edge('tpl-burg-e3', 'tpl-burg-evidence', 'tpl-burg-crime', 'supports')],
  },
  {
    name: 'Cyber Attack',
    description: 'Model a DDoS incident with infrastructure, motive, and server-log evidence.',
    nodes: [
      node('tpl-cyber-ip', 'ipAddress', '103.78.55.21', 0, 140, 'Command node observed in flow logs.'),
      node('tpl-cyber-method', 'method', 'DDoS Flood', 240, 100, 'High-volume traffic spike.'),
      node('tpl-cyber-motive', 'motive', 'Financial Extortion', 480, 140, 'Demand note after service disruption.'),
      node('tpl-cyber-evidence', 'evidence', 'Server Logs', 720, 100, 'Edge firewall and server access logs.'),
    ],
    edges: [edge('tpl-cyber-e1', 'tpl-cyber-ip', 'tpl-cyber-method', 'originated'), edge('tpl-cyber-e2', 'tpl-cyber-method', 'tpl-cyber-motive', 'indicates'), edge('tpl-cyber-e3', 'tpl-cyber-method', 'tpl-cyber-evidence', 'recorded in')],
  },
];
