import {cn} from '@/src/lib/utils';

const STATUS_MAP: Record<string, {label: string; cls: string}> = {
  PRESENT: {label: 'Present', cls: 'bg-emerald-50 text-emerald-700'},
  LATE: {label: 'Late', cls: 'bg-amber-50 text-amber-700'},
  ABSENT: {label: 'Absent', cls: 'bg-red-50 text-red-700'},
  EXCUSED: {label: 'Excused', cls: 'bg-slate-100 text-slate-700'},
  ACTIVE: {label: 'Active', cls: 'bg-emerald-50 text-emerald-700'},
  INACTIVE: {label: 'Inactive', cls: 'bg-slate-100 text-slate-600'},
  ON_LEAVE: {label: 'On Leave', cls: 'bg-amber-50 text-amber-700'},
  ENROLLED: {label: 'Enrolled', cls: 'bg-emerald-50 text-emerald-700'},
  COMPLETED: {label: 'Completed', cls: 'bg-[#EEF1FF] text-[#4F5DF5]'},
  WITHDRAWN: {label: 'Withdrawn', cls: 'bg-red-50 text-red-700'},
  ACADEMIC: {label: 'Academic', cls: 'bg-[#EEF1FF] text-[#4F5DF5]'},
  EVENT: {label: 'Event', cls: 'bg-emerald-50 text-emerald-700'},
  URGENT: {label: 'Urgent', cls: 'bg-red-50 text-red-700'},
  GENERAL: {label: 'General', cls: 'bg-slate-100 text-slate-700'},
};

export function StatusText({status, className}: {status: string; className?: string}) {
  const key = status.toUpperCase();
  const entry = STATUS_MAP[key] || {
    label: status,
    cls: 'bg-slate-100 text-slate-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0',
        entry.cls,
        className,
      )}
    >
      {entry.label}
    </span>
  );
}
