'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl border-2 border-[#E2E8F0]
        ${paddingStyles[padding]}
        transition-all duration-200
        ${hover ? 'hover:shadow-lg hover:border-[#2563EB]' : 'shadow-sm'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
