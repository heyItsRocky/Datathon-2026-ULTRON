export interface UserDTO { id: string; name: string; email: string; role: string; district: string; lastLogin: string; status: string; createdAt: string }
export interface SystemServiceDTO { id: string; name: string; type: string; status: string; latency: string; uptime: string; lastChecked: string }
export interface MlModelDTO { id: string; name: string; algorithm: string; version: string; status: string; accuracy: number; lastTrained: string; trainHistory: Array<{ date: string; accuracy: number }> }
export interface AuditLogDTO { id: string; timestamp: string; actor: string; actorId: string; action: string; target: string; details: string; ip: string; severity: string }
export interface IngestionJobDTO { id: string; fileName: string; type: string; rowCount: number; successCount: number; errorCount: number; status: string; startedAt: string; completedAt?: string; uploadedBy: string; errors: Array<{ row: number; field: string; message: string }> }
export interface ReportDTO { id: string; title: string; type: string; format: 'pdf' | 'csv' | 'xlsx'; generatedAt: string; generatedBy: string; status: 'completed' | 'generating' | 'failed'; size?: string; districts?: string[]; dateRange: { from: string; to: string } }

function rec(raw: unknown): Record<string, unknown> { return raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}; }
function str(value: unknown, fallback = ''): string { return typeof value === 'string' && value.length ? value : fallback; }
function num(value: unknown, fallback = 0): number { return typeof value === 'number' && Number.isFinite(value) ? value : fallback; }
function rows(value: unknown): Array<{ row: number; field: string; message: string }> { return Array.isArray(value) ? value.map((item) => { const r = rec(item); return { row: num(r.row), field: str(r.field), message: str(r.message) }; }) : []; }
function history(value: unknown): Array<{ date: string; accuracy: number }> { return Array.isArray(value) ? value.map((item) => { const r = rec(item); return { date: str(r.date), accuracy: num(r.accuracy) }; }) : []; }

export function adaptUser(raw: unknown): UserDTO {
  const r = rec(raw);
  return {
    id: str(r.id ?? r.USER_ID),
    name: str(r.name ?? r.NAME),
    email: str(r.email ?? r.EMAIL),
    role: str(r.role ?? r.ROLE, 'viewer'),
    district: str(r.district ?? r.DISTRICT),
    lastLogin: str(r.lastLogin ?? r.LAST_LOGIN),
    status: str(r.status ?? r.STATUS, 'inactive'),
    createdAt: str(r.createdAt ?? r.CREATED_AT),
  };
}
export function adaptSystemService(raw: unknown): SystemServiceDTO { const r = rec(raw); return { id: str(r.id), name: str(r.name), type: str(r.type), status: str(r.status, 'down'), latency: str(r.latency), uptime: str(r.uptime), lastChecked: str(r.lastChecked) }; }
export function adaptMlModel(raw: unknown): MlModelDTO { const r = rec(raw); return { id: str(r.id), name: str(r.name), algorithm: str(r.algorithm), version: str(r.version), status: str(r.status, 'down'), accuracy: num(r.accuracy), lastTrained: str(r.lastTrained), trainHistory: history(r.trainHistory) }; }
export function adaptAuditLog(raw: unknown): AuditLogDTO {
  const r = rec(raw);
  return {
    id: str(r.id ?? r.EVENT_ID),
    timestamp: str(r.timestamp ?? r.TIMESTAMP),
    actor: str(r.actor ?? r.PERFORMED_BY),
    actorId: str(r.actorId ?? r.PERFORMED_BY),
    action: str(r.action ?? r.ACTION),
    target: str(r.target ?? r.DETAIL),
    details: str(r.details ?? r.DETAIL),
    ip: str(r.ip),
    severity: str(r.severity, 'info'),
  };
}
export function adaptIngestionJob(raw: unknown): IngestionJobDTO { const r = rec(raw); return { id: str(r.id), fileName: str(r.fileName), type: str(r.type), rowCount: num(r.rowCount), successCount: num(r.successCount), errorCount: num(r.errorCount), status: str(r.status, 'pending'), startedAt: str(r.startedAt), completedAt: typeof r.completedAt === 'string' ? r.completedAt : undefined, uploadedBy: str(r.uploadedBy), errors: rows(r.errors) }; }
