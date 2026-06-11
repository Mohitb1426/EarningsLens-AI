import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Sparkles, Mail, Lock, TrendingUp, BarChart3, Shield, Zap } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = isLogin
      ? await login(email, password)
      : await register(email, password);

    setLoading(false);

    if (result.success) {
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/chat');
    } else {
      toast.error(result.error || 'Something went wrong');
    }
  };

  const features = [
    { icon: <Sparkles className="w-5 h-5" />, title: 'AI-Powered Analysis', desc: 'Claude 4.5 Sonnet intelligence' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Real-Time Insights', desc: 'Instant earnings data analysis' },
    { icon: <Shield className="w-5 h-5" />, title: 'Verified Sources', desc: 'Citations from official reports' },
    { icon: <Zap className="w-5 h-5" />, title: 'Lightning Fast', desc: 'Sub-second response times' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 flex-col justify-between relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="flex items-center gap-2.5 mb-8"
          >
            <div className="bg-white/20 backdrop-blur-lg p-2 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">EarningsLens AI</h1>
              <p className="text-sm text-blue-100">Intelligent Financial Analysis</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Transform earnings reports into actionable insights
            </h2>
            <p className="text-blue-100 text-base mb-8">
              Powered by Claude 4.5 Sonnet and advanced RAG technology with LangChain.
              Get instant, cited answers from quarterly earnings reports.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-3"
                >
                  <div className="text-white mb-1.5 w-5 h-5 flex items-center">{feature.icon}</div>
                  <h3 className="text-white font-semibold mb-0.5 text-sm">{feature.title}</h3>
                  <p className="text-blue-100 text-xs">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10 text-white/80 text-xs"
        >
          <p>© 2024 EarningsLens AI • Powered by Anthropic Claude</p>
          <p className="mt-0.5">TCS • Infosys • Wipro • Q1 FY2023 - Q4 FY2024</p>
        </motion.div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-block p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EarningsLens AI
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Intelligent Financial Analysis</p>
          </div>

          {/* Form Card */}
          <motion.div
            layout
            className="backdrop-blur-lg bg-white/80 border border-white/40 rounded-2xl shadow-2xl p-6"
          >
            {/* Tab Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isLogin
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Login
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all text-sm ${
                  !isLogin
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Register
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-1.5">
                  {isLogin ? 'Welcome back!' : 'Create your account'}
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  {isLogin
                    ? 'Enter your credentials to access your dashboard'
                    : 'Sign up to start analyzing earnings reports'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-white/80 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm bg-white/80 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    {!isLogin && (
                      <p className="text-xs text-gray-500 mt-1">
                        At least 6 characters
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Processing...
                      </span>
                    ) : (
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    )}
                  </motion.button>
                </form>

                {/* Toggle Link */}
                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-sm">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-blue-600 hover:text-purple-600 font-semibold transition-colors"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-3 gap-3 text-center"
          >
            <div className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-xl p-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">3</p>
              <p className="text-xs text-gray-600">Companies</p>
            </div>
            <div className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-xl p-3">
              <BarChart3 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">12</p>
              <p className="text-xs text-gray-600">Quarters</p>
            </div>
            <div className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-xl p-3">
              <Zap className="w-5 h-5 text-pink-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">&lt;2s</p>
              <p className="text-xs text-gray-600">Response</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
