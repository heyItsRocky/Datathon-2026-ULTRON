import { ShieldCheck } from 'lucide-react';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { RoleMatrix } from '@/features/admin/components';
import { useUpdateUserRole, useUsers } from '@/features/admin/hooks/useAdminData';
import { Badge } from '@/shared/ui-kit';

const roles = ['sudo', 'admin', 'supervisor', 'analyst', 'viewer'];
const permissions: Record<string, string[]> = {
  sudo: ['admin:*', 'system:write', 'users:write', 'audit:read', 'reports:write'], admin: ['admin:read', 'users:write', 'roles:read', 'data:write', 'health:read'],
  supervisor: ['crime:read', 'cyber:read', 'reports:write', 'intel:read'], analyst: ['crime:read', 'cyber:read', 'network:read', 'intel:read'], viewer: ['dashboard:read', 'reports:read'],
};

export function RolePermissionsPage() {
  const users = useUsers(); const updateRole = useUpdateUserRole();
  if (users.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-96" variant="chart" /></div>;
  if (users.isError) return <ErrorState message={users.error.message} onRetry={() => void users.refetch()} />;
  if (!users.data?.length) return <EmptyState icon={ShieldCheck} title="No role data" description="Users are required to build role matrix." />;
  return <div className="grid gap-6"><PageHeader title="Role Permissions" subtitle="Role-based access control matrix" /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{roles.map((role) => <article key={role} className="glass-card rounded-[var(--radius-2xl)] p-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-bold capitalize">{role}</h3><Badge variant="gold">{users.data.filter((user) => user.role === role).length} users</Badge></div><p className="text-sm text-[var(--color-text-secondary)]">{role === 'sudo' ? 'Full emergency administration' : role === 'admin' ? 'System administration scope' : role === 'supervisor' ? 'District operational oversight' : role === 'analyst' ? 'Investigation and intelligence workflows' : 'Read-only dashboard access'}</p><ul className="mt-4 grid gap-2 text-sm">{permissions[role].map((permission) => <li key={permission} className="text-[var(--color-text-secondary)]">✓ {permission}</li>)}</ul></article>)}</section><RoleMatrix users={users.data} roles={roles} onRoleUpdate={(userId, newRole) => updateRole.mutate({ userId, role: newRole })} /><section className="glass-card rounded-[var(--radius-2xl)] p-5"><h2 className="text-xl font-bold">Permissions Legend</h2><div className="mt-4 flex flex-wrap gap-2">{[...new Set(Object.values(permissions).flat())].map((permission) => <Badge key={permission} variant="muted">{permission}</Badge>)}</div></section></div>;
}
export default RolePermissionsPage;
