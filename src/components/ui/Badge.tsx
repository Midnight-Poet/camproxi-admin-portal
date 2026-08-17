import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: BadgeVariant }) {
  const styles = {
    success: 'bg-[var(--color-success-bg)] border border-[var(--color-success)]/30 text-[var(--color-success)] shadow-[0_2px_10px_rgba(5,150,105,0.1)]',
    warning: 'bg-[var(--color-warning-bg)] border border-[var(--color-warning)]/30 text-[var(--color-warning)] shadow-[0_2px_10px_rgba(217,119,6,0.1)]',
    danger: 'bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] shadow-[0_2px_10px_rgba(220,38,38,0.1)]',
    neutral: 'bg-gray-50 border border-gray-200 text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${styles[variant]}`}>
      {children}
    </span>
  );
}
