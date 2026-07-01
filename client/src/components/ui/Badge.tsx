import type { EntityStatus } from '@sn58/shared';

const STATUS_VARIANT: Record<EntityStatus, string> = {
  active: 'success',
  inactive: 'warning',
  jailed: 'danger',
};

interface BadgeProps {
  children: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: EntityStatus }) {
  return <Badge variant={STATUS_VARIANT[status] as BadgeProps['variant']}>{status}</Badge>;
}
