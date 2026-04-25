'use client';

import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#0F172A] mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">{icon}</div>}

        <input
          className={`
            w-full px-4 py-2.5 rounded-xl border-2 border-[#E2E8F0]
            bg-[#F8FAFC] text-[#0F172A] placeholder-[#94A3B8]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] focus:bg-white
            disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && <p className="text-sm text-red-500 mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-sm text-[#64748B] mt-1.5">{helperText}</p>}
    </div>
  );
}
