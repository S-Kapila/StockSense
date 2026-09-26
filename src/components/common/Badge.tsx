import React from 'react';
import { OperationStatus } from '../../types/inventory';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'draft' | 'ready' | 'done' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles: Record<string, { bg: string; text: string; dotColor: string; border: string }> = {
    draft: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      dotColor: 'bg-slate-400',
    },
    ready: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/60',
      dotColor: 'bg-amber-500',
    },
    done: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      dotColor: 'bg-emerald-500',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      dotColor: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/60',
      dotColor: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-800 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800/60',
      dotColor: 'bg-rose-500',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800/60',
      dotColor: 'bg-blue-500',
    },
    neutral: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      dotColor: 'bg-slate-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${style.dotColor}`} />
      )}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: OperationStatus }> = ({ status }) => {
  const labels: Record<OperationStatus, string> = {
    draft: 'Draft',
    ready: 'Ready',
    done: 'Done',
  };

  return (
    <Badge variant={status} dot>
      {labels[status]}
    </Badge>
  );
};
