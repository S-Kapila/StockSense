import React from 'react';

export type KpiStatus = 'ok' | 'warning' | 'critical' | 'neutral';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  status: KpiStatus;
  statusText?: string;
  onClick?: () => void;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  status,
  statusText,
  onClick,
  trend,
}) => {
  const statusStyles: Record<
    KpiStatus,
    {
      badgeBg: string;
      badgeText: string;
      dotColor: string;
      iconBg: string;
      iconColor: string;
      accentBorder: string;
    }
  > = {
    ok: {
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      dotColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    },
    warning: {
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeText: 'text-amber-700 dark:text-amber-300',
      dotColor: 'bg-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    },
    critical: {
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
      badgeText: 'text-rose-700 dark:text-rose-300',
      dotColor: 'bg-rose-500 animate-pulse',
      iconBg: 'bg-rose-50 dark:bg-rose-900/30',
      iconColor: 'text-rose-600 dark:text-rose-400',
      accentBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
    },
    neutral: {
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
      badgeText: 'text-blue-700 dark:text-blue-300',
      dotColor: 'bg-blue-500',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      accentBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
  };

  const style = statusStyles[status] || statusStyles.neutral;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + style.accentBorder : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${style.iconBg} ${style.iconColor} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>

        {statusText && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.badgeBg} ${style.badgeText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dotColor}`} />
            {statusText}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}

      {/* Decorative gradient corner glow */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
    </div>
  );
};
