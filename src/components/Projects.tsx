import { ExternalLink } from 'lucide-react';

export default function Projects() {
  const projects = [
    {
      title: 'E-Commerce Platform',
      tech: 'React, Supabase, Stripe',
      description: 'Full-featured online store with payment integration, inventory management, and admin dashboard.',
      gradient: 'from-purple-500 to-pink-500',
      image: '/images/ecommerce.jpg', // ← Replace with actual image path
      link: 'https://estorebysudharsan.lovable.app' // ← Replace with actual URL
    },
    {
      title: 'SaaS Analytics Dashboard',
      tech: 'TypeScript, Charts, API Integration',
      description: 'Real-time analytics platform with subscription management and data visualization.',
      gradient: 'from-blue-500 to-cyan-500',
      image: '/images/saas-dashboard.jpg',
      link: 'https://your-saas-dashboard.com'
    },
    {
      title: 'Booking Management System',
      tech: 'React, Calendar API, Notifications',
      description: 'Appointment scheduling system with automated reminders and payment processing.',
      gradient: 'from-green-500 to-teal-500',
      image: '/images/booking.jpg',
      link: 'https://your-booking-system.com'
    },
    {
      title: 'Social Media App',
      tech: 'React, Real-time DB, Authentication',
      description: 'Community platform with user profiles, posts, comments, and real-time interactions.',
      gradient: 'from-orange-500 to-red-500',
      image: '/images/social-app.jpg',
      link: 'https://your-social-app.com'
    },
    {
      title: 'Task Management Tool',
      tech: 'React, Drag & Drop, Collaboration',
      description: 'Project management solution with team collaboration and progress tracking features.',
      gradient: 'from-indigo-500 to-purple-500',
      image: '/images/task-tool.jpg',
      link: 'https://sudharsanchatbot.lovable.app'
    },
    {
      title: 'Portfolio Generator',
      tech: 'Dynamic Templates, CMS',
      description: 'Automated portfolio builder that creates beautiful websites from user data.',
      gradient: 'from-yellow-500 to-orange-500',
      image: '/images/portfolio.jpg',
      link: 'https://your-portfolio-generator.com'
    },
    {
      titile: 'AI Assistance',
      tech: 'bolt,supabase,external api',
      description: 'Automatic lead and proposal generator using job description and fiverr profile',
      gradient: 'from black-500 to-orange-600',
      image: 'placeholder'
      link: 'freelancerassistance.lovable.app'
    }
  ];

  return (
    <section id="projects" className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-16 text-white">
          Featured <span className="text-cyan-400">Projects</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className={`h-48 bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ExternalLink className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110" />
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-cyan-400 text-sm font-medium">{project.tech}</p>
                <p className="text-slate-300 leading-relaxed">{project.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
