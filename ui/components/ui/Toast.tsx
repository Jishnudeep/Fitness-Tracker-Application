import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = React.createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 200);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    if (latest.exiting) return;
    const timer = setTimeout(() => dismissToast(latest.id), 3000);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  const colors = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} ${colors[toast.type]} pointer-events-auto px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold max-w-sm`}
          >
            {icons[toast.type]}
            <span>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
