import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { features } from './utils/env';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ✅ FIX: Lazy load global widgets (available on all pages)
const AIChatbot = lazy(() => import('./components/AIChatbot'));
const FloatingAvatar = lazy(() => import('./components/FloatingAvatar'));

// Loading fallback component for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-pulse flex flex-col items-center gap-3">
      <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 text-lg">Loading...</p>
    </div>
  </div>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  // ✅ P0 FIX: Validate environment variables on startup and log warnings
  useEffect(() => {
    // Only log in development to avoid exposing config issues in production
    if (import.meta.env.DEV) {
      console.log('🔧 Checking environment configuration...');

      const warnings: string[] = [];

      if (!features.hasPayment) {
        warnings.push('⚠️ Payment system not configured (Razorpay/Supabase). Payment features will be disabled.');
      }

      if (!features.hasAIChat) {
        warnings.push('⚠️ AI Chat not configured (Supabase). Chat features will be disabled.');
      }

      if (!features.hasEmailJS) {
        warnings.push('⚠️ EmailJS not configured. Email notifications will be disabled.');
      }

      if (!features.hasContactForm) {
        warnings.push('⚠️ Contact form backend not configured (Formspree/Supabase).');
      }

      if (warnings.length > 0) {
        console.warn('⚠️ Configuration warnings:\n' + warnings.join('\n'));
        console.log('💡 Features will gracefully degrade. Users will see appropriate fallback messages.');
      } else {
        console.log('✅ All features properly configured!');
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen">
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:font-bold"
          >
            Skip to main content
          </a>

          <Navigation />

          <main id="main-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>

          {/* ✅ AI Chat - Global widget available on all pages */}
          <Suspense fallback={null}>
            <AIChatbot isOpen={isChatOpen} onClose={handleCloseChat} />
          </Suspense>

          {/* ✅ Floating Avatar - Clickable to open AI chat */}
          {!isChatOpen && (
            <Suspense fallback={null}>
              <FloatingAvatar onClick={handleOpenChat} />
            </Suspense>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
