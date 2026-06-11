import { motion } from 'framer-motion';

export function MessageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl"
    >
      <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg skeleton"></div>
          <div className="h-4 w-32 bg-gray-300 rounded skeleton"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded skeleton w-full"></div>
          <div className="h-4 bg-gray-300 rounded skeleton w-5/6"></div>
          <div className="h-4 bg-gray-300 rounded skeleton w-4/6"></div>
        </div>
      </div>
    </motion.div>
  );
}

export function CitationSkeleton() {
  return (
    <div className="mt-3 space-y-2">
      <div className="h-3 w-20 bg-gray-300 rounded skeleton"></div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-xl p-3"
        >
          <div className="h-4 bg-gray-300 rounded skeleton w-48 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded skeleton w-24 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded skeleton w-full"></div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl mb-4 skeleton"></div>
            <div className="h-8 bg-gray-300 rounded skeleton w-20 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded skeleton w-32 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded skeleton w-24"></div>
          </div>
        ))}
      </div>

      <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="h-6 bg-gray-300 rounded skeleton w-40 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-300 rounded skeleton w-40"></div>
              <div className="h-4 bg-gray-300 rounded skeleton w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatLoadingSkeleton() {
  return (
    <div className="space-y-6 py-8">
      <MessageSkeleton />
      <div className="flex justify-end">
        <div className="max-w-2xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 shadow-lg">
            <div className="h-4 bg-white/30 rounded skeleton w-full mb-2"></div>
            <div className="h-4 bg-white/30 rounded skeleton w-3/4"></div>
          </div>
        </div>
      </div>
      <MessageSkeleton />
    </div>
  );
}

export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
        <motion.div
          className={`${sizeClasses[size]} border-4 border-transparent border-t-purple-500 rounded-full absolute top-0 left-0`}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 backdrop-blur-lg bg-white/60 border border-white/40 rounded-2xl p-4 w-fit shadow-lg"
    >
      <div className="flex space-x-2">
        <motion.div
          className="w-3 h-3 bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
        <motion.div
          className="w-3 h-3 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
        />
        <motion.div
          className="w-3 h-3 bg-pink-500 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
        />
      </div>
      <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
    </motion.div>
  );
}

export function ProgressBar({ progress = 0, showPercentage = true }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Processing...</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900">{progress}%</span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
