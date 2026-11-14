import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightIcon,
      id,
      name,
      required,
      disabled,
      className = '',
      containerClassName = '',
      type = 'text',
      ...rest
    },
    ref
  ) => {
    const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const hasError = Boolean(error);

    const borderStyle = hasError
      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30'
      : 'border-[#292929] focus:border-white focus:ring-1 focus:ring-white/20';

    const paddingLeft = icon ? 'pl-10' : 'pl-3.5';
    const paddingRight = rightIcon ? 'pr-10' : 'pr-3.5';

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[#A1A1AA] mb-1.5">
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-xl">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717A]">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            required={required}
            disabled={disabled}
            className={`w-full rounded-xl bg-[#171717] py-2.5 text-sm text-white placeholder-[#71717A] outline-none transition-all duration-200 border disabled:cursor-not-allowed disabled:opacity-50 ${borderStyle} ${paddingLeft} ${paddingRight} ${className}`}
            {...rest}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
