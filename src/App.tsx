import { lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';

// Lazy load below-fold and heavy components for better initial load performance
const Projects = lazy(() => import('./components/Projects'));
const Services = lazy(() => import('./components/Services'));
const LocalTargeting = lazy(() => import('./components/LocalTargeting'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Blog = lazy(() => import('./components/Blog'));
const FAQ = lazy(() => import('./components/FAQ'));
const Contact = lazy(() => import('./components/Contact'));
const AIChatbot = lazy(() => import('./components/AIChatbot'));
const FloatingAvatar = lazy(() => import('./components/FloatingAvatar'));

// Loading fallback component for lazy-loaded sections
const SectionLoader = () => (
  <div className="min-h-[200px] flex items-center justify-center bg-slate-50">
    <div className="animate-pulse flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />

      {/* Lazy load below-fold components with suspense boundaries */}
      <Suspense fallback={<SectionLoader />}>
        <Projects />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Services />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <LocalTargeting />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Blog />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FAQ />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Contact />
      </Suspense>

      <Footer />

      {/* Lazy load interactive widgets */}
      <Suspense fallback={null}>
        <AIChatbot />
      </Suspense>

      <Suspense fallback={null}>
        <FloatingAvatar />
      </Suspense>
    </div>
  );
}

export default App;
