import { useState, useEffect } from 'react';
import { Menu, X, Briefcase } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ FIX: Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: '#home', label: 'Home', type: 'section' },
    { href: '#about', label: 'About', type: 'section' },
    { href: '#projects', label: 'Projects', type: 'section' },
    { href: '#services', label: 'Services', type: 'section' },
    { href: '/blog', label: 'Blog', type: 'page' },
    { href: '#contact', label: 'Contact', type: 'section' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, type: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (type === 'section') {
      // If we're not on the homepage, navigate there first
      if (location.pathname !== '/') {
        navigate('/');
        // ✅ FIX: Increased timeout to 800ms for more reliable lazy component loading
        setTimeout(() => {
          requestAnimationFrame(() => {
            const element = document.querySelector(href);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              // If element still not found, try again after 200ms
              setTimeout(() => {
                const retryElement = document.querySelector(href);
                if (retryElement) {
                  retryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 200);
            }
          });
        }, 800);
      } else {
        // Already on homepage, scroll immediately with requestAnimationFrame for smoothness
        requestAnimationFrame(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    } else {
      // Page navigation
      navigate(href);
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-slate-900/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          <Link
            to="/"
            className="text-2xl font-extrabold text-white flex items-center gap-2 transition duration-300 hover:text-cyan-400"
          >
            {/* Professional Icon: Briefcase */}
            <Briefcase className="w-6 h-6 text-cyan-400 transform rotate-[-10deg]" />

            {/* Name: Sudharsan Builds */}
            <span className="tracking-wide">
                <span className="text-cyan-400">SUDHARSAN</span> BUILDS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.type)}
                className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-target"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
          <div className="container mx-auto px-6 py-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href, link.type)}
                className="block text-slate-300 hover:text-cyan-400 active:text-cyan-500 transition-colors font-medium py-3 px-2 min-h-[44px] touch-target rounded-lg hover:bg-slate-800/50"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
