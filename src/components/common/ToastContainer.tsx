import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/90 dark:bg-slate-900',
    warning: 'border-amber-200 dark:border-amber-800/60 bg-amber-50/90 dark:bg-slate-900',
    error: 'border-rose-200 dark:border-rose-800/60 bg-rose-50/90 dark:bg-slate-900',
    info: 'border-blue-200 dark:border-blue-800/60 bg-blue-50/90 dark:bg-slate-900',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 animate-slide-up ${
            borderStyles[toast.type]
          }`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
