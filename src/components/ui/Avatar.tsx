import { HTMLAttributes } from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, alt, name, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden bg-[hsl(38,55%,35%)] text-white font-semibold rounded-xl dark:bg-[hsl(38,65%,45%)]',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt || name} className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
