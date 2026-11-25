import {useState} from 'react';
import {getAvatarUrl, getInitials} from '@/src/lib/avatars';
import {cn} from '@/src/lib/utils';

interface AvatarProps {
  name?: string;
  indexOrRole?: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({name, indexOrRole, size = 'sm', className}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = getAvatarUrl(indexOrRole);

  const sizeClass =
    size === 'lg' ? 'w-12 h-12 text-sm' : size === 'md' ? 'w-9 h-9 text-xs' : 'w-7 h-7 text-[11px]';

  if (failed) {
    return (
      <div
        aria-label={name || 'User avatar'}
        className={cn(
          'rounded-full bg-[#EEF1FF] text-[#4F5DF5] font-semibold flex items-center justify-center shrink-0 select-none',
          sizeClass,
          className,
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'User portrait'}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('rounded-full object-cover shrink-0 bg-slate-100', sizeClass, className)}
    />
  );
}
