// Shared projects data for Projects component and AI Chatbot

export type ProjectStatus = 'completed' | 'in-progress' | 'on-hold';
export type ProjectType = 'client' | 'personal' | 'open-source' | 'freelance';

export type TechStack = {
  name: string;
  icon?: string;
};

export type ClientTestimonial = {
  text: string;
  name: string;
  role: string;
};

export type Project = {
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
  screenshots?: string[];
};

export const PROJECTS_DATA: Project[] = [
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
  screenshots: [
    '/images/projects/manoj-kumar/WhatsApp Image 2025-11-17 at 09.02.06_cc9aaa21.jpg',
    '/images/projects/manoj-kumar/WhatsApp Image 2025-11-20 at 18.46.50_099a0e8c.jpg'
  ],
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
    title: 'PSquare Menswear - Premium E-Commerce Platform',
    description: 'Full-featured e-commerce platform for a premium menswear brand featuring Razorpay and PayPal payment integration, real-time inventory management, dynamic product catalog, shopping cart with session persistence, order tracking system, and comprehensive admin dashboard for managing products, orders, and customers.',
    link: 'https://psquaremenswear.vercel.app',
    type: 'client',
    status: 'completed',
    role: 'Full-stack Developer',
    techStack: [
      { name: 'React' },
      { name: 'TypeScript' },
      { name: 'Supabase' },
      { name: 'Razorpay' },
      { name: 'PayPal' },
      { name: 'Tailwind CSS' }
    ],
    tags: ['E-commerce', 'Payments', 'Admin Dashboard', 'Full-stack'],
    startDate: '2024-09-15',
    endDate: '2024-11-20',
    featured: true,
    clientName: 'Prasanth Kumar',
    clientTestimonial: {
      text: 'Sudharsan delivered an exceptional e-commerce platform that exceeded our expectations. The dual payment integration (Razorpay and PayPal) gives our customers flexibility, and the admin dashboard makes managing our inventory effortless. Since launching, we\'ve seen a significant increase in online orders and customer satisfaction. The platform is fast, reliable, and exactly what we needed.',
      name: 'Prasanth Kumar',
      role: 'Founder, PSquare Menswear'
    },
    keyAchievements: [
      'Dual payment gateway integration (Razorpay + PayPal) increases conversion by 40%',
      'Real-time inventory management prevents overselling and stockouts',
      'Admin dashboard streamlines order fulfillment and reduces processing time by 60%',
      'Mobile-responsive design ensures seamless shopping on all devices',
      'Shopping cart persistence improves checkout completion rate',
      'Order tracking system reduces customer support inquiries by 50%'
    ]
  }
];
