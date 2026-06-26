import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/features/admin/api/adminApi';
import type { AuditLogDTO, IngestionJobDTO, MlModelDTO, SystemServiceDTO, UserDTO } from '@/shared/api/dto-adapters/admin-adapters';

export function useUsers() { return useQuery<UserDTO[]>({ queryKey: ['admin', 'users'], queryFn: adminApi.fetchUsers }); }
export function useUser(id: string) { return useQuery<UserDTO>({ queryKey: ['admin', 'users', id], queryFn: () => adminApi.fetchUser(id), enabled: Boolean(id) }); }
export function useUpdateUserRole() { const client = useQueryClient(); return useMutation({ mutationFn: ({ userId, role }: { userId: string; role: string }) => adminApi.updateUserRole(userId, role), onSuccess: () => void client.invalidateQueries({ queryKey: ['admin', 'users'] }) }); }
export function useSystemHealth() { return useQuery<SystemServiceDTO[]>({ queryKey: ['admin', 'system'], queryFn: adminApi.fetchSystemServices }); }
export function useMlModels() { return useQuery<MlModelDTO[]>({ queryKey: ['admin', 'ml-models'], queryFn: adminApi.fetchMlModels }); }
export function useRetrainModel() { const client = useQueryClient(); return useMutation({ mutationFn: adminApi.retrainModel, onSuccess: () => void client.invalidateQueries({ queryKey: ['admin', 'ml-models'] }) }); }
export function useAuditLogs() { return useQuery<AuditLogDTO[]>({ queryKey: ['admin', 'audit-logs'], queryFn: adminApi.fetchAuditLogs }); }
export function useDataIngestion() { return useQuery<IngestionJobDTO[]>({ queryKey: ['admin', 'ingestion'], queryFn: adminApi.fetchDataIngestion }); }
