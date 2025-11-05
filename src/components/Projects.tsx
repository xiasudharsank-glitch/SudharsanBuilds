import { useState, useEffect } from 'react';
import { ExternalLink, X, FolderOpen, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  title: string;
  tech: string;
  description: string;
  image?: string;
  link: string;
}

// Function to generate website preview URL using Microlink
const getWebsitePreview = (url: string) => {
  // First try to get from local storage to avoid unnecessary API calls
  const cachedImage = localStorage.getItem(`preview_${url}`);
  if (cachedImage) return cachedImage;
  
  // Fallback to Microlink for preview generation
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
};

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'personal' | 'client' | null>(null);

  const myProjects: Project[] = [
    {
      title: 'SkillPathAI App',
      tech: 'React, Firebase, OpenAI API',
      description: 'AI-powered personalized learning assistant with tailored learning paths and project tracking.',
      link: 'https://freelancerassistance.lovable.app'
    },
    {
      title: 'Portfolio Generator',
      tech: 'React, Dynamic Templates',
      description: 'Automated portfolio builder that creates beautiful websites from user data.',
      link: 'https://sudharsanbuilds.vercel.app'
    },
    {
      title: 'Task Management Tool',
      tech: 'React, Drag & Drop',
      description: 'Project management solution with team collaboration and progress tracking.',
      link: 'https://sudharsanchatbot.lovable.app'
    },
    {
      title: 'AI Chatbot',
      tech: 'React, OpenAI, TypeScript',
      description: 'Intelligent conversational AI assistant with context awareness.',
      link: 'https://sudharsanchatbot.lovable.app'
    }
  ];

  const clientProjects: Project[] = [
    {
      title: 'E-Commerce Platform',
      tech: 'React with TypeScript , Supabase, Razorpay',
      description: 'Full-featured online store with payment integration and admin dashboard.',
      link: 'https://psquaremenswear.vercel.app'
    },
    {
      title: 'Booking Management',
      tech: 'React, Calendar API',
      description: 'Appointment scheduling system with automated reminders.',
      link: 'https://your-booking-system.com'
    },
    {
      title: 'Social Media App',
      tech: 'React, Real-time DB',
      description: 'Community platform with user profiles and real-time interactions.',
      link: 'https://your-social-app.com'
    },
    {
      title: 'SaaS Dashboard',
      tech: 'React, Analytics, Charts',
      description: 'Real-time analytics platform with subscription management.',
      link: 'https://your-saas-dashboard.com'
    }
  ];

  const openModal = (category: 'personal' | 'client') => {
    setActiveCategory(category);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveCategory(null);
    document.body.style.overflow = 'unset';
  };

  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});

  // Function to handle image loading and caching
  const handleImageLoad = (url: string, imageUrl: string) => {
    setPreviewCache(prev => ({
      ...prev,
      [url]: imageUrl
    }));
    // Cache in localStorage for future visits
    localStorage.setItem(`preview_${url}`, imageUrl);
  };

  const activeProjects = activeCategory === 'personal' ? myProjects : clientProjects;

  return (
    <section id="projects" className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16 text-white">
          Featured <span className="text-cyan-400">Projects</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <motion.button
            onClick={() => openModal('personal')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 border-2 border-slate-700 hover:border-cyan-500"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-cyan-500/50 transition-shadow">
                <FolderOpen className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">My Projects</h3>
                <p className="text-slate-400 text-base md:text-lg">
                  Personal experiments & passion projects
                </p>
                <p className="text-cyan-400 text-sm md:text-base mt-2 font-semibold">
                  {myProjects.length} Projects
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => openModal('client')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-10 rounded-3xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 border-2 border-slate-700 hover:border-cyan-500"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-blue-500/50 transition-shadow">
                <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Client Projects</h3>
                <p className="text-slate-400 text-base md:text-lg">
                  Professional work & client solutions
                </p>
                <p className="text-cyan-400 text-sm md:text-base mt-2 font-semibold">
                  {clientProjects.length} Projects
                </p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-slate-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 md:p-6 flex items-center justify-between z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {activeCategory === 'personal' ? 'My Projects' : 'Client Projects'}
                </h3>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {activeProjects.map((project, index) => (
                  <motion.a
                    key={index}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="h-48 md:h-56 relative overflow-hidden">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <img
                          src={previewCache[project.link] || getWebsitePreview(project.link)}
                          alt={`${project.title} preview`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onLoad={() => handleImageLoad(project.link, getWebsitePreview(project.link))}
                          onError={(e) => {
                            // Fallback to a placeholder if the preview fails to load
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x400/1e293b/64748b?text=${encodeURIComponent(project.title)}`;
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                        <ExternalLink className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110" />
                      </div>
                    </div>

                    <div className="p-4 md:p-6 space-y-3">
                      <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-cyan-400 text-xs md:text-sm font-medium">{project.tech}</p>
                      <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
