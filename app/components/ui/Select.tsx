// Reusable Select component

'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '', 
    label,
    error,
    helperText,
    fullWidth = false,
    options,
    placeholder,
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;
    
    const baseClasses = 'block px-4 py-3 pr-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm transition-all duration-200 appearance-none bg-white text-gray-900';
    const errorClasses = error 
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400';
    const widthClass = fullWidth ? 'w-full' : '';
    
    const classes = `${baseClasses} ${errorClasses} ${widthClass} ${className}`;
    
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={classes}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-600" />
          </div>
        </div>
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;