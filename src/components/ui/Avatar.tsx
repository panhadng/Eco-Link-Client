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
  // Normalize src - treat empty string or undefined as no image
  const hasImage = src && src.trim() !== '';
  
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden font-semibold rounded-xl',
        // Background: white/black for images, dark blue for default
        hasImage 
          ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
          : 'bg-[#0c0c6d] border border-[#0c0c6d]',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {hasImage ? (
        <img 
          src={src} 
          alt={alt || name} 
          className="h-full w-full object-cover" 
          onError={(e) => {
            // If image fails to load, fall back to initials
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('span');
              fallback.className = 'text-[#52ba00]';
              fallback.textContent = getInitials(name);
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <span className="text-[#52ba00]">{getInitials(name)}</span>
      )}
    </div>
  );
}
