import type { UserDTO } from '@/shared/api/dto-adapters/admin-adapters';
import { Badge, Select } from '@/shared/ui-kit';
import { roleVariant } from './helpers';

export function RoleMatrix({ users, roles, onRoleUpdate }: { users: UserDTO[]; roles: string[]; onRoleUpdate: (userId: string, newRole: string) => void }) {
  const options = roles.map((role) => ({ label: role, value: role }));
  return <section className="glass-card overflow-x-auto rounded-[var(--radius-2xl)] p-4"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-[var(--color-text-muted)]"><tr><th className="py-3">User</th>{roles.map((role) => <th key={role}>{role}</th>)}<th>Update</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-[var(--color-border)]"><td className="py-3 font-semibold">{user.name}</td>{roles.map((role) => <td key={role}>{user.role === role ? <Badge variant={roleVariant(role)}>assigned</Badge> : <span className="text-[var(--color-text-muted)]">—</span>}</td>)}<td><Select value={user.role} onValueChange={(role) => onRoleUpdate(user.id, role)} options={options} /></td></tr>)}</tbody></table></section>;
}
