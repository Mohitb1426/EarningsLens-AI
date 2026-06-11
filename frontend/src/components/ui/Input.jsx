import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  className,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleChange = (e) => {
    setHasValue(e.target.value !== '');
    props.onChange?.(e);
  };

  return (
    <div className="relative">
      {/* Floating Label */}
      {label && (
        <motion.label
          className={cn(
            'absolute left-3 transition-all pointer-events-none',
            isFocused || hasValue
              ? 'top-2 text-xs text-blue-600 font-medium'
              : 'top-4 text-base text-gray-500'
          )}
          animate={{
            y: isFocused || hasValue ? -4 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}

      {/* Input Field */}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          type={type}
          className={cn(
            'w-full px-4 py-4 rounded-xl border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            Icon ? 'pl-12' : '',
            label ? 'pt-6' : '',
            error
              ? 'border-red-300 focus:border-red-500 bg-red-50/50'
              : 'border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm',
            isFocused && !error && 'shadow-lg shadow-blue-500/10',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(e.target.value !== '');
          }}
          onChange={handleChange}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
}
