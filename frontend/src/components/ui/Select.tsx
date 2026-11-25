import React from 'react';
import {cn} from '@/src/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({label, error, className, id, children, ...props}, ref) => {
    const selectId = id || props.name;
    return (
      <div>
        {label ? (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F5DF5]',
            error ? 'border-red-300 focus:ring-red-500' : '',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
