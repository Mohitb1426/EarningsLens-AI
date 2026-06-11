import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { buttonHover, buttonTap } from '../../animations/variants';

const variants = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30',
  secondary: 'bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200/50 hover:bg-white hover:border-gray-300 shadow-md',
  ghost: 'bg-transparent hover:bg-white/10 text-gray-700 hover:text-gray-900',
  outline: 'bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30',
  success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading,
  disabled,
  className,
  ...props
}) {
  return (
    <motion.button
      className={cn(
        'rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={!disabled && !loading ? buttonHover : {}}
      whileTap={!disabled && !loading ? buttonTap : {}}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
