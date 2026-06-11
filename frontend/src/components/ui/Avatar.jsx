import { cn } from '../../utils/cn';

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  gradient = true,
  className,
}) {
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold overflow-hidden',
          gradient && !src && 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white',
          !gradient && !src && 'bg-gray-200 text-gray-600',
          sizes[size],
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{fallback || '?'}</span>
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-2.5 h-2.5',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4',
            status === 'online' && 'bg-green-500',
            status === 'offline' && 'bg-gray-400',
            status === 'busy' && 'bg-red-500',
            status === 'away' && 'bg-yellow-500'
          )}
        />
      )}
    </div>
  );
}
