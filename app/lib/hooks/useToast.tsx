// Toast notification hook

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Toast, ToastType } from '../../types/profile';

interface ToastOptions {
  duration?: number;
  id?: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    options: ToastOptions = {}
  ) => {
    const id = options.id || Date.now().toString();
    const duration = options.duration || 5000;

    const newToast: Toast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'success', options);
  }, [addToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'error', { duration: 7000, ...options });
  }, [addToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'warning', options);
  }, [addToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    return addToast(message, 'info', options);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };
};

// Toast context for global toast management
import { createContext, useContext, ReactNode } from 'react';

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

// Toast notification utilities
export const showSuccessToast = (message: string) => {
  // This will be used with the global toast context
  return message;
};

export const showErrorToast = (message: string) => {
  // This will be used with the global toast context
  return message;
};