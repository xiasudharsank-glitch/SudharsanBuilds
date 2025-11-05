import { useState } from 'react';
import { ExternalLink, X, FolderOpen, Briefcase, Github, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ProjectStatus = 'completed' | 'in-progress' | 'on-hold';
type ProjectType = 'client' | 'personal' | 'open-source' | 'freelance';

type TechStack = {
  name: string;
  icon?: string;
};

type ClientTestimonial = {
  text: string;
  name: string;
  role: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  image?: string;
  type: ProjectType;
  status: ProjectStatus;
  techStack: TechStack[];
  tags: string[];
  startDate: string;
  endDate?: string;
  role: string;
  keyAchievements?: string[];
  challenges?: string[];
  githubUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
  clientName?: string;
  clientTestimonial?: ClientTestimonial;
};

const getWebsitePreview = (url: string) => {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
};

const PROJECTS: Project[] = [
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
  /*
  {
  id: 'dreamhome-associates-loans',
  title: 'Loan Consultancy Website - Lead Generation Portal',
  type: 'client',
  status: 'completed',
  role: 'Full-stack Developer',
  description: 'Professional website for Dream Home Associates, a loan consultancy firm in Trichy offering home loans, personal loans, and business loans. Features comprehensive loan information, online inquiry forms for lead generation, service details, and easy contact options to help customers find the right loan solutions.',
  link: 'https://dreamhomeassociates.vercel.app',
  techStack: [
    { name: 'React' },
    { name: 'Next.js' },
    { name: 'Tailwind CSS' },
    { name: 'Firebase' },
    { name: 'Form Validation' },
    { name: 'Email Notifications' },
    { name: 'Responsive Design' }
  ],
  tags: ['Loan Consultancy', 'Financial Services', 'Lead Generation', 'B2B'],
  startDate: '2024-06-01',
  endDate: '2024-07-20',
  featured: true,
  clientName: 'Dream Home Associates',
  clientTestimonial: {
    text: 'Sudharsan created a professional website that has significantly improved our lead generation. Customers can easily understand our home, personal, and business loan options, and the online inquiry form captures qualified leads directly. The clean design and clear information have helped us close more clients.',
    name: 'Dream Home Associates Owner',
    role: 'Loan Consultant, Trichy'
  },
  keyAchievements: [
    'Generated 50+ qualified leads within first month of launch',
    'Streamlined loan inquiry process with automated form submissions',
    'Clear categorization of loan types (Home, Personal, Business) improves customer navigation',
    'Professional design builds trust and credibility with potential borrowers',
    'Lead notification system ensures quick response to inquiries',
    'Reduced customer confusion through comprehensive loan information'
  ]
  },*/
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
      text: 'in progress',//'The new e-commerce platform exceeded our expectations with its smooth checkout process and admin dashboard.',
      name: 'Prasanth Kumar',
      role: 'Founder, PSquare Menswear'
    },
    keyAchievements: [
     // 'Integrated Razorpay payment gateway with 99.9% success rate',
     // 'Improved mobile conversion rate by 45%'
    ]
  }
]
;

export default function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    tag: 'all',
    search: '',
  });
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});

  const allTags = Array.from(
    new Set(PROJECTS.flatMap(project => project.tags))
  ).sort();

  const filteredProjects = PROJECTS.filter(project => {
    const matchesType = filters.type === 'all' || project.type === filters.type;
    const matchesTag = filters.tag === 'all' || project.tags.includes(filters.tag);
    const matchesSearch = project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         project.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesTag && matchesSearch;
  });

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    document.body.style.overflow = 'unset';
  };

  const handleImageLoad = (url: string, imageUrl: string) => {
    setPreviewCache(prev => ({
      ...prev,
      [url]: imageUrl
    }));
  };

  const getProjectTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'client':
      case 'freelance':
        return <Briefcase size={20} className="text-cyan-400" />;
      case 'open-source':
        return <Github size={20} className="text-cyan-400" />;
      case 'personal':
      default:
        return <FolderOpen size={20} className="text-cyan-400" />;
    }
  };

  return (
    <section id="projects" className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Featured <span className="text-cyan-400">Projects</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A selection of my recent work, including client projects and personal experiments
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <select 
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="client">Client Work</option>
            <option value="personal">Personal Projects</option>
            <option value="open-source">Open Source</option>
          </select>
          
          <select 
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={filters.tag}
            onChange={(e) => setFilters({...filters, tag: e.target.value})}
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search projects..."
            className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent min-w-[200px]"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="group bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-slate-700 hover:border-cyan-500/50 cursor-pointer"
              onClick={() => openProjectModal(project)}
            >
              <div className="h-48 relative overflow-hidden bg-slate-700">
                <img
                  src={previewCache[project.link] || getWebsitePreview(project.link)}
                  alt={`${project.title} preview`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onLoad={(e) => handleImageLoad(project.link, (e.target as HTMLImageElement).src)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x400/1e293b/64748b?text=${encodeURIComponent(project.title)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex gap-2 flex-wrap">
                    {project.techStack.slice(0, 3).map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-900/80 text-xs text-white rounded">
                        {tech.name}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="px-2 py-1 bg-slate-900/80 text-xs text-white rounded">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-900/80 rounded-full text-white hover:bg-cyan-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={16} />
                    </a>
                  )}
                  {project.caseStudyUrl && (
                    <a 
                      href={project.caseStudyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-900/80 rounded-full text-white hover:bg-cyan-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BookOpen size={16} />
                    </a>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
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
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isModalOpen && selectedProject && (
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
                className="bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 md:p-6 flex items-center justify-between z-10">
                  <div className="flex items-center space-x-3">
                    {getProjectTypeIcon(selectedProject.type)}
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {selectedProject.title}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-4 md:p-8 space-y-8">
                  <div className="aspect-video relative rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-700">
                    <img
                      src={previewCache[selectedProject.link] || getWebsitePreview(selectedProject.link)}
                      alt={`${selectedProject.title} preview`}
                      className="w-full h-full object-cover"
                      onLoad={(e) => handleImageLoad(selectedProject.link, (e.target as HTMLImageElement).src)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/1200x675/1e293b/64748b?text=${encodeURIComponent(selectedProject.title)}`;
                      }}
                    />
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
                      
                      {selectedProject.clientTestimonial && (
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

                      <div className="flex flex-col space-y-3">
                        <a 
                          href={selectedProject.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
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
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}