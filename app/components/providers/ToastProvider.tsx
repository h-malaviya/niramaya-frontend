// Global Toast Provider component

'use client';

import { ToastProvider as ToastContextProvider } from '../../lib/hooks/useToast';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../lib/hooks/useToast';

const ToastProviderInner = ({ children }: { children: React.ReactNode }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemove={removeToast}
        position="top-right"
      />
    </>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastContextProvider>
      <ToastProviderInner>
        {children}
      </ToastProviderInner>
    </ToastContextProvider>
  );
};