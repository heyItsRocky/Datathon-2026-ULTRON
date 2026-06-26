import type { BadgeVariant } from '@/shared/ui-kit';

export function statusVariant(status: string): BadgeVariant { const value = status.toLowerCase(); if (['healthy', 'active', 'completed'].includes(value)) return 'green'; if (['degraded', 'running', 'training', 'partial', 'warning', 'pending'].includes(value)) return 'amber'; if (['down', 'failed', 'suspended', 'critical'].includes(value)) return 'red'; return 'muted'; }
export function roleVariant(role: string): BadgeVariant { if (role === 'sudo') return 'red'; if (role === 'admin') return 'gold'; if (role === 'supervisor') return 'violet'; if (role === 'analyst') return 'cyan'; return 'muted'; }
export function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
