import { useState, useEffect } from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: 'brand' | 'success' | 'warning' | 'danger';
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value = 0,
  variant = 'brand',
  label,
  showValue = true,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  useEffect(() => {
    // Animate fill on mount or value change
    const timer = setTimeout(() => {
      setAnimatedWidth(clampedValue);
    }, 50);
    return () => clearTimeout(timer);
  }, [clampedValue]);

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantGradients = {
    brand: 'bg-gradient-to-r from-brand-600 to-violet-500 shadow-glow-sm',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-400',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium mb-1.5 text-gray-300">
          {label ? <span>{label}</span> : <span />}
          {showValue && <span className="font-mono text-gray-400">{clampedValue}%</span>}
        </div>
      )}

      <div
        className={`w-full bg-surface-200/90 rounded-full overflow-hidden border border-surface-border/50 ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${variantGradients[variant]}`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
