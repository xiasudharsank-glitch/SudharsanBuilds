import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  isOpen: boolean;
  isWelcome: boolean;
  isMinimized: boolean;
}

export default function AIChatbot() {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isWelcome: true,
    isMinimized: false,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenChat = () => {
    setChatState({
      isOpen: true,
      isWelcome: true,
      isMinimized: false,
    });
  };

  const handleCloseChat = () => {
    setChatState({
      isOpen: false,
      isWelcome: true,
      isMinimized: false,
    });
  };

  const handleStartChat = () => {
    setChatState((prev) => ({
      ...prev,
      isWelcome: false,
    }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chatbot`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map((msg) => ({
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
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I encountered a temporary issue. Please try again in a moment.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
        timestamp: new Date(),
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

  return (
    <>
      <AnimatePresence>
        {!chatState.isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpenChat}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-16 h-16 md:w-20 md:h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #0284c7 50%, #0369a1 100%)',
              boxShadow: '0 20px 50px rgba(8, 145, 178, 0.4), 0 0 60px rgba(8, 145, 178, 0.2)',
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(8, 145, 178, 0.5)',
                  '0 0 40px rgba(8, 145, 178, 0.8)',
                  '0 0 20px rgba(8, 145, 178, 0.5)',
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-transparent"
              style={{
                borderImage: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent) 1',
              }}
            />

            <div className="relative flex flex-col items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>
              <span className="text-xs font-bold text-white mt-1">Elite AI</span>
            </div>

            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full shadow-lg"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-300 rounded-full shadow-lg"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatState.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-full max-w-sm md:max-w-md overflow-hidden rounded-3xl shadow-2xl border border-slate-700 flex flex-col"
            style={{
              height: '600px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1a1f35 50%, #111827 100%)',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(8, 145, 178, 0.15)',
            }}
          >
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
                  <button
                    onClick={() => setChatState((prev) => ({ ...prev, isMinimized: !prev.isMinimized }))}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {chatState.isMinimized ? (
                      <Maximize2 className="w-5 h-5 text-white" />
                    ) : (
                      <Minimize2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <button
                    onClick={handleCloseChat}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>

            {chatState.isMinimized && (
              <div className="flex-1 flex items-center justify-center bg-slate-800/50">
                <p className="text-slate-300 text-center px-4 text-sm">Expand to continue conversation</p>
              </div>
            )}

            {!chatState.isMinimized && chatState.isWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6 bg-gradient-to-b from-slate-900/50 via-slate-800 to-slate-900"
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
                    className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Premium Consultation Awaits
                  </h3>
                  <p className="text-base md:text-lg text-slate-200 leading-relaxed font-medium">
                    Experience elite-level expertise. Ask about web development, SaaS solutions, e-commerce, or anything digital.
                  </p>
                  <p className="text-sm md:text-base text-slate-400">
                    Sudharsan's AI is trained to deliver exceptional insights that will exceed your expectations.
                  </p>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.08, boxShadow: '0 20px 40px rgba(8, 145, 178, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="mt-8 px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all text-sm md:text-base"
                >
                  Start Premium Chat
                </motion.button>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-slate-400 mt-4"
                >
                  ✓ Instant responses • ✓ Expert insights • ✓ 24/7 availability
                </motion.p>
              </motion.div>
            )}

            {!chatState.isMinimized && !chatState.isWelcome && (
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
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        className={`max-w-xs md:max-w-sm px-5 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg'
                            : 'bg-slate-700/80 text-slate-100 rounded-bl-none border border-slate-600/50 backdrop-blur-sm'
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-cyan-100' : 'text-slate-400'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-700/80 text-slate-100 px-5 py-4 rounded-2xl rounded-bl-none border border-slate-600/50 backdrop-blur-sm flex items-center gap-3">
                        <div className="flex gap-2">
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-cyan-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-slate-400 ml-2">Thinking...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div
                  className="border-t p-4 md:p-6 backdrop-blur-lg"
                  style={{
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    borderTopColor: 'rgba(8, 145, 178, 0.2)',
                  }}
                >
                  <div className="flex gap-3 mb-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="flex-1 bg-slate-700/60 text-white px-4 py-3 md:py-3 rounded-xl border border-slate-600/50 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm md:text-base placeholder-slate-500 disabled:opacity-50 backdrop-blur-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <Send className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.button>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-500"
                  >
                    Press Enter to send • Powered by Mistral AI
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