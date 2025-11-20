import { useState, useEffect } from 'react';
import { ExternalLink, X, FolderOpen, Briefcase, Github, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectGallery from './ProjectGallery';
import { PROJECTS_DATA, type Project, type ProjectType } from '../data/projectsData';

const getWebsitePreview = (url: string) => {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
};

const PROJECTS: Project[] = PROJECTS_DATA; // Use shared data

// Unused - kept for backward compatibility
const _PROJECTS: Project[] = [
  {
  id: 'manoj-kumar-portfolio',
  title: 'Finance & Business Analytics Professional Portfolio',
  type: 'personal',
  status: 'completed',
  role: 'Full-stack Developer',
  description: 'Professional portfolio website for an MBA graduate specializing in Finance and Business Analytics. Showcases technical skills in Power BI, Tableau, SQL, and Python, along with academic projects. Also includes an ATS-friendly resume designed to pass through recruitment systems and stand out to hiring managers.',
  link: 'https://manoj-rho-navy.vercel.app/',
  techStack: [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'Tailwind CSS' },
    { name: 'Responsive Design' }
  ],
  tags: ['Professional Portfolio', 'Finance Analytics', 'Job Search'],
  startDate: '2024-08-01',
  endDate: '2024-09-10',
  featured: true,
  clientName: 'Manoj Kumar S',
  clientTestimonial: {
    text: 'Sudharsan built a clean, professional portfolio that effectively showcases my analytics skills and MBA background. Combined with the ATS-friendly resume he created, I\'ve been receiving consistent recruiter inquiries and interview opportunities from companies in my target list.',
    name: 'Manoj Kumar S',
    role: 'MBA Graduate, Finance & Business Analytics'
  },
  keyAchievements: [
    'Professional portfolio increases visibility among recruiters and hiring managers',
    'ATS-optimized resume ensures applications pass through recruitment screening systems',
    'Clear presentation of technical skills (Power BI, Tableau, SQL, Python) attracts relevant opportunities',
    'Organized layout makes it easy for recruiters to find key qualifications',
    'Mobile-responsive design accessible on all devices'
  ]
  },
  {
  id: 'bharath-kumar-marketing-portfolio',
  title: 'Marketing & Sales Executive Professional Portfolio',
  type: 'personal',
  status: 'completed',
  role: 'Full-stack Developer',
  description: 'Professional portfolio website for a Marketing and Sales Executive seeking opportunities to leverage digital marketing expertise, sales management, and business development skills. Showcases professional experience, marketing campaigns, sales achievements, and career vision with clear call-to-actions for recruiters and business partners.',
  link: 'https://bharathkumar-henna.vercel.app/',
  techStack: [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'Tailwind CSS' },
    { name: 'Responsive Design' }
  ],
  tags: ['Marketing Portfolio', 'Sales Executive', 'Job Search', 'Professional'],
  startDate: '2024-08-05',
  endDate: '2024-09-05',
  featured: true,
  clientName: 'Bharath Kumar S',
  clientTestimonial: {
    text: 'My marketing and sales background deserved a portfolio that would stand out, and that\'s exactly what I got. The professional design by Sudharsan perfectly highlights my digital marketing expertise, sales achievements, and career aspirations. Recruiters now have a comprehensive view of my experience and strengths. The clean layout makes it easy for potential employers to understand my value proposition.',
    name: 'Bharath Kumar S',
    role: 'Marketing & Sales Executive'
  },
  keyAchievements: [
    'Professional portfolio effectively showcases digital marketing and sales expertise',
    'Clear career vision and goals resonate with hiring managers',
    'Organized presentation of professional experience and achievements',
    'Mobile-responsive design ensures accessibility across all devices',
    'Portfolio attracts inquiries from marketing and sales-focused companies',
    'Professional credibility elevated through polished online presence'
  ]
  },
  {
  id: 'vembarasi-nurse-portfolio',
  title: 'Professional Nurse Portfolio - Germany Job Search',
  type: 'personal',
  status: 'completed',
  role: 'Full-stack Developer',
  description: 'Professional portfolio website for an experienced nurse seeking employment opportunities in Germany. Showcases nursing qualifications, experience, certifications, and professional achievements with a downloadable resume optimized for international healthcare recruitment standards.',
  link: 'https://vembarasi.vercel.app',
  techStack: [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'Tailwind CSS' },
    { name: 'Framer Motion' },
    { name: 'PDF Download Feature' },
    { name: 'Responsive Design' }
  ],
  tags: ['Nurse Portfolio', 'Healthcare', 'International Job Search', 'Germany'],
  startDate: '2024-07-01',
  endDate: '2024-08-15',
  featured: true,
  clientName: 'Vembarasi K',
  clientTestimonial: {
    text: 'Sudharsan created a professional portfolio that perfectly highlights my nursing experience and qualifications for international positions. The one-click downloadable resume feature is convenient for recruiters, and the polished design helped me get noticed by German healthcare employers. It\'s been instrumental in my job search abroad.',
    name: 'Vembarasi K',
    role: 'Registered Nurse, Healthcare Professional'
  },
  keyAchievements: [
    'Professional portfolio showcases nursing certifications and international experience',
    'One-click resume download feature allows recruiters instant access to qualifications',
    'Optimized for international healthcare recruitment standards (Germany-focused)',
    'Clean, professional design builds credibility with international employers',
    'Mobile-responsive layout accessible on all devices for global reach',
    'Increased visibility among German healthcare recruitment agencies'
  ]
  },
  {
  id: 'rsk-enterprises-sevai',
  title: 'e-Sevai Maiyam Website - Government Services Portal',
  type: 'client',
  status: 'completed',
  role: 'Full-stack Developer',
  description: 'Professional website for RSK Enterprises, an e-Sevai Maiyam service center in Trichy offering Aadhaar, PAN, certificates, bill payments, and printing services. Features Google Maps integration for location discovery, YouTube channel integration, comprehensive service documentation, dynamic shop status display, and detailed working hours to reduce customer inquiries.',
  link: 'https://rsk-enterprises.vercel.app',
  techStack: [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'Tailwind CSS' },
    { name: 'Google Maps API' },
    { name: 'YouTube Integration' },
    { name: 'Dynamic Status System' },
    { name: 'Responsive Design' }
  ],
  tags: ['Government Services', 'e-Sevai Maiyam', 'Local Business', 'Service Portal'],
  startDate: '2024-07-15',
  endDate: '2024-08-20',
  featured: true,
  screenshots: [
    '/images/projects/rsk-enterprises/homepage.svg',
    '/images/projects/rsk-enterprises/services.svg',
    '/images/projects/rsk-enterprises/contact.svg',
    '/images/projects/rsk-enterprises/about.svg'
  ],
  clientName: 'RSK Enterprises',
  clientTestimonial: {
    text: 'Sudharsan built an excellent website that has transformed how we handle customer inquiries. The document requirements section and working hours display have reduced our phone calls significantly. Customers appreciate knowing exactly what documents they need and when we\'re open. The Google Maps and YouTube integration were great additions!',
    name: 'RSK Enterprises Owner',
    role: 'e-Sevai Maiyam Service Center, Trichy'
  },
  keyAchievements: [
    'Reduced repetitive customer inquiries by 70% through self-service documentation',
    'Google Maps integration increased foot traffic from local searches',
    'Dynamic open/closed status automatically updates based on working hours',
    'YouTube channel integration increased subscriber engagement',
    'Comprehensive service details (Aadhaar, PAN, Certificates) available 24/7',
    'Customers save time by knowing exact documents needed before visiting'
  ]
  },
  {
    id: 'psquare-menswear',
    title: 'E-Commerce Platform',
    description: 'Full-featured online store with payment integration and admin dashboard for a premium menswear brand.',
    link: 'https://psquaremenswear.vercel.app',
    type: 'client',
    status: 'in-progress',
    role: 'Full-stack Developer',
    techStack: [
      { name: 'React' },
      { name: 'TypeScript' },
      { name: 'Supabase' },
      { name: 'Razorpay' },
      { name: 'Tailwind CSS' }
    ],
    tags: ['E-commerce', 'Payments', 'Responsive'],
    startDate: '2023-07-10',
    endDate: '2023-10-20',
    featured: true,
    clientName: 'Prasanth Kumar',
    clientTestimonial: {
      text: 'in progress',
      name: 'Prasanth Kumar',
      role: 'Founder, PSquare Menswear'
    },
    keyAchievements: []
  }
];

type CategoryType = 'My Projects' | 'Client Projects';

export default function Projects() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});
  // ✅ FIX #5: Track failed images to prevent infinite loop
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const myProjects = PROJECTS.filter(p => p.type === 'personal');
  const clientProjects = PROJECTS.filter(p => p.type === 'client' || p.type === 'freelance');

  const openCategoryModal = (category: CategoryType) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setCurrentCarouselIndex(0); // Reset to first image
    setIsProjectModalOpen(true);
    // Don't close category modal - nested modals
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
    setCurrentCarouselIndex(0);
    // Category modal stays open
  };

  const nextImage = () => {
    if (selectedProject?.screenshots) {
      setCurrentCarouselIndex((prev) =>
        prev === selectedProject.screenshots!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProject?.screenshots) {
      setCurrentCarouselIndex((prev) =>
        prev === 0 ? selectedProject.screenshots!.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentCarouselIndex(index);
  };

  // Keyboard navigation for carousel and ESC to close
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC key closes modals
      if (e.key === 'Escape') {
        if (isProjectModalOpen) {
          closeProjectModal();
        } else if (isCategoryModalOpen) {
          closeAllModals();
        }
        return;
      }

      // Arrow keys for carousel navigation
      if (isProjectModalOpen && selectedProject?.screenshots) {
        if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isProjectModalOpen, isCategoryModalOpen, selectedProject, currentCarouselIndex]);

  const closeAllModals = () => {
    setIsProjectModalOpen(false);
    setIsCategoryModalOpen(false);
    setSelectedProject(null);
    setSelectedCategory(null);
    document.body.style.overflow = 'unset';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedProject(null);
  };

  const handleImageLoad = (url: string, imageUrl: string) => {
    setPreviewCache(prev => ({
      ...prev,
      [url]: imageUrl
    }));
  };

  const getProjectsByCategory = (category: CategoryType): Project[] => {
    return category === 'My Projects' ? myProjects : clientProjects;
  };

  return (
    <section id="projects" className="py-12 md:py-24 bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 md:mb-4">
            Featured <span className="text-cyan-400">Projects</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Explore my work across personal projects and client collaborations
          </p>
        </div>

        {/* Two Main Cards - Compact for Mobile */}
        <div className="grid grid-cols-2 gap-3 md:gap-8 max-w-4xl mx-auto">
          {/* My Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-gradient-to-br from-cyan-600 to-blue-700 p-4 md:p-12 rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-cyan-400"
            onClick={() => openCategoryModal('My Projects')}
          >
            <div className="flex flex-col items-center text-center space-y-2 md:space-y-6">
              <div className="w-12 h-12 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderOpen className="w-6 h-6 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h3 className="text-base md:text-3xl font-bold text-white mb-1 md:mb-2">
                  My Projects
                </h3>
                <p className="text-cyan-100 text-xs md:text-base mb-2 md:mb-4 hidden md:block">
                  Personal & portfolio websites built for professionals
                </p>
                <div className="inline-flex items-center gap-1 md:gap-2 text-white text-xs md:text-base font-semibold bg-white/10 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full">
                  <span>{myProjects.length} Projects</span>
                  <ChevronRight className="w-3 h-3 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Client Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group bg-gradient-to-br from-purple-600 to-pink-700 p-4 md:p-12 rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-purple-400"
            onClick={() => openCategoryModal('Client Projects')}
          >
            <div className="flex flex-col items-center text-center space-y-2 md:space-y-6">
              <div className="w-12 h-12 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <h3 className="text-base md:text-3xl font-bold text-white mb-1 md:mb-2">
                  Client Projects
                </h3>
                <p className="text-purple-100 text-xs md:text-base mb-2 md:mb-4 hidden md:block">
                  Business websites & e-commerce solutions for clients
                </p>
                <div className="inline-flex items-center gap-1 md:gap-2 text-white text-xs md:text-base font-semibold bg-white/10 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full">
                  <span>{clientProjects.length} Projects</span>
                  <ChevronRight className="w-3 h-3 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Modal - List of Projects */}
        <AnimatePresence>
          {isCategoryModalOpen && selectedCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeAllModals}
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-modal-title"
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
                  <h3 id="category-modal-title" className="text-2xl md:text-3xl font-bold text-white">
                    {selectedCategory}
                  </h3>
                  <button
                    onClick={closeAllModals}
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {getProjectsByCategory(selectedCategory).map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-700 hover:border-cyan-500/50 cursor-pointer"
                      onClick={() => openProjectModal(project)}
                    >
                      <div className="h-48 relative overflow-hidden bg-slate-700">
                        <img
                          src={previewCache[project.link] || getWebsitePreview(project.link)}
                          alt={`${project.title} preview`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onLoad={(e) => handleImageLoad(project.link, (e.target as HTMLImageElement).src)}
                          onError={(e) => {
                            // ✅ FIX #5: Prevent infinite loop by tracking failed images
                            const imageKey = `${project.link}-${project.title}`;
                            if (!failedImages.has(imageKey)) {
                              setFailedImages(prev => new Set(prev).add(imageKey));
                              const fallbackColor = project.type === 'personal' ? '0891b2' : '9333ea';
                              (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23${fallbackColor}' width='600' height='400'/%3E%3Ctext fill='white' font-family='Arial' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(project.title)}%3C/text%3E%3C/svg%3E`;
                            }
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {project.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${
                            project.status === 'completed'
                              ? 'bg-green-900/50 text-green-400'
                              : project.status === 'in-progress'
                              ? 'bg-blue-900/50 text-blue-400'
                              : 'bg-amber-900/50 text-amber-400'
                          }`}>
                            {project.status === 'completed' ? 'Completed' : project.status === 'in-progress' ? 'In Progress' : 'On Hold'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.slice(0, 3).map((tech, i) => (
                            <span key={i} className="px-2 py-1 bg-cyan-900/50 text-xs text-cyan-300 rounded-full">
                              {tech.name}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="px-2 py-1 bg-slate-700/50 text-xs text-white rounded-full">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Details Modal - Nested */}
        <AnimatePresence>
          {isProjectModalOpen && selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={closeProjectModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 md:p-6 flex items-center justify-between z-10">
                  <h3 id="project-modal-title" className="text-2xl md:text-3xl font-bold text-white">
                    {selectedProject.title}
                  </h3>
                  <button
                    onClick={closeProjectModal}
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-4 md:p-8 space-y-8">
                  {/* Image Carousel */}
                  <div className="relative">
                    <div className="aspect-video relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-700">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentCarouselIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          src={selectedProject.screenshots && selectedProject.screenshots.length > 0
                            ? selectedProject.screenshots[currentCarouselIndex]
                            : (previewCache[selectedProject.link] || getWebsitePreview(selectedProject.link))
                          }
                          alt={`${selectedProject.title} - Image ${currentCarouselIndex + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/1200x675/1e293b/64748b?text=${encodeURIComponent(selectedProject.title)}`;
                          }}
                        />
                      </AnimatePresence>

                      {/* Navigation Arrows - Only show if there are screenshots */}
                      {selectedProject.screenshots && selectedProject.screenshots.length > 1 && (
                        <>
                          {/* Left Arrow */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm z-10 group"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </button>

                          {/* Right Arrow */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm z-10 group"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          </button>

                          {/* Image Counter */}
                          <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {currentCarouselIndex + 1} / {selectedProject.screenshots.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Dots Indicator */}
                    {selectedProject.screenshots && selectedProject.screenshots.length > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        {selectedProject.screenshots.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`transition-all ${
                              index === currentCarouselIndex
                                ? 'w-8 h-2 bg-cyan-500'
                                : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'
                            } rounded-full`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h4 className="text-xl font-semibold text-cyan-400 mb-2">Description</h4>
                        <p className="text-slate-300">{selectedProject.description}</p>
                      </div>

                      {selectedProject.keyAchievements && selectedProject.keyAchievements.length > 0 && (
                        <div>
                          <h4 className="text-xl font-semibold text-cyan-400 mb-2">Key Achievements</h4>
                          <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                            {selectedProject.keyAchievements.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedProject.clientTestimonial && selectedProject.clientTestimonial.text !== 'in progress' && (
                        <div>
                          <h4 className="text-xl font-semibold text-cyan-400 mb-2">Client Testimonial</h4>
                          <blockquote className="p-4 border-l-4 border-cyan-400 bg-slate-800 rounded-lg italic text-slate-300">
                            "{selectedProject.clientTestimonial.text}"
                            <footer className="mt-2 text-sm text-slate-400 not-italic">
                              — {selectedProject.clientTestimonial.name}, {selectedProject.clientTestimonial.role}
                            </footer>
                          </blockquote>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                      {/* Sticky Action Buttons - Always visible at top on desktop, inline on mobile */}
                      <div className="lg:sticky lg:top-4 flex flex-col space-y-3 bg-slate-900 lg:bg-transparent p-4 lg:p-0 -mx-4 lg:mx-0 shadow-xl lg:shadow-none border-b lg:border-b-0 border-slate-700 lg:border-transparent mb-6 lg:mb-0 z-10">
                        <a
                          href={selectedProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
                        >
                          Visit Project <ExternalLink size={20} className="ml-2" />
                        </a>
                        {selectedProject.githubUrl && (
                          <a
                            href={selectedProject.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-600 text-base font-medium rounded-lg shadow-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                          >
                            View on GitHub <Github size={20} className="ml-2" />
                          </a>
                        )}
                        {selectedProject.caseStudyUrl && (
                          <a
                            href={selectedProject.caseStudyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center px-4 py-3 border border-slate-600 text-base font-medium rounded-lg shadow-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                          >
                            Read Case Study <BookOpen size={20} className="ml-2" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-3 p-4 bg-slate-800 rounded-lg">
                        <h4 className="text-xl font-semibold text-white mb-3">Project Info</h4>

                        <p className="text-slate-400 text-sm">
                          <span className="font-semibold">Role:</span> {selectedProject.role}
                        </p>
                        <p className="text-slate-400 text-sm">
                          <span className="font-semibold">Type:</span> {selectedProject.type.replace('-', ' ')}
                        </p>
                        <p className="text-slate-400 text-sm">
                          <span className="font-semibold">Status:</span> {selectedProject.status.replace('-', ' ')}
                        </p>
                        {selectedProject.clientName && (
                          <p className="text-slate-400 text-sm">
                            <span className="font-semibold">Client:</span> {selectedProject.clientName}
                          </p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xl font-semibold text-white mb-3">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.techStack.map((tech, i) => (
                            <span key={i} className="px-3 py-1 bg-cyan-900/50 text-xs text-cyan-300 rounded-full font-medium">
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Project Gallery */}
      {selectedProject?.screenshots && selectedProject.screenshots.length > 0 && (
        <ProjectGallery
          images={selectedProject.screenshots}
          isOpen={isGalleryOpen}
          onClose={closeGallery}
          initialIndex={0}
        />
      )}
      </div>
    </section>
  );
}
