import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: 'fixed' | 'inline';
  variant?: 'default' | 'small' | 'large';
}

export default function WhatsAppButton({
  phoneNumber = '916381556407',
  message = 'Hi! I\'m interested in your web development services.',
  position = 'fixed',
  variant = 'default'
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Inline button styles (for use within sections)
  if (position === 'inline') {
    const sizeClasses = {
      small: 'px-4 py-2 text-sm',
      default: 'px-6 py-3 text-base',
      large: 'px-8 py-4 text-lg'
    };

    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${sizeClasses[variant]}`}
      >
        <MessageCircle className="w-5 h-5" />
        Chat on WhatsApp
      </motion.button>
    );
  }

  // Fixed floating button (always visible on screen)
  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl hover:shadow-green-500/50 flex items-center justify-center text-white group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Chat on WhatsApp
      </span>

      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
    </motion.button>
  );
}
