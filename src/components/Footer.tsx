import { Heart, Mail, MapPin, Phone, Github, Linkedin, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Sudharsan Builds</h3>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Professional freelance web development services across India. Building modern websites that convert visitors into customers. 100% Remote work.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/Sudharsan1-5"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/sudharsan-k-2027b1370"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/SudharsanBuilds"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-cyan-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => scrollToSection('home')} className="hover:text-cyan-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-cyan-400 transition-colors">
                  About
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className="hover:text-cyan-400 transition-colors">
                  Services & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('projects')} className="hover:text-cyan-400 transition-colors">
                  Projects
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('blog')} className="hover:text-cyan-400 transition-colors">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="hover:text-cyan-400 transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-slate-400">
              <li>Landing Pages - ₹15,000</li>
              <li>Business Websites - ₹30,000</li>
              <li>E-Commerce Stores - ₹50,000</li>
              <li>Custom Development</li>
              <li>SEO Optimization</li>
              <li>Website Maintenance</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <span className="text-slate-400">Remote Work - Serving Clients Across India</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                <a
                  href="mailto:sudharsanofficial0001@gmail.com"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  sudharsanofficial0001@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center md:text-left text-sm">
              © {currentYear} Sudharsan Builds. All rights reserved.
            </p>
            <p className="flex items-center gap-2 text-sm">
              Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by a Freelance Developer in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
