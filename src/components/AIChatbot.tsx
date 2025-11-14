import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
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
      isWelcome: messages.length === 0, // Keep welcome state if no messages
      isMinimized: false,
    });
  };

  const handleCloseChat = () => {
    setChatState({
      isOpen: false,
      isWelcome: true,
      isMinimized: false,
    });
    // FIX 2: Clear messages on close
    setMessages([]); 
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
    
    // FIX 1: Create the full conversation history payload for the API
    const updatedConversationHistory = [...messages, userMessage].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

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
          conversationHistory: updatedConversationHistory, // Use the complete history
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
          content: 'Sorry, I encountered an issue. Please try again in a moment.',
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
      {/* Chatbot Button */}
      <AnimatePresence>
        {!chatState.isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpenChat}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-2xl hover:shadow-cyan-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full"
            />
            <div className="relative flex flex-col items-center justify-center">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
              <span className="text-xs font-bold text-white mt-1">AI</span>
            </div>

            {/* Floating notification */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-3 h-3 bg-emerald-400 rounded-full shadow-lg"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {chatState.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-full max-w-sm md:max-w-md h-[600px] md:h-[700px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 md:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Sudharsan's AI Assistant</h2>
                <p className="text-xs md:text-sm text-cyan-100 mt-1">Always here to help</p>
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

            {/* Minimized State */}
            {chatState.isMinimized && (
              <div className="flex-1 flex items-center justify-center bg-slate-800/50">
                <p className="text-slate-400 text-center px-4">Chat minimized. Click maximize to continue.</p>
              </div>
            )}

            {/* Welcome Screen */}
            {!chatState.isMinimized && chatState.isWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>

                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Welcome!
                  </h3>
                  <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                    I'm your AI assistant, powered by cutting-edge technology. I'm here to answer your questions about web development, SaaS, e-commerce, and how we can bring your ideas to life.
                  </p>
                  <p className="text-sm md:text-base text-slate-400">
                    Ask me anything about modern web technologies, project planning, or how Sudharsan can help your business grow.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="mt-6 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all text-sm md:text-base"
                >
                  Start Conversation
                </motion.button>
              </motion.div>
            )}

            {/* Chat Area */}
            {!chatState.isMinimized && !chatState.isWelcome && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <p className="text-center">Start a conversation...</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                            : 'bg-slate-700 text-slate-100 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-cyan-100' : 'text-slate-400'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-2xl rounded-bl-none">
                        <div className="flex gap-2">
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-slate-700 p-4 md:p-6 bg-slate-800/50">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      disabled={isLoading}
                      className="flex-1 bg-slate-700 text-white px-4 py-2.5 md:py-3 rounded-xl border border-slate-600 focus:border-cyan-500 focus:outline-none transition-all text-sm md:text-base placeholder-slate-500 disabled:opacity-50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Press Enter to send</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}