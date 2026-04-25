'use client';

interface BadgeProps {
  children: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#F1F5F9] text-[#64748B]',
    success: 'bg-[#DCFCE7] text-[#166534]',
    warning: 'bg-[#FEF3C7] text-[#92400E]',
    info: 'bg-[#DBEAFE] text-[#0C4A6E]',
    error: 'bg-[#FEE2E2] text-[#991B1B]',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span className={`inline-block rounded-lg ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
