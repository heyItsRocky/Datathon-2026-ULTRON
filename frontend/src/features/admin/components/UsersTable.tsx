import type { UserDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { Badge, Button, Select } from '@/shared/ui-kit';
import { formatDate, roleVariant, statusVariant } from './helpers';

const roleOptions = ['sudo', 'admin', 'supervisor', 'analyst', 'viewer'].map((role) => ({ label: role, value: role }));

export function UsersTable({ users, onRoleChange }: { users: UserDTO[]; onRoleChange?: (userId: string, role: string) => void }) {
  return <div className="glass-card overflow-x-auto rounded-[var(--radius-2xl)] p-4"><table className="w-full min-w-[860px] text-left text-sm"><thead className="text-[var(--color-text-muted)]"><tr><th className="py-3">Name</th><th>Email</th><th>Role</th><th>District</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-[var(--color-border)]"><td className="py-3"><b>{user.name}</b><p className="font-mono text-xs text-[var(--color-text-muted)]">{user.id}</p></td><td>{user.email}</td><td><div className="flex items-center gap-2"><Badge variant={roleVariant(user.role)}>{user.role}</Badge><Select value={user.role} onValueChange={(role) => onRoleChange?.(user.id, role)} options={roleOptions} /></div></td><td>{user.district}</td><td>{formatDate(user.lastLogin)}</td><td><Badge variant={statusVariant(user.status)}>{user.status}</Badge></td><td><Button size="sm" variant="ghost">Details</Button></td></tr>)}</tbody></table></div>;
}
