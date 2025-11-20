import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Sparkles, Copy, RotateCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { env } from '../utils/env';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reaction?: 'up' | 'down' | null;
}

interface ChatState {
  isOpen: boolean;
  isWelcome: boolean;
  isFullScreen: boolean;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isWelcome: true,
    isFullScreen: false,
  });

  // Sync external isOpen prop with internal state
  useEffect(() => {
    if (isOpen && !chatState.isOpen) {
      setChatState(prev => ({ ...prev, isOpen: true }));
    }
  }, [isOpen, chatState.isOpen]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCloseChat = () => {
    setChatState({
      isOpen: false,
      isWelcome: true,
      isFullScreen: false,
    });
    onClose();
  };

  const handleStartChat = () => {
    setChatState((prev) => ({
      ...prev,
      isWelcome: false,
    }));
  };

  // ✅ NEW: Toggle full-screen mode
  const toggleFullScreen = () => {
    setChatState((prev) => ({
      ...prev,
      isFullScreen: !prev.isFullScreen,
    }));
  };

  // ✅ NEW: Copy message to clipboard
  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // ✅ NEW: Regenerate AI response
  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    // Get the user message before this AI response
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    // Remove the AI response and regenerate
    setMessages(prev => prev.slice(0, messageIndex));
    setIsLoading(true);

    // Reuse handleSendMessage logic
    try {
      if (!env.SUPABASE_URL ||
          env.SUPABASE_URL === '' ||
          !env.SUPABASE_URL.startsWith('http') ||
          env.SUPABASE_URL.includes('your-project') ||
          env.SUPABASE_URL.includes('YOUR_') ||
          !env.SUPABASE_ANON_KEY ||
          env.SUPABASE_ANON_KEY === '') {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '⚠️ AI chat is not configured yet. Please contact us directly via email for assistance.',
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const apiUrl = `${env.SUPABASE_URL}/functions/v1/ai-chatbot`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(0, messageIndex - 1).slice(-4).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I encountered a temporary issue. Please try again in a moment.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Add reaction to message
  const addReaction = (messageId: string, reaction: 'up' | 'down') => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
        : msg
    ));
  };

  // ✅ NEW: Handle suggested prompt click
  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (promptText?: string) => {
    const messageText = promptText || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (!env.SUPABASE_URL ||
          env.SUPABASE_URL === '' ||
          !env.SUPABASE_URL.startsWith('http') ||
          env.SUPABASE_URL.includes('your-project') ||
          env.SUPABASE_URL.includes('YOUR_') ||
          !env.SUPABASE_ANON_KEY ||
          env.SUPABASE_ANON_KEY === '') {
        console.error('❌ AI chat not configured - missing or invalid environment variables');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ AI chat is not configured yet. Please contact us directly via email for assistance.',
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const apiUrl = `${env.SUPABASE_URL}/functions/v1/ai-chatbot`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-4).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I encountered a temporary issue. Please try again in a moment.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ NEW: Suggested prompts
  const suggestedPrompts = [
    "What services do you offer?",
    "How much does a website cost?",
    "Can you help with e-commerce?",
    "Tell me about your process",
    "Do you offer maintenance?",
    "What's your turnaround time?"
  ];

  // Dynamic sizing based on full-screen mode
  const chatContainerClass = chatState.isFullScreen
    ? "fixed inset-4 sm:inset-6 md:inset-8 z-50 w-auto"
    : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 w-[calc(100%-2rem)] sm:w-96 md:max-w-md";

  const chatHeightStyle = chatState.isFullScreen
    ? { height: '100%', maxHeight: '100%' }
    : { height: 'min(calc(100vh - 8rem), 600px)', maxHeight: 'calc(100vh - 2rem)' };

  return (
    <>
      <AnimatePresence>
        {chatState.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className={`${chatContainerClass} overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700 flex flex-col`}
            style={{
              ...chatHeightStyle,
              background: 'linear-gradient(135deg, #0f172a 0%, #1a1f35 50%, #111827 100%)',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(8, 145, 178, 0.15)',
            }}
          >
            {/* Header */}
            <motion.div
              className="relative overflow-hidden p-4 md:p-6"
              style={{
                background: 'linear-gradient(135deg, #0891b2 0%, #0284c7 50%, #0369a1 100%)',
              }}
            >
              <motion.div
                animate={{ x: [-100, 100] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                }}
              />

              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg md:text-xl font-bold text-white flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Elite AI Assistant
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs md:text-sm text-cyan-100"
                  >
                    Premium Expertise • Instant Insights
                  </motion.p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullScreen}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={chatState.isFullScreen ? "Exit full-screen" : "Enter full-screen"}
                  >
                    {chatState.isFullScreen ? (
                      <Minimize2 className="w-5 h-5 text-white" />
                    ) : (
                      <Maximize2 className="w-5 h-5 text-white" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCloseChat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Close chat"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Welcome Screen */}
            {chatState.isWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center space-y-4 sm:space-y-6 bg-gradient-to-b from-slate-900/50 via-slate-800 to-slate-900 overflow-y-auto"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(8, 145, 178, 0.3)',
                        '0 0 50px rgba(8, 145, 178, 0.6)',
                        '0 0 20px rgba(8, 145, 178, 0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 sm:space-y-3"
                >
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Premium Consultation
                  </h3>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                    Experience elite expertise in web development, SaaS, e-commerce & digital solutions.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Sudharsan's AI delivers exceptional insights tailored to your needs.
                  </p>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.08, boxShadow: '0 20px 40px rgba(8, 145, 178, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="mt-6 sm:mt-8 px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all text-xs sm:text-sm md:text-base"
                >
                  Start Premium Chat
                </motion.button>

                {/* ✅ NEW: Suggested Prompts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full max-w-md space-y-3 mt-6"
                >
                  <p className="text-xs text-slate-400">Quick questions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedPrompts.slice(0, 4).map((prompt, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePromptClick(prompt)}
                        className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-600/50 transition-all text-left"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-slate-400 mt-3 sm:mt-4"
                >
                  ✓ Instant responses • ✓ Expert insights • ✓ 24/7
                </motion.p>
              </motion.div>
            )}

            {/* Chat Messages */}
            {!chatState.isWelcome && (
              <>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-center space-y-3"
                      >
                        <div className="text-4xl">💬</div>
                        <p className="text-slate-400 text-sm">Start a conversation</p>
                      </motion.div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`${message.role === 'assistant' ? 'max-w-[85%]' : 'max-w-xs md:max-w-sm'}`}>
                        <motion.div
                          className={`px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg'
                              : 'bg-slate-700/80 text-slate-100 rounded-bl-none border border-slate-600/50 backdrop-blur-sm'
                          }`}
                        >
                          <div className="text-sm md:text-base leading-relaxed break-words">
                            {message.role === 'user' ? (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            ) : (
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-2 last:mb-0 text-slate-100">{children}</p>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-bold text-white">{children}</strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="italic text-slate-50">{children}</em>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1 text-slate-100">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-100">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => <li className="ml-2">{children}</li>,
                                  code: ({ children, ...props }: any) =>
                                    props.inline ? (
                                      <code className="bg-slate-800/50 px-2 py-0.5 rounded text-cyan-300 font-mono text-xs">
                                        {children}
                                      </code>
                                    ) : (
                                      <code className="block bg-slate-800/50 px-3 py-2 rounded my-2 text-cyan-300 font-mono text-xs overflow-x-auto">
                                        {children}
                                      </code>
                                    ),
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-cyan-500 pl-3 my-2 italic text-slate-300">
                                      {children}
                                    </blockquote>
                                  ),
                                  h1: ({ children }) => <h1 className="text-lg font-bold mt-2 mb-1">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                                  a: ({ children, href }) => (
                                    <a
                                      href={href}
                                      className="text-cyan-400 hover:underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </motion.div>

                        {/* ✅ NEW: Message Actions (Copy, Regenerate, Reactions) - AI messages only */}
                        {message.role === 'assistant' && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-1 mt-2 ml-1"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyMessage(message.content, message.id)}
                              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors group/btn"
                              title="Copy message"
                            >
                              {copiedId === message.id ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-200" />
                              )}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => regenerateResponse(message.id)}
                              className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors group/btn"
                              title="Regenerate response"
                              disabled={isLoading}
                            >
                              <RotateCw className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-200" />
                            </motion.button>

                            <div className="w-px h-4 bg-slate-600 mx-1" />

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addReaction(message.id, 'up')}
                              className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${
                                message.reaction === 'up' ? 'bg-slate-700' : ''
                              }`}
                              title="Helpful"
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${
                                message.reaction === 'up' ? 'text-green-400 fill-green-400' : 'text-slate-400'
                              }`} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addReaction(message.id, 'down')}
                              className={`p-1.5 hover:bg-slate-700 rounded-lg transition-colors ${
                                message.reaction === 'down' ? 'bg-slate-700' : ''
                              }`}
                              title="Not helpful"
                            >
                              <ThumbsDown className={`w-3.5 h-3.5 ${
                                message.reaction === 'down' ? 'text-red-400 fill-red-400' : 'text-slate-400'
                              }`} />
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* ✅ ENHANCED: Typing Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-700/80 text-slate-100 px-5 py-4 rounded-2xl rounded-bl-none border border-slate-600/50 backdrop-blur-sm flex items-center gap-3">
                        <div className="flex gap-2">
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15, ease: "easeInOut" }}
                            className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
                            className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-slate-300 font-medium">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div
                  className="border-t p-3 sm:p-4 md:p-6 backdrop-blur-lg"
                  style={{
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    borderTopColor: 'rgba(8, 145, 178, 0.2)',
                  }}
                >
                  <div className="flex gap-2 sm:gap-3 mb-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="flex-1 bg-slate-700/60 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-600/50 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm placeholder-slate-500 disabled:opacity-50 backdrop-blur-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || !inputValue.trim()}
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-500 px-1"
                  >
                    ↵ Enter to send • Powered by Gemini AI
                  </motion.p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
