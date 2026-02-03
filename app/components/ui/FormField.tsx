// Reusable FormField wrapper component

'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

const FormField = ({ 
  label, 
  error, 
  helperText, 
  required = false, 
  children, 
  className = '',
  id 
}: FormFieldProps) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div 
        role="group" 
        aria-labelledby={label ? fieldId : undefined}
        aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
      >
        {children}
      </div>
      
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;