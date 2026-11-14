import React from 'react';

// ==========================================
// Card
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function Card({
  hover = false,
  glow = false,
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyle = hover
    ? 'transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-brand cursor-pointer'
    : '';

  const glowStyle = glow ? 'shadow-glow-sm border-brand-500/30' : 'border-surface-border';

  return (
    <div
      className={`bg-surface-card border rounded-2xl shadow-card text-gray-100 ${paddingStyles[padding]} ${hoverStyle} ${glowStyle} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

// ==========================================
// CardHeader
// ==========================================
export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className = '',
  children,
  ...rest
}: CardHeaderProps) {
  if (children) {
    return (
      <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...rest}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div>
          {title && <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ==========================================
// CardBody
// ==========================================
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function CardBody({ className = '', children, ...rest }: CardBodyProps) {
  return (
    <div className={`space-y-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export const CardContent = CardBody;

// ==========================================
// CardFooter
// ==========================================
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({
  divider = false,
  className = '',
  children,
  ...rest
}: CardFooterProps) {
  const dividerStyle = divider ? 'border-t border-surface-border pt-4 mt-5' : 'mt-4';

  return (
    <div className={`flex items-center justify-between gap-3 ${dividerStyle} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export default Card;
