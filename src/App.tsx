import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import RegionBanner from './components/RegionBanner';
import SEOHead from './components/SEOHead';
import ErrorBoundary from './components/ErrorBoundary';
import { features } from './utils/env';
import { autoTrackPerformance, setupGlobalErrorHandler } from './utils/notificationsAnalyticsApi';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import { setupLazyLoading, preloadImages } from './utils/imageOptimization';
import { useTheme } from './hooks/useSettings';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentConfirmationPage = lazy(() => import('./pages/PaymentConfirmationPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy load admin pages
const AdminAuth = lazy(() => import('./components/admin/AdminAuth'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const ProjectForm = lazy(() => import('./pages/admin/ProjectForm'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminFAQ = lazy(() => import('./pages/admin/AdminFAQ'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminHero = lazy(() => import('./pages/admin/AdminHero'));
const AdminEmailAutomation = lazy(() => import('./pages/admin/AdminEmailAutomation'));
const AdminAdvancedAnalytics = lazy(() => import('./pages/admin/AdminAdvancedAnalytics'));
const AdminRemoteControl = lazy(() => import('./pages/admin/AdminRemoteControl'));
const AdminMediaLibrary = lazy(() => import('./pages/admin/AdminMediaLibrary'));
const AdminProductionChecklist = lazy(() => import('./pages/admin/AdminProductionChecklist'));

// ✅ FIX: Lazy load global widgets (available on all pages)
const AIChatbot = lazy(() => import('./components/AIChatbot'));
const FloatingAvatar = lazy(() => import('./components/FloatingAvatar'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));

// ✅ P2 FIX: Enhanced page loader with better visual feedback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      {/* Animated spinner with double ring */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
      {/* Loading text with animated dots */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-700 text-base font-semibold">Loading page...</p>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = () => setIsChatOpen(true);
  const handleCloseChat = () => setIsChatOpen(false);

  // ✅ REMOTE CONTROL: Load and apply theme automatically
  useTheme();

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

    // ✅ AUTO-TRACK: Performance metrics and global errors
    autoTrackPerformance();
    setupGlobalErrorHandler();

    // ✅ PERFORMANCE: Register service worker for offline support
    registerServiceWorker({
      onUpdate: (registration) => {
        console.log('🔄 New version available! Refresh to update.');
        // Could show a toast notification here
      },
      onSuccess: (registration) => {
        console.log('✅ Service Worker registered successfully');
      },
      onOffline: () => {
        console.log('📡 You are offline. Some features may be limited.');
      },
      onOnline: () => {
        console.log('📡 You are back online!');
      }
    });

    // ✅ PERFORMANCE: Setup lazy loading for images
    const cleanupLazyLoading = setupLazyLoading('img[data-src]');

    // ✅ PERFORMANCE: Preload critical images (hero, logo)
    preloadImages([
      '/logo.png',
      '/hero-bg.jpg'
    ]);

    return () => {
      cleanupLazyLoading();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        {/* Dynamic SEO meta tags based on region */}
        <SEOHead />

        <div className="min-h-screen">
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:font-bold"
          >
            Skip to main content
          </a>

          <div className="flex items-center justify-between">
            <Navigation />
            <div className="fixed top-4 right-4 z-50">
              <Suspense fallback={null}>
                <NotificationCenter />
              </Suspense>
            </div>
          </div>

          {/* Region Suggestion Banner */}
          <RegionBanner />

          <main id="main-content">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminAuth>
                      <AdminLayout>
                        <Routes>
                          <Route path="/" element={<AdminDashboard />} />
                          <Route path="/projects" element={<AdminProjects />} />
                          <Route path="/projects/new" element={<ProjectForm />} />
                          <Route path="/projects/edit/:id" element={<ProjectForm />} />
                          <Route path="/inquiries" element={<AdminInquiries />} />
                          <Route path="/testimonials" element={<AdminTestimonials />} />
                          <Route path="/faq" element={<AdminFAQ />} />
                          <Route path="/analytics" element={<AdminAnalytics />} />
                          <Route path="/advanced-analytics" element={<AdminAdvancedAnalytics />} />
                          <Route path="/remote-control" element={<AdminRemoteControl />} />
                          <Route path="/media" element={<AdminMediaLibrary />} />
                          <Route path="/production-checklist" element={<AdminProductionChecklist />} />
                          <Route path="/blog" element={<AdminBlog />} />
                          <Route path="/services" element={<AdminServices />} />
                          <Route path="/hero" element={<AdminHero />} />
                          <Route path="/email-automation" element={<AdminEmailAutomation />} />
                          <Route path="/settings" element={<AdminSettings />} />
                          <Route path="*" element={<div className="text-white text-center py-12">Coming soon...</div>} />
                        </Routes>
                      </AdminLayout>
                    </AdminAuth>
                  }
                />

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
