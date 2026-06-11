import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { cardHover } from '../../animations/variants';

export function Card({
  children,
  hover = false,
  gradient = false,
  className,
  ...props
}) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: cardHover,
      }
    : {};

  return (
    <Component
      className={cn(
        'rounded-2xl transition-all',
        gradient
          ? 'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/50'
          : 'bg-white/80 backdrop-blur-sm border border-gray-200/50',
        'shadow-lg',
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}
