import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI, conversationsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ChartRenderer from '../components/ChartRenderer';
import {
  Send,
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Copy,
  Check,
  RefreshCw,
  Download
} from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentCitations, setCurrentCitations] = useState(null);
  const [currentChart, setCurrentChart] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { user, logout } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await conversationsAPI.getAll();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    setStreamingMessage('');
    setCurrentCitations(null);
    setCurrentChart(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await chatAPI.sendMessage(input.trim(), conversationId);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let fullResponse = '';
      let receivedCitations = null;
      let receivedChart = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'conversation_id') {
                setConversationId(data.conversationId);
              } else if (data.type === 'token') {
                fullResponse += data.token;
                setStreamingMessage(fullResponse);
              } else if (data.type === 'citations') {
                receivedCitations = data.citations;
                setCurrentCitations(data.citations);
              } else if (data.type === 'chart') {
                receivedChart = data.data;
                setCurrentChart(data.data);
              } else if (data.type === 'done') {
                const assistantMessage = {
                  role: 'assistant',
                  content: fullResponse,
                  citations: receivedCitations,
                  chart: receivedChart,
                  timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingMessage('');
                setCurrentCitations(null);
                loadConversations();
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setStreamingMessage('');
    setCurrentCitations(null);
    toast.success('New conversation started');
  };

  const loadConversation = async (id) => {
    try {
      const data = await conversationsAPI.getById(id);
      setMessages(data.messages);
      setConversationId(id);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
      {/* Sidebar - Always visible, expands/collapses */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 240 : 56
        }}
        transition={{
          type: 'tween',
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="bg-slate-800/95 backdrop-blur-xl flex flex-col border-r border-slate-700/50 shadow-2xl relative overflow-hidden"
      >
            {/* Sidebar Header */}
            <div className="p-2 border-b border-slate-700/50 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2 min-h-[40px]">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer flex-shrink-0"
                >
                  <span className="text-base font-bold text-white">E</span>
                </motion.div>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <h1 className="text-sm font-bold text-white whitespace-nowrap">EarningsLens</h1>
                      <p className="text-xs text-slate-400 whitespace-nowrap">AI Assistant</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={startNewChat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 font-medium"
                title={!sidebarOpen ? "New Chat" : ""}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      New Chat
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold text-slate-400 px-2 py-1.5 uppercase tracking-wider"
                  >
                    Recent
                  </motion.div>
                )}
              </AnimatePresence>
              {Array.isArray(conversations) && conversations.length > 0 ? (
                conversations.slice(0, 15).map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    whileHover={{ x: 2 }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg mb-0.5 transition-all group text-sm ${
                      conversationId === conv.id
                        ? 'bg-slate-700/70 border border-slate-600/50'
                        : 'hover:bg-slate-700/50 border border-transparent'
                    }`}
                    title={!sidebarOpen ? conv.title : ""}
                  >
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                      conversationId === conv.id
                        ? 'text-blue-400'
                        : 'text-slate-400'
                    }`} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`text-xs truncate text-left flex-1 overflow-hidden ${
                            conversationId === conv.id
                              ? 'text-white font-medium'
                              : 'text-slate-300'
                          }`}
                        >
                          {conv.title || 'Untitled Chat'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))
              ) : (
                sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3 py-8 text-center"
                  >
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs text-slate-500">No conversations yet</p>
                    <p className="text-xs text-slate-600 mt-1">Start a new chat to begin</p>
                  </motion.div>
                )
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-slate-700/50 p-2 flex-shrink-0">
              <div className="flex items-center gap-2 px-2 py-2 mb-2 rounded-lg bg-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-md flex-shrink-0">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-w-0 overflow-hidden"
                    >
                      <p className="text-xs font-medium text-white truncate">{user?.email}</p>
                      <p className="text-xs text-slate-400">Pro</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={() => {
                  logout();
                  toast.success('Logged out successfully');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                title={!sidebarOpen ? "Sign Out" : ""}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs whitespace-nowrap overflow-hidden"
                    >
                      Sign Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-14 border-b border-slate-700/50 backdrop-blur-xl bg-slate-800/80 flex items-center justify-between px-4 shadow-lg z-10">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all lg:hidden"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </motion.button>
            <div>
              <h1 className="text-base font-bold text-white">
                {conversationId ? 'Chat Session' : 'New Conversation'}
              </h1>
              <p className="text-xs text-slate-400">Powered by Claude AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 text-xs font-medium"
            >
              Pro
            </motion.button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 pb-32">
            {messages.length === 0 && !streamingMessage ? (
              <EmptyState setInput={setInput} />
            ) : (
              <div className="py-8 space-y-8">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    index={index}
                    copyToClipboard={copyToClipboard}
                    copiedIndex={copiedIndex}
                  />
                ))}

                {streamingMessage && (
                  <MessageBubble
                    message={{
                      role: 'assistant',
                      content: streamingMessage,
                      citations: currentCitations,
                      chart: currentChart,
                    }}
                    index={-1}
                    isStreaming
                  />
                )}

                {loading && !streamingMessage && (
                  <div className="flex gap-5 items-start">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                      <span className="text-white text-lg font-bold">E</span>
                    </div>
                    <div className="flex-1 pt-3">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pb-6 pt-8 pointer-events-none">
          <div className="max-w-3xl mx-auto px-4 pointer-events-auto">
            <div className="relative bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700/50 rounded-xl shadow-2xl focus-within:border-blue-500/50 focus-within:shadow-blue-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about earnings, financials, or company performance..."
                className="w-full px-4 py-3 pr-14 bg-transparent resize-none focus:outline-none text-white placeholder:text-slate-400 text-sm"
                rows="1"
                style={{ maxHeight: '200px' }}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 disabled:shadow-none disabled:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-center text-slate-400 mt-3">
              EarningsLens AI may produce inaccurate information. Always verify critical data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ setInput }) {
  const examples = [
    {
      icon: '📊',
      title: 'Revenue Analysis',
      prompt: 'What was TCS revenue in Q4 FY2024?',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '📈',
      title: 'Company Comparison',
      prompt: 'Compare Infosys and Wipro profit margins',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '👥',
      title: 'Growth Metrics',
      prompt: 'Show employee growth trends for TCS',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💡',
      title: 'Quarter Highlights',
      prompt: 'What were key highlights in Q1 FY2024?',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center py-8 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mb-5 shadow-xl shadow-blue-500/20"
      >
        <span className="text-2xl font-bold text-white">E</span>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-2 text-center bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
      >
        Welcome to EarningsLens AI
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-slate-400 mb-3 text-center max-w-xl"
      >
        Your intelligent assistant for analyzing IT company earnings and financial data
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2.5 mb-6 px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700/50 shadow-lg"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-slate-300">Powered by Claude AI</span>
        </div>
        <div className="w-px h-3 bg-slate-700"></div>
        <span className="text-xs text-slate-400">TCS • Infosys • Wipro</span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-5">
        {examples.map((example, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200 }}
            onClick={() => setInput(example.prompt)}
            className="relative p-4 text-left bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${example.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl">{example.icon}</span>
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">
                  {example.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {example.prompt}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center max-w-2xl"
      >
        <p className="text-xs text-slate-500 mb-2">
          Try asking about revenue, profit margins, growth trends, or quarterly performance
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
            <span>Real-time analysis</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-500"></div>
            <span>Source citations</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-purple-500"></div>
            <span>Multi-company comparison</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MessageBubble({ message, index, copyToClipboard, copiedIndex, isStreaming }) {
  const isUser = message.role === 'user';
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-5 items-start">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-gray-700 to-gray-900 shadow-gray-500/20'
            : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-blue-500/30'
        }`}>
          <span className="text-sm font-bold text-white">
            {isUser ? 'Y' : 'E'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3 pt-0.5">
          <div className={`${
            isUser
              ? 'text-white font-medium text-sm whitespace-pre-wrap'
              : 'text-slate-100 leading-relaxed text-sm'
          }`}>
            {isUser ? (
              message.content
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 ml-1 bg-blue-600 rounded-sm"
              />
            )}
          </div>

          {/* Chart Rendering */}
          {message.chart && !isUser && (
            <ChartRenderer chartData={message.chart} />
          )}

          {/* Actions */}
          {!isUser && !isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showActions ? 1 : 0 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => copyToClipboard(message.content, index)}
                className="px-2.5 py-1.5 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1.5 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-600 text-xs"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </button>
              <button className="px-2.5 py-1.5 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1.5 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-600 text-xs">
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-xs">Regenerate</span>
              </button>
            </motion.div>
          )}

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="space-y-3 mt-5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <span>{message.citations.length} Source{message.citations.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {message.citations.map((citation, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group/citation p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                          [{idx + 1}]
                        </span>
                        <span className="font-bold text-sm text-gray-900">
                          {citation.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="px-2 py-1 bg-white/60 rounded-lg font-medium">
                          {citation.quarter} {citation.year}
                        </span>
                        <span className="px-2 py-1 bg-white/60 rounded-lg font-medium">
                          Page {citation.page}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed line-clamp-2 group-hover/citation:line-clamp-none transition-all">
                      "{citation.passage}"
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
