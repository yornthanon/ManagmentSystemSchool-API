import React from 'react';
import {cn} from '@/src/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({label, error, className, id, ...props}, ref) => {
    const inputId = id || props.name;
    return (
      <div>
        {label ? (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]',
            error ? 'border-red-300 focus:ring-red-500' : '',
            className,
          )}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
