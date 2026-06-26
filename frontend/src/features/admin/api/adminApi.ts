import { apiGet } from '@/shared/api/client';
import { adaptAuditLog, adaptIngestionJob, adaptMlModel, adaptSystemService, adaptUser, type AuditLogDTO, type IngestionJobDTO, type MlModelDTO, type SystemServiceDTO, type UserDTO } from '@/shared/api/dto-adapters/admin-adapters';

export async function fetchUsers(): Promise<UserDTO[]> { return (await apiGet<unknown[]>('/admin/users')).map(adaptUser); }
export async function fetchUser(id: string): Promise<UserDTO> { return adaptUser(await apiGet<unknown>(`/admin/users/${encodeURIComponent(id)}`)); }
export async function updateUserRole(_userId: string, _role: string): Promise<void> { await new Promise((resolve) => window.setTimeout(resolve, 220)); }
export async function fetchSystemServices(): Promise<SystemServiceDTO[]> { return (await apiGet<unknown[]>('/admin/system-services')).map(adaptSystemService); }
export async function fetchMlModels(): Promise<MlModelDTO[]> { return (await apiGet<unknown[]>('/admin/ml-models')).map(adaptMlModel); }
export async function retrainModel(_modelId: string): Promise<void> { await new Promise((resolve) => window.setTimeout(resolve, 350)); }
export async function fetchAuditLogs(): Promise<AuditLogDTO[]> { return (await apiGet<unknown[]>('/admin/audit-logs')).map(adaptAuditLog); }
export async function fetchDataIngestion(): Promise<IngestionJobDTO[]> { return (await apiGet<unknown[]>('/admin/data-ingestion')).map(adaptIngestionJob); }
