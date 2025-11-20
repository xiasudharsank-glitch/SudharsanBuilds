import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Sparkles, Copy, RotateCw, ThumbsUp, ThumbsDown, Check, Mic, MicOff, Volume2, VolumeX, Download, Search, Trash2, Moon, Sun, Zap, MessageSquare, BookOpen, DollarSign, Clock, Globe, Building2, ShoppingCart, Code2, User, Briefcase, Rocket, Layers, CheckCircle2, ExternalLink, FolderOpen, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CryptoJS from 'crypto-js'; // ✅ FIX #6: Encryption for chat history
import { env } from '../utils/env';
import { useLocation } from 'react-router-dom';
import { PROJECTS_DATA, type Project } from '../data/projectsData';

// Service data structure
interface Service {
  icon: React.ReactNode;
  name: string;
  price: string;
  totalAmount?: number;
  description: string;
  features: string[];
  timeline: string;
  ctaText: string;
  depositAmount?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reaction?: 'up' | 'down' | null;
  context?: string; // Page context when message was sent
  pageSummary?: string; // ✅ Phase 1: True page content summary
  serviceCards?: Service[]; // Service cards to display
  projectCards?: Project[]; // ✅ Phase 1: Project cards to display
  followUpSuggestions?: string[]; // ✅ Phase 1: Smart follow-up questions
  isStreaming?: boolean; // Whether text is currently streaming
  timestamp?: Date; // Timestamp of message
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

// Services data - matches Services.tsx
const SERVICES_DATA: Service[] = [
  {
    icon: <Globe className="w-6 h-6" />,
    name: 'Landing Page',
    price: '₹15,000',
    totalAmount: 15000,
    description: '1-2 page website, modern design, mobile responsive',
    features: ['Responsive Design', 'Contact Form', 'Google Analytics', 'SSL Certificate', 'Fast Loading', 'Basic SEO'],
    timeline: '1-2 weeks',
    ctaText: 'Book Now - Pay ₹5,000 Deposit',
    depositAmount: 5000,
  },
  {
    icon: <User className="w-6 h-6" />,
    name: 'Portfolio Website',
    price: '₹20,000',
    totalAmount: 20000,
    description: 'Professional portfolio for freelancers, designers & developers',
    features: ['Project Gallery', 'About & Skills', 'Resume Download', 'Contact Form', 'Testimonials', 'Mobile Responsive'],
    timeline: '2-3 weeks',
    ctaText: 'Book Now - Pay ₹7,000 Deposit',
    depositAmount: 7000,
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    name: 'Business Website',
    price: '₹30,000',
    totalAmount: 30000,
    description: '5-10 pages, professional design, CMS integration',
    features: ['5-10 Pages', 'CMS Integration', 'Blog Section', 'Advanced Analytics', 'SEO Optimization', 'Contact Forms'],
    timeline: '3-4 weeks',
    ctaText: 'Book Now - Pay ₹10,000 Deposit',
    depositAmount: 10000,
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    name: 'Personal Brand Website',
    price: '₹25,000',
    totalAmount: 25000,
    description: 'Build your personal brand for coaches & consultants',
    features: ['About & Services', 'Blog/Articles', 'Email Newsletter', 'Social Media Integration', 'Booking/Calendar', 'SEO & Analytics'],
    timeline: '3 weeks',
    ctaText: 'Book Now - Pay ₹8,000 Deposit',
    depositAmount: 8000,
  },
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    name: 'E-Commerce Store',
    price: '₹50,000',
    totalAmount: 50000,
    description: 'Complete online store with payment gateway & admin panel',
    features: ['Product Catalog', 'Shopping Cart', 'Razorpay/PayPal', 'Inventory Management', 'Order Tracking', 'Admin Dashboard'],
    timeline: '4-6 weeks',
    ctaText: 'Book Now - Pay ₹15,000 Deposit',
    depositAmount: 15000,
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    name: 'SaaS Product',
    price: '₹75,000+',
    totalAmount: 75000,
    description: 'Full-featured SaaS platform with subscriptions',
    features: ['User Authentication', 'Subscription Billing', 'Admin & User Dashboards', 'API Integration', 'Database Design', 'Scalable Architecture'],
    timeline: '6-10 weeks',
    ctaText: 'Book Now - Pay ₹20,000 Deposit',
    depositAmount: 20000,
  },
  {
    icon: <Layers className="w-6 h-6" />,
    name: 'Web Application',
    price: '₹60,000+',
    totalAmount: 60000,
    description: 'Custom web applications with complex features',
    features: ['Custom Requirements', 'Database & Backend', 'User Management', 'Real-time Features', 'Third-party Integrations', 'Responsive Design'],
    timeline: '5-8 weeks',
    ctaText: 'Book Now - Pay ₹18,000 Deposit',
    depositAmount: 18000,
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    name: 'Custom Development',
    price: '₹500-₹1000/hour',
    description: 'Hourly-based custom projects & maintenance',
    features: ['Custom Requirements', 'Full-stack Development', 'API Integration', 'Bug Fixes & Updates', 'Code Reviews', 'Ongoing Support'],
    timeline: 'Flexible',
    ctaText: 'Get Quote - Discuss Project',
  },
];

// Intent detection - detects if user is asking about services, pricing, or specific categories
const detectIntent = (message: string): { showCards: boolean; filteredServices?: Service[] } => {
  const lowerMessage = message.toLowerCase();

  // Specific service type queries
  if (lowerMessage.match(/portfolio|personal.*(website|site)/i)) {
    return { showCards: true, filteredServices: SERVICES_DATA.filter(s => s.name.includes('Portfolio') || s.name.includes('Personal Brand')) };
  }
  if (lowerMessage.match(/ecommerce|e-commerce|online store|shop/i)) {
    return { showCards: true, filteredServices: SERVICES_DATA.filter(s => s.name.includes('E-Commerce')) };
  }
  if (lowerMessage.match(/saas|software.*service|subscription/i)) {
    return { showCards: true, filteredServices: SERVICES_DATA.filter(s => s.name.includes('SaaS')) };
  }
  if (lowerMessage.match(/business.*(website|site)/i)) {
    return { showCards: true, filteredServices: SERVICES_DATA.filter(s => s.name.includes('Business')) };
  }
  if (lowerMessage.match(/landing.*page|simple.*(website|site)/i)) {
    return { showCards: true, filteredServices: SERVICES_DATA.filter(s => s.name.includes('Landing')) };
  }

  // General service/pricing queries
  if (lowerMessage.match(/service|what.*offer|pricing|price|cost|how much|package|plan/i)) {
    return { showCards: true, filteredServices: SERVICES_DATA.slice(0, 4) }; // Show top 4 popular services
  }

  // Show all services
  if (lowerMessage.match(/show.*all|view.*all|see.*all.*service/i)) {
    return { showCards: true, filteredServices: SERVICES_DATA };
  }

  return { showCards: false };
};

// ✅ Phase 1: Project intent detection - detects if user is asking about projects/portfolio
const detectProjectIntent = (message: string): { showProjects: boolean; filteredProjects?: Project[] } => {
  const lowerMessage = message.toLowerCase();

  // Portfolio/Projects queries
  if (lowerMessage.match(/project|portfolio|work|showcase|example|built|created|recent work/i)) {
    return { showProjects: true, filteredProjects: PROJECTS_DATA.filter(p => p.featured).slice(0, 3) };
  }

  // Specific project type queries
  if (lowerMessage.match(/client.*(work|project)/i)) {
    return { showProjects: true, filteredProjects: PROJECTS_DATA.filter(p => p.type === 'client' || p.type === 'freelance') };
  }
  if (lowerMessage.match(/personal.*(work|project)/i)) {
    return { showProjects: true, filteredProjects: PROJECTS_DATA.filter(p => p.type === 'personal') };
  }

  // Show all projects
  if (lowerMessage.match(/show.*all.*project|view.*all.*project|see.*all.*project/i)) {
    return { showProjects: true, filteredProjects: PROJECTS_DATA };
  }

  return { showProjects: false };
};

// ✅ Phase 1: True page summarization - reads actual DOM content
const getPageSummary = (pathname: string): string => {
  try {
    // Get the main content area
    const mainContent = document.querySelector('main') || document.body;

    // Extract key headings
    const headings = Array.from(mainContent.querySelectorAll('h1, h2, h3'))
      .slice(0, 5)
      .map(h => h.textContent?.trim())
      .filter(Boolean);

    // Extract key paragraphs (first sentence of each)
    const paragraphs = Array.from(mainContent.querySelectorAll('p'))
      .slice(0, 3)
      .map(p => {
        const text = p.textContent?.trim() || '';
        return text.split('.')[0] + '.';
      })
      .filter(text => text.length > 20 && text.length < 200);

    // Build summary
    const summary = [
      `Current page: ${pathname}`,
      headings.length > 0 ? `Key sections: ${headings.join(', ')}` : '',
      paragraphs.length > 0 ? `Content: ${paragraphs.join(' ')}` : ''
    ].filter(Boolean).join(' | ');

    return summary || `Viewing ${pathname} page`;
  } catch (error) {
    console.error('Error getting page summary:', error);
    return `Viewing ${pathname} page`;
  }
};

// ✅ Phase 1: Smart follow-up suggestions based on message context
const getFollowUpSuggestions = (userMessage: string, assistantMessage: string, context: string): string[] => {
  const lowerUserMsg = userMessage.toLowerCase();
  const lowerAssistantMsg = assistantMessage.toLowerCase();

  // Service-related follow-ups
  if (lowerUserMsg.match(/service|pricing|cost|price/i)) {
    return [
      "What's included in the pricing?",
      "Do you offer payment plans?",
      "How long does it take?",
      "Can I see examples of your work?"
    ];
  }

  // Project-related follow-ups
  if (lowerUserMsg.match(/project|portfolio|work|example/i)) {
    return [
      "What services do you offer?",
      "How much does a similar project cost?",
      "What technologies do you use?",
      "Can you customize this for me?"
    ];
  }

  // Timeline-related follow-ups
  if (lowerUserMsg.match(/how long|timeline|duration|time/i)) {
    return [
      "What's the process like?",
      "Can we start immediately?",
      "What information do you need?",
      "What about maintenance?"
    ];
  }

  // Process-related follow-ups
  if (lowerUserMsg.match(/process|workflow|how.*work/i)) {
    return [
      "What do I need to prepare?",
      "How do we communicate?",
      "What's the payment structure?",
      "Can I request changes?"
    ];
  }

  // Default follow-ups
  return [
    "Tell me about your services",
    "Show me your projects",
    "What are your rates?",
    "How can we get started?"
  ];
};

// Streaming effect hook for typewriter animation
const useStreamingText = (finalText: string, isActive: boolean, speed: number = 15) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive || !finalText) {
      setDisplayedText(finalText);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < finalText.length) {
        setDisplayedText(finalText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [finalText, isActive, speed]);

  return { displayedText, isComplete };
};

// Service Card Component - Mini version for chat
const ServiceCardInChat = ({ service, isDarkMode }: { service: Service; isDarkMode: boolean }) => {
  const handleBooking = () => {
    // Scroll to services section on main page
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${isDarkMode ? 'bg-slate-800/90' : 'bg-white'} p-4 rounded-xl border ${isDarkMode ? 'border-slate-600/50 hover:border-cyan-500/50' : 'border-slate-200 hover:border-cyan-400'} transition-all shadow-lg backdrop-blur-sm`}
    >
      {/* Icon & Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
          {service.icon}
        </div>
        <div>
          <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{service.name}</h4>
          <p className="text-cyan-400 font-bold text-lg">{service.price}</p>
        </div>
      </div>

      {/* Description */}
      <p className={`text-xs mb-3 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{service.description}</p>

      {/* Timeline */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-3 h-3 text-cyan-400" />
        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{service.timeline}</span>
      </div>

      {/* Features (show only 3) */}
      <ul className="space-y-1 mb-3">
        {service.features.slice(0, 3).map((feature, idx) => (
          <li key={idx} className={`flex items-start gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
        {service.features.length > 3 && (
          <li className={`text-xs ml-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>+{service.features.length - 3} more features</li>
        )}
      </ul>

      {/* CTA Button */}
      <button
        onClick={handleBooking}
        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
      >
        {service.ctaText}
      </button>
    </motion.div>
  );
};

// ✅ Phase 1: Project Card Component - Mini version for chat
const ProjectCardInChat = ({ project, isDarkMode }: { project: Project; isDarkMode: boolean }) => {
  const handleViewProject = () => {
    // Open project in new tab
    window.open(project.link, '_blank', 'noopener,noreferrer');
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'completed':
        return 'bg-green-900/50 text-green-400';
      case 'in-progress':
        return 'bg-blue-900/50 text-blue-400';
      case 'on-hold':
        return 'bg-amber-900/50 text-amber-400';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getTypeIcon = () => {
    switch (project.type) {
      case 'client':
      case 'freelance':
        return <Briefcase className="w-4 h-4" />;
      case 'personal':
        return <FolderOpen className="w-4 h-4" />;
      default:
        return <Code2 className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${isDarkMode ? 'bg-slate-800/90' : 'bg-white'} p-4 rounded-xl border ${isDarkMode ? 'border-slate-600/50 hover:border-purple-500/50' : 'border-slate-200 hover:border-purple-400'} transition-all shadow-lg backdrop-blur-sm`}
    >
      {/* Title & Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            {getTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {project.title}
            </h4>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${getStatusColor()}`}>
          {project.status === 'in-progress' ? 'In Progress' : project.status === 'on-hold' ? 'On Hold' : 'Completed'}
        </span>
      </div>

      {/* Description */}
      <p className={`text-xs mb-3 leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
        {project.description}
      </p>

      {/* Tech Stack (show only 3) */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.techStack.slice(0, 3).map((tech, idx) => (
          <span key={idx} className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
            {tech.name}
          </span>
        ))}
        {project.techStack.length > 3 && (
          <span className={`px-2 py-0.5 text-xs rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
            +{project.techStack.length - 3}
          </span>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleViewProject}
        className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-1.5"
      >
        View Project
        <ExternalLink className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

// Message Bubble Component with Streaming
const MessageBubble = ({ message, isStreaming, isDarkMode, addReaction, copyMessage, readAloud, isSpeaking, currentSpeakingId, onFollowUpClick }: {
  message: Message;
  isStreaming: boolean;
  isDarkMode: boolean;
  addReaction: (id: string, reaction: 'up' | 'down') => void;
  copyMessage: (id: string, content: string) => void;
  readAloud: (content: string, id: string) => void;
  isSpeaking: boolean;
  currentSpeakingId: string | null;
  onFollowUpClick?: (suggestion: string) => void; // ✅ Phase 1: Callback for follow-up clicks
}) => {
  const { displayedText } = useStreamingText(message.content, isStreaming, 15);
  const contentToShow = isStreaming ? displayedText : message.content;

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <motion.div
          className={`max-w-xs md:max-w-sm px-4 py-3 rounded-2xl ${
            message.role === 'user'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-lg'
              : isDarkMode
              ? 'bg-slate-700/80 text-slate-100 rounded-bl-none border border-slate-600/50 backdrop-blur-sm'
              : 'bg-white text-slate-900 rounded-bl-none border border-slate-200 shadow-lg'
          }`}
        >
          <div className="text-sm md:text-base leading-relaxed break-words">
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className={`mb-2 last:mb-0 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{children}</strong>
                    ),
                    code: ({ inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={isDarkMode ? vscDarkPlus : vs}
                          language={match[1]}
                          PreTag="div"
                          className="rounded my-2 text-xs"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={`${isDarkMode ? 'bg-slate-800/50 text-cyan-300' : 'bg-slate-200 text-cyan-600'} px-2 py-0.5 rounded font-mono text-xs`} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {contentToShow}
                </ReactMarkdown>
                {isStreaming && <span className="inline-block w-1 h-4 bg-cyan-400 ml-1 animate-pulse" />}
              </div>
            )}
          </div>

          {/* Message Actions & Timestamp (only for assistant messages) */}
          {message.role === 'assistant' && !isStreaming && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-600/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyMessage(message.id, message.content)}
                  className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-slate-600/50' : 'hover:bg-slate-100'} transition-colors`}
                  title="Copy message"
                  aria-label="Copy message to clipboard" // ✅ FIX: Add aria-label for accessibility
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => readAloud(message.content, message.id)}
                  className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-slate-600/50' : 'hover:bg-slate-100'} transition-colors ${isSpeaking && currentSpeakingId === message.id ? 'text-cyan-400' : ''}`}
                  title={isSpeaking && currentSpeakingId === message.id ? 'Stop reading' : 'Read aloud'}
                  aria-label={isSpeaking && currentSpeakingId === message.id ? 'Stop reading message' : 'Read message aloud'} // ✅ FIX: Add aria-label for accessibility
                >
                  {isSpeaking && currentSpeakingId === message.id ? (
                    <VolumeX className="w-3 h-3" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={() => addReaction(message.id, 'up')}
                  className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-slate-600/50' : 'hover:bg-slate-100'} transition-colors ${message.reaction === 'up' ? 'text-green-400' : ''}`}
                  title="Helpful"
                  aria-label="Mark as helpful" // ✅ FIX: Add aria-label for accessibility
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => addReaction(message.id, 'down')}
                  className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-slate-600/50' : 'hover:bg-slate-100'} transition-colors ${message.reaction === 'down' ? 'text-red-400' : ''}`}
                  title="Not helpful"
                  aria-label="Mark as not helpful" // ✅ FIX: Add aria-label for accessibility
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}

          {message.role === 'user' && (
            <p className="text-xs mt-2.5 text-cyan-100">
              {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Render Service Cards if present */}
      {message.serviceCards && message.serviceCards.length > 0 && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-3 ml-0"
        >
          {message.serviceCards.map((service, idx) => (
            <ServiceCardInChat key={idx} service={service} isDarkMode={isDarkMode} />
          ))}
        </motion.div>
      )}

      {/* ✅ Phase 1: Render Project Cards if present */}
      {message.projectCards && message.projectCards.length > 0 && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-3 ml-0"
        >
          {message.projectCards.map((project, idx) => (
            <ProjectCardInChat key={idx} project={project} isDarkMode={isDarkMode} />
          ))}
        </motion.div>
      )}

      {/* ✅ Phase 1: Render Smart Follow-Up Suggestions if present */}
      {message.followUpSuggestions && message.followUpSuggestions.length > 0 && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className={`w-3 h-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              You might also want to ask:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.followUpSuggestions.slice(0, 4).map((suggestion, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                onClick={() => {
                  if (onFollowUpClick) {
                    onFollowUpClick(suggestion);
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  isDarkMode
                    ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600/50'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
                }`}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ✅ Dark Mode Context
const THEME_STORAGE_KEY = 'ai-chat-theme';
const CHAT_HISTORY_KEY = 'ai-chat-history';
const USER_ID_KEY = 'ai-chat-user-id'; // ✅ Phase 2: Persistent user ID
const MESSAGE_COUNT_KEY = 'ai-chat-message-count';
const MESSAGE_COUNT_DATE_KEY = 'ai-chat-message-count-date';

// ✅ Phase 2: Generate or retrieve persistent user ID
const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    // Generate unique user ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export default function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const location = useLocation();

  // ✅ Phase 2: Persistent User ID
  const [userId] = useState<string>(getUserId());

  // ✅ Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? JSON.parse(saved) : true; // Default dark
  });

  // ✅ Phase 2: Function Call Execution
  const executeFunctionCall = (functionName: string, args: any) => {
    console.log(`🔧 Executing function: ${functionName}`, args);

    switch (functionName) {
      case 'scrollToSection':
        const sectionId = args.section;
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close chat to show the section
          setTimeout(() => {
            handleCloseChat();
          }, 500);
        }
        break;

      case 'openContactForm':
        // Scroll to contact section
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          // Prefill message if provided
          if (args.prefillMessage) {
            setTimeout(() => {
              const messageInput = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
              if (messageInput) {
                messageInput.value = args.prefillMessage;
              }
            }, 800);
          }
          // Close chat after navigating
          setTimeout(() => {
            handleCloseChat();
          }, 1000);
        }
        break;

      case 'showServiceDetails':
        // Scroll to services section
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
          // Close chat to show services
          setTimeout(() => {
            handleCloseChat();
          }, 500);
        }
        break;

      default:
        console.warn(`Unknown function: ${functionName}`);
    }
  };

  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isWelcome: true,
    isFullScreen: false,
  });

  useEffect(() => {
    if (isOpen && !chatState.isOpen) {
      setChatState(prev => ({ ...prev, isOpen: true }));
      // Load chat history on open
      loadChatHistory();
    }
  }, [isOpen, chatState.isOpen]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ✅ Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // ✅ Read Aloud State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  // ✅ Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // ✅ Rate Limiting State (free tier)
  const [messageCount, setMessageCount] = useState(0);
  const MESSAGE_LIMIT = 50; // Daily limit for free tier

  // ✅ Streaming State (for typewriter effect)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // ✅ FIX: Track current speech utterance for cleanup
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // ✅ FIX: Track current API request for cancellation (prevents race conditions)
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // ✅ FIX: Cleanup speech synthesis and API requests on component unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      // Stop any ongoing voice recognition
      if (recognition) {
        recognition.stop();
      }
      // Abort any ongoing API requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [recognition]);

  // ✅ Toggle Dark Mode
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
  };

  // ✅ Save Chat History - FIX #6: Encrypt before saving with quota error handling
  const saveChatHistory = (msgs: Message[]) => {
    try {
      // ✅ FIX #6: Encrypt chat history using user ID as encryption key
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(msgs),
        userId // Use persistent user ID as encryption key
      ).toString();

      localStorage.setItem(CHAT_HISTORY_KEY, encrypted);
    } catch (error) {
      // ✅ FIX: Handle QuotaExceededError specifically
      if (error instanceof Error &&
          (error.name === 'QuotaExceededError' ||
           error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn('⚠️ LocalStorage quota exceeded. Attempting cleanup...');

        try {
          // Attempt 1: Save only last 20 messages (encrypted)
          const trimmedMessages = msgs.slice(-20);
          const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(trimmedMessages),
            userId
          ).toString();
          localStorage.setItem(CHAT_HISTORY_KEY, encrypted);
          console.log('✅ Chat history trimmed to last 20 messages');

          // Notify user
          setTimeout(() => {
            alert('⚠️ Storage limit reached. Older chat history has been removed to save new messages.');
          }, 100);
        } catch (retryError) {
          // Attempt 2: Clear chat history completely
          console.error('❌ Still out of space. Clearing chat history...');
          try {
            localStorage.removeItem(CHAT_HISTORY_KEY);
            alert('⚠️ Unable to save chat history due to storage limits. Please export your chat or clear browser data.');
          } catch (clearError) {
            console.error('❌ Failed to clear storage:', clearError);
          }
        }
      } else {
        console.error('Failed to save chat history:', error);
      }
    }
  };

  // ✅ Load Chat History - FIX #6: Decrypt after loading
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        // ✅ FIX #6: Decrypt chat history using user ID as decryption key
        try {
          const decrypted = CryptoJS.AES.decrypt(saved, userId).toString(CryptoJS.enc.Utf8);

          if (!decrypted) {
            // Decryption failed - data might be corrupted or key mismatch
            console.warn('⚠️ Failed to decrypt chat history - clearing corrupted data');
            localStorage.removeItem(CHAT_HISTORY_KEY);
            return;
          }

          const history = JSON.parse(decrypted);
          if (Array.isArray(history) && history.length > 0) {
            setMessages(history);
            setChatState(prev => ({ ...prev, isWelcome: false }));
          }
        } catch (decryptError) {
          // Handle decryption or parsing errors
          console.error('Failed to decrypt chat history:', decryptError);
          console.warn('⚠️ Clearing corrupted chat history data');
          // Clear corrupted data to allow fresh start
          localStorage.removeItem(CHAT_HISTORY_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  // ✅ Clear Chat History
  const clearChatHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
      localStorage.removeItem(CHAT_HISTORY_KEY);
      setChatState(prev => ({ ...prev, isWelcome: true }));
    }
  };

  // ✅ Export Chat
  const exportChat = (format: 'txt' | 'json') => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      filename = `chat-export-${new Date().toISOString()}.json`;
      mimeType = 'application/json';
    } else {
      content = messages.map(msg =>
        `[${msg.role.toUpperCase()}]${msg.context ? ` (${msg.context})` : ''}\n${msg.content}\n\n`
      ).join('---\n\n');
      filename = `chat-export-${new Date().toISOString()}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✅ Voice Input Toggle
  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Voice input not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // ✅ Read Aloud - FIX: Proper cleanup to prevent memory leaks
  const readAloud = (content: string, messageId: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser.');
      return;
    }

    // Stop if already speaking
    if (isSpeaking && currentSpeakingId === messageId) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      return;
    }

    // Stop any ongoing speech and clean up previous utterance
    window.speechSynthesis.cancel();
    currentUtteranceRef.current = null;

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      currentUtteranceRef.current = null;
    };

    // Store reference for cleanup
    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // ✅ Get Current Page Context
  const getPageContext = (): string => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'HomePage';
    if (path.includes('/services')) return 'ServicesPage';
    if (path.includes('/projects')) return 'ProjectsPage';
    if (path.includes('/about')) return 'AboutPage';
    if (path.includes('/contact')) return 'ContactPage';
    if (path.includes('/faq')) return 'FAQPage';
    return 'UnknownPage';
  };

  const handleCloseChat = () => {
    // Stop any ongoing speech and clean up
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }

    setChatState({
      isOpen: false,
      isWelcome: messages.length === 0,
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

  const toggleFullScreen = () => {
    setChatState((prev) => ({
      ...prev,
      isFullScreen: !prev.isFullScreen,
    }));
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    setMessages(prev => prev.slice(0, messageIndex));
    setIsLoading(true);

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
        const newMessages = [...messages.slice(0, messageIndex), errorMessage];
        setMessages(newMessages);
        saveChatHistory(newMessages);
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
          context: userMessage.context,
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
        const newMessages = [...messages.slice(0, messageIndex), assistantMessage];
        setMessages(newMessages);
        saveChatHistory(newMessages);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'I encountered a temporary issue. Please try again in a moment.',
        };
        const newMessages = [...messages.slice(0, messageIndex), errorMessage];
        setMessages(newMessages);
        saveChatHistory(newMessages);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
      };
      const newMessages = [...messages.slice(0, messageIndex), errorMessage];
      setMessages(newMessages);
      saveChatHistory(newMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const addReaction = (messageId: string, reaction: 'up' | 'down') => {
    const newMessages = messages.map(msg =>
      msg.id === messageId
        ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
        : msg
    );
    setMessages(newMessages);
    saveChatHistory(newMessages);
  };

  // ✅ Quick Actions
  const quickActions = [
    { icon: <MessageSquare className="w-4 h-4" />, label: "What services?", action: () => handleSendMessage("What services do you offer?") },
    { icon: <DollarSign className="w-4 h-4" />, label: "Pricing", action: () => handleSendMessage("How much does a website cost?") },
    { icon: <BookOpen className="w-4 h-4" />, label: "Portfolio", action: () => handleSendMessage("Show me your recent projects") },
    { icon: <Clock className="w-4 h-4" />, label: "Timeline", action: () => handleSendMessage("How long does it take to build a website?") },
  ];

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (promptText?: string) => {
    const messageText = promptText || inputValue.trim();
    if (!messageText || isLoading) return;

    // ✅ Check rate limit
    if (messageCount >= MESSAGE_LIMIT) {
      alert(`You've reached the daily limit of ${MESSAGE_LIMIT} messages. Please try again tomorrow or contact us for unlimited access.`);
      return;
    }

    // ✅ FIX: Abort previous request if user sends new message
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // ✅ FIX: Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // ✅ Detect intent for service cards
    const intent = detectIntent(messageText);

    // ✅ Phase 1: Detect project intent
    const projectIntent = detectProjectIntent(messageText);

    const context = getPageContext();

    // ✅ Phase 1: Get page summary for better AI context
    const pageSummary = getPageSummary(location.pathname);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      context,
      pageSummary, // Include page summary
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      if (!env.SUPABASE_URL ||
          env.SUPABASE_URL === '' ||
          !env.SUPABASE_URL.startsWith('http') ||
          env.SUPABASE_URL.includes('your-project') ||
          env.SUPABASE_URL.includes('YOUR_') ||
          !env.SUPABASE_ANON_KEY ||
          env.SUPABASE_ANON_KEY === '') {
        console.error('❌ AI chat not configured');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ AI chat is not configured yet. Please contact us directly via email for assistance.',
        };
        const finalMessages = [...newMessages, errorMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
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
          context, // ✅ Phase 1: Page context
          pageSummary, // ✅ Phase 1: Actual page content
          userId, // ✅ Phase 2: Persistent user ID
          conversationHistory: messages.slice(-6).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        signal: abortController.signal, // ✅ FIX: Add abort signal to prevent race conditions
      });

      const data = await response.json();

      if (data.success && data.message) {
        const assistantMessageId = (Date.now() + 1).toString();

        // ✅ Phase 2: Handle function calls from AI
        if (data.functionCall) {
          console.log('🎯 AI requested function call:', data.functionCall);
          executeFunctionCall(data.functionCall.name, data.functionCall.args);
          // Show the message along with executing the function
        }

        // ✅ Phase 1: Generate smart follow-up suggestions
        const followUps = getFollowUpSuggestions(messageText, data.message, context);

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: data.message || '✨ Taking you there now!',
          serviceCards: intent.showCards ? intent.filteredServices : undefined,
          projectCards: projectIntent.showProjects ? projectIntent.filteredProjects : undefined, // ✅ Phase 1: Add project cards
          followUpSuggestions: followUps, // ✅ Phase 1: Add follow-up suggestions
          isStreaming: true,
          timestamp: new Date(),
        };
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        setStreamingMessageId(assistantMessageId);
        saveChatHistory(finalMessages);

        // ✅ Stop streaming after text animation completes
        setTimeout(() => {
          setStreamingMessageId(null);
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
          ));
        }, (data.message?.length || 20) * 15 + 100); // Calculate based on text length
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I encountered a temporary issue. Please try again in a moment.',
        };
        const finalMessages = [...newMessages, errorMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
      }
    } catch (error) {
      // ✅ FIX: Don't show error if request was aborted (user sent new message)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted - user sent new message');
        return; // Silent abort, user already sent new message
      }

      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
      // ✅ FIX: Clear abort controller ref after request completes
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ Suggested prompts
  const suggestedPrompts = [
    "What services do you offer?",
    "How much does a website cost?",
    "Can you help with e-commerce?",
    "Tell me about your process",
    "Do you offer maintenance?",
    "What's your turnaround time?"
  ];

  // ✅ Filter messages by search
  const filteredMessages = searchQuery.trim()
    ? messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Dynamic theming
  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #0f172a 0%, #1a1f35 50%, #111827 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';

  const headerGradient = isDarkMode
    ? 'linear-gradient(135deg, #0891b2 0%, #0284c7 50%, #0369a1 100%)'
    : 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #0284c7 100%)';

  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const secondaryTextColor = isDarkMode ? 'text-slate-300' : 'text-slate-700';
  const bgColor = isDarkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-300';

  // Dynamic sizing
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
            className={`${chatContainerClass} overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border ${borderColor} flex flex-col`}
            style={{
              ...chatHeightStyle,
              background: bgGradient,
              boxShadow: isDarkMode
                ? '0 30px 60px rgba(0, 0, 0, 0.5), 0 0 80px rgba(8, 145, 178, 0.15)'
                : '0 30px 60px rgba(0, 0, 0, 0.2), 0 0 40px rgba(8, 145, 178, 0.1)',
            }}
          >
            {/* Header */}
            <motion.div
              className="relative overflow-hidden p-4 md:p-6"
              style={{ background: headerGradient }}
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
                    Premium Expertise • {messageCount}/{MESSAGE_LIMIT} msgs today
                  </motion.p>
                </div>
                <div className="flex gap-2">
                  {/* Theme Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={isDarkMode ? "Light mode" : "Dark mode"}
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5 text-white" />
                    ) : (
                      <Moon className="w-5 h-5 text-white" />
                    )}
                  </motion.button>

                  {/* Search Toggle */}
                  {!chatState.isWelcome && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSearch(!showSearch)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Search messages"
                    >
                      <Search className="w-5 h-5 text-white" />
                    </motion.button>
                  )}

                  {/* Full Screen */}
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

                  {/* Close */}
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

              {/* Search Bar */}
              <AnimatePresence>
                {showSearch && !chatState.isWelcome && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Welcome Screen */}
            {chatState.isWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center space-y-4 sm:space-y-6 overflow-y-auto`}
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))'
                    : 'linear-gradient(to bottom, rgba(248, 250, 252, 0.5), rgba(226, 232, 240, 0.8), rgba(203, 213, 225, 0.9))'
                }}
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
                  <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent`}>
                    Premium Consultation
                  </h3>
                  <p className={`text-sm sm:text-base ${secondaryTextColor} leading-relaxed font-medium`}>
                    Experience elite expertise in web development, SaaS, e-commerce & digital solutions.
                  </p>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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

                {/* ✅ Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full max-w-md space-y-3 mt-4"
                >
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Quick actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={action.action}
                        className={`px-3 py-2 ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-200 border-slate-600/50' : 'bg-white/50 hover:bg-white text-slate-700 border-slate-300'} border text-xs rounded-lg transition-all text-left flex items-center gap-2`}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Suggested Prompts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full max-w-md space-y-3 mt-6"
                >
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Or try these questions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedPrompts.slice(0, 4).map((prompt, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePromptClick(prompt)}
                        className={`px-3 py-2 ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-200 border-slate-600/50' : 'bg-white/50 hover:bg-white text-slate-700 border-slate-300'} border text-xs rounded-lg transition-all text-left`}
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
                  className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-3 sm:mt-4`}
                >
                  ✓ Instant responses • ✓ Expert insights • ✓ {MESSAGE_LIMIT} free messages/day
                </motion.p>
              </motion.div>
            )}

            {/* Chat Messages */}
            {!chatState.isWelcome && (
              <>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {/* Chat Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => exportChat('txt')}
                        className={`px-3 py-1.5 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg text-xs font-medium ${textColor} transition-colors flex items-center gap-1.5`}
                        title="Export as TXT"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearChatHistory}
                        className={`px-3 py-1.5 ${isDarkMode ? 'bg-red-900/50 hover:bg-red-900' : 'bg-red-100 hover:bg-red-200'} rounded-lg text-xs font-medium ${isDarkMode ? 'text-red-200' : 'text-red-700'} transition-colors flex items-center gap-1.5`}
                        title="Clear history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </motion.button>
                    </div>

                    {searchQuery && (
                      <span className={`text-xs ${secondaryTextColor}`}>
                        {filteredMessages.length} of {messages.length} messages
                      </span>
                    )}
                  </div>

                  {filteredMessages.length === 0 && messages.length > 0 && (
                    <div className="flex items-center justify-center h-32">
                      <p className={secondaryTextColor}>No messages match your search</p>
                    </div>
                  )}

                  {filteredMessages.length === 0 && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-center space-y-3"
                      >
                        <div className="text-4xl">💬</div>
                        <p className={secondaryTextColor}>Start a conversation</p>
                      </motion.div>
                    </div>
                  )}

                  {filteredMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isStreaming={message.isStreaming === true && streamingMessageId === message.id}
                      isDarkMode={isDarkMode}
                      addReaction={addReaction}
                      copyMessage={(id, content) => copyMessage(content, id)}
                      readAloud={readAloud}
                      isSpeaking={isSpeaking}
                      currentSpeakingId={currentSpeakingId}
                      onFollowUpClick={handleSendMessage} // ✅ Phase 1: Pass callback for follow-ups
                    />
                  ))}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className={`${isDarkMode ? 'bg-slate-700/80 border-slate-600/50' : 'bg-white border-slate-300'} border px-5 py-4 rounded-2xl rounded-bl-none backdrop-blur-sm flex items-center gap-3`}>
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
                        <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} font-medium`}>AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div
                  className={`border-t p-3 sm:p-4 md:p-6 backdrop-blur-lg`}
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
                      : 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    borderTopColor: isDarkMode ? 'rgba(8, 145, 178, 0.2)' : 'rgba(8, 145, 178, 0.3)',
                  }}
                >
                  <div className="flex gap-2 sm:gap-3 mb-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={messageCount >= MESSAGE_LIMIT ? "Daily limit reached" : "Ask me anything..."}
                      disabled={isLoading || messageCount >= MESSAGE_LIMIT}
                      className={`flex-1 ${isDarkMode ? 'bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'} px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm disabled:opacity-50 backdrop-blur-sm`}
                    />

                    {/* Voice Input */}
                    {recognition && (
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleVoiceInput}
                        disabled={isLoading}
                        className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 ${
                          isListening
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                        } text-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0`}
                        title={isListening ? "Stop listening" : "Voice input"}
                      >
                        {isListening ? (
                          <MicOff className="w-5 h-5" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || !inputValue.trim() || messageCount >= MESSAGE_LIMIT}
                      className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} px-1`}
                  >
                    {messageCount >= MESSAGE_LIMIT ? (
                      <span className="text-red-400">Daily limit reached. Contact us for unlimited access.</span>
                    ) : (
                      <>↵ Enter to send{recognition && ' • 🎤 Voice input available'} • Powered by Gemini AI</>
                    )}
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
