import React from 'react';

interface InputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: any;
  onChange?: (e: any) => void;
  className?: string;
  type?: string;
  required?: boolean;
  onKeyDown?: any;
  onFocus?: any;
  [key: string]: any;
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  // Label above (12px, #64748b, weight 500)
  // Input (40px height, border #e2e8f0, focus border #2563eb with glow)
  // Error state: red border + error message below
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label className="text-xs font-semibold text-[#64748b] select-none">
          {label}
        </label>
      )}
      <input
        className={`w-full h-10 px-3 bg-white border rounded-md font-body-sm text-body-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-[#ef4444] focus:ring-[#ef4444]/20'
            : 'border-[#e2e8f0] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[11px] text-[#ef4444] font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
export function Textarea({
  label,
  error,
  className = '',
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label className="text-xs font-semibold text-[#64748b] select-none">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full p-3 bg-white border rounded-md font-body-sm text-body-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-[#ef4444] focus:ring-[#ef4444]/20'
            : 'border-[#e2e8f0] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[11px] text-[#ef4444] font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
