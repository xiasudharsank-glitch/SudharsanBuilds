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
    id: 'skillpath-ai',
    title: 'SkillPathAI App',
    description: 'AI-powered personalized learning assistant with tailored learning paths and project tracking.',
    link: 'https://freelancerassistance.lovable.app',
    type: 'personal',
    status: 'completed',
    role: 'Full-stack Developer',
    techStack: [
      { name: 'React' },
      { name: 'Firebase' },
      { name: 'OpenAI API' },
      { name: 'Tailwind CSS' }
    ],
    tags: ['AI', 'Education', 'Productivity'],
    startDate: '2023-05-01',
    endDate: '2023-08-15',
    featured: true,
    githubUrl: 'https://github.com/yourusername/skillpath-ai',
    caseStudyUrl: 'https://yourblog.com/case-studies/skillpath-ai',
    keyAchievements: [
      'Reduced learning path generation time by 60% using OpenAI API optimizations',
      'Achieved 95% user satisfaction rate with personalized recommendations'
    ]
  },
  {
    id: 'psquare-menswear',
    title: 'E-Commerce Platform',
    description: 'Full-featured online store with payment integration and admin dashboard for a premium menswear brand.',
    link: 'https://psquaremenswear.vercel.app',
    type: 'client',
    status: 'completed',
    role: 'Frontend Developer',
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
    clientName: 'PSquare Menswear',
    clientTestimonial: {
      text: 'The new e-commerce platform exceeded our expectations with its smooth checkout process and admin dashboard.',
      name: 'John Doe',
      role: 'CEO, PSquare Menswear'
    },
    keyAchievements: [
      'Integrated Razorpay payment gateway with 99.9% success rate',
      'Improved mobile conversion rate by 45%'
    ]
  },
  {
    id: 'portfolio-generator',
    title: 'Portfolio Generator',
    description: 'Automated portfolio builder that creates beautiful websites from user data.',
    link: 'https://sudharsanbuilds.vercel.app',
    type: 'personal',
    status: 'in-progress',
    role: 'Full-stack Developer',
    techStack: [
      { name: 'Next.js' },
      { name: 'TypeScript' },
      { name: 'Tailwind CSS' },
      { name: 'MongoDB' }
    ],
    tags: ['Portfolio', 'Templates', 'Automation'],
    startDate: '2023-09-01',
    featured: true,
    githubUrl: 'https://github.com/yourusername/portfolio-generator',
    keyAchievements: [
      'Created 10+ customizable portfolio templates',
      'Reduced portfolio setup time from hours to minutes'
    ]
  },
  {
    id: 'task-master',
    title: 'Task Management Tool',
    description: 'Project management solution with team collaboration and progress tracking.',
    link: 'https://taskmaster-demo.vercel.app',
    type: 'open-source',
    status: 'completed',
    role: 'Frontend Developer',
    techStack: [
      { name: 'React' },
      { name: 'Redux' },
      { name: 'Firebase' },
      { name: 'Material-UI' }
    ],
    tags: ['Productivity', 'Collaboration', 'Kanban'],
    startDate: '2023-03-15',
    endDate: '2023-06-30',
    featured: true,
    githubUrl: 'https://github.com/yourusername/task-master',
    caseStudyUrl: 'https://yourblog.com/case-studies/task-master',
    keyAchievements: [
      'Implemented real-time collaboration features',
      'Reduced task completion time by 30%'
    ]
  }
];

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