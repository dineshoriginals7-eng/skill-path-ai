import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'info',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...rest
}: BadgeProps) {
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    info: 'bg-brand-500/10 text-brand-300 border-brand-500/25',
    neutral: 'bg-surface-200/90 text-gray-400 border-surface-border',
  };

  const dotStyles = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-brand-400',
    neutral: 'bg-gray-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]} animate-pulse-soft`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
