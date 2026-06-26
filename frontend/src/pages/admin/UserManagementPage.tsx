import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader } from '@/shared/components';
import { UsersTable } from '@/features/admin/components';
import { useUpdateUserRole, useUsers } from '@/features/admin/hooks/useAdminData';
import { SearchInput, Select } from '@/shared/ui-kit';

const roles = ['all', 'sudo', 'admin', 'supervisor', 'analyst', 'viewer'].map((value) => ({ label: value === 'all' ? 'All Roles' : value, value }));
const statuses = ['all', 'active', 'inactive', 'suspended'].map((value) => ({ label: value === 'all' ? 'All Statuses' : value, value }));

export function UserManagementPage() {
  const query = useUsers(); const updateRole = useUpdateUserRole();
  const [search, setSearch] = useState(''); const [role, setRole] = useState('all'); const [status, setStatus] = useState('all');
  const users = useMemo(() => (query.data ?? []).filter((user) => (`${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())) && (role === 'all' || user.role === role) && (status === 'all' || user.status === status)), [query.data, role, search, status]);
  if (query.isLoading) return <div className="grid gap-6"><LoadingSkeleton className="h-28" variant="card" /><LoadingSkeleton className="h-96" variant="chart" /></div>;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <EmptyState icon={Users} title="No users" description="No users exist in the admin directory." />;
  return <div className="grid gap-6"><PageHeader title="User Management" subtitle={`${query.data.length} system users across Karnataka districts`} /><section className="glass-card grid gap-3 rounded-[var(--radius-2xl)] p-4 lg:grid-cols-[1fr_170px_170px]"><SearchInput value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search name or email" /><Select value={role} onValueChange={setRole} options={roles} /><Select value={status} onValueChange={setStatus} options={statuses} /></section>{users.length ? <UsersTable users={users} onRoleChange={(userId, nextRole) => updateRole.mutate({ userId, role: nextRole })} /> : <EmptyState title="No matching users" description="Adjust filters to find users." />}</div>;
}
export default UserManagementPage;
