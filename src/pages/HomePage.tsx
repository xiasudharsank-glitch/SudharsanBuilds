import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Footer from '../components/Footer';

// ✅ P1 FIX: Group related components to reduce loader flash
const Projects = lazy(() => import('../components/Projects'));
const Services = lazy(() => import('../components/Services'));
const LocalTargeting = lazy(() => import('../components/LocalTargeting'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const FAQ = lazy(() => import('../components/FAQ'));
const Contact = lazy(() => import('../components/Contact'));

// ✅ P1 FIX: Skeleton screen loader - Better perceived performance than spinner
const SectionSkeleton = () => (
  <div className="py-16 md:py-24 bg-slate-50">
    <div className="container mx-auto px-6">
      {/* Title skeleton */}
      <div className="h-12 w-64 bg-slate-200 rounded-lg mb-8 mx-auto animate-pulse"></div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="h-16 w-16 bg-slate-200 rounded-full mb-4 mx-auto animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded mb-3 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ✅ Above-fold content loads immediately */}
      <Hero />
      <About />

      {/* ✅ P1 FIX: Single suspense boundary for main content - reduces loader flash */}
      <Suspense fallback={<SectionSkeleton />}>
        <Projects />
        <Services showAll={false} />
        <LocalTargeting />
        <Testimonials limit={2} showViewAll={true} />
        <FAQ limit={3} showViewAll={true} showContactCTA={false} />
        <Contact />
      </Suspense>

      <Footer />
    </div>
  );
}
