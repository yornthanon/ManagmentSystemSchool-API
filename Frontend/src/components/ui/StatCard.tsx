import type {LucideIcon} from 'lucide-react';
import {cn} from '@/src/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  deltaTone?: 'positive' | 'negative' | 'neutral';
  context?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  delta,
  deltaTone = 'neutral',
  context,
}: StatCardProps) {
  const deltaColor =
    deltaTone === 'positive'
      ? 'text-emerald-600'
      : deltaTone === 'negative'
        ? 'text-red-600'
        : 'text-slate-500';

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between min-w-0">
      <div className="flex items-center gap-2 text-slate-600">
        <div className="w-6 h-6 rounded-md bg-[#EEF1FF] text-[#4F5DF5] flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[13px] font-medium truncate">{title}</span>
      </div>

      <div className="mt-3 text-[26px] leading-tight font-display font-bold text-slate-900 tabular-nums tracking-tight">
        {value}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs min-h-[18px]">
        {delta ? (
          <span className={cn('font-medium tabular-nums whitespace-nowrap', deltaColor)}>
            {delta}
          </span>
        ) : null}
        {context ? <span className="text-slate-500 truncate">{context}</span> : null}
      </div>
    </div>
  );
}
