import { Zap, DollarSign, Video, Globe, Users, Code2, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyFreelance() {
  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Affordable Pricing',
      description: 'No agency overhead. You pay for quality work, not expensive offices.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Quick Turnaround',
      description: 'Dedicated focus on your project with faster delivery times.'
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Direct Communication',
      description: 'Work directly with the developer via Email or Zoom calls.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: '100% Remote',
      description: 'Work from anywhere in India. No geographical limitations.'
    }
  ];

  const whoIHelp = [
    'Startups & Small Businesses',
    'Freelancers & Consultants',
    'E-commerce Stores',
    'Restaurants & Food Services',
    'Service-based Businesses',
    'Personal Brands & Portfolios',
    'SaaS Products',
    'Educational Institutions'
  ];

  const approach = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: 'Modern Tech Stack',
      description: 'React, TypeScript, Node.js - Built with latest technologies'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Quality Focused',
      description: 'Mobile-first, fast loading, SEO optimized websites'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Flexible & Responsive',
      description: 'Available for calls, quick updates, and ongoing support'
    }
  ];

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="why-freelance" className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-cyan-600" />
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Why Choose a <span className="text-cyan-600">Freelance Developer?</span>
            </h2>
          </div>
          <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto mt-4">
            Work directly with an <strong>indie developer</strong> serving clients across India
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-2">
            Professional websites at affordable prices with personalized service
          </p>
        </motion.div>

        {/* Benefits of Freelance */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-8 text-slate-900"
          >
            Benefits of Working <span className="text-cyan-600">Remote</span>
          </motion.h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-3 md:mb-4">
                  {benefit.icon}
                </div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 mb-2">{benefit.title}</h4>
                <p className="text-slate-600 text-xs md:text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Who I Help */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-8 text-slate-900"
          >
            Who I <span className="text-cyan-600">Help</span>
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 md:p-12 rounded-2xl shadow-xl max-w-3xl mx-auto border border-slate-100"
          >
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {whoIHelp.map((business, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5 md:mt-2"></div>
                  <span className="text-slate-700 font-medium text-sm md:text-base leading-tight">{business}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* My Approach */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-8 text-slate-900"
          >
            My <span className="text-cyan-600">Approach</span>
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {approach.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-white"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-cyan-50">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Communication Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 md:p-12 rounded-2xl max-w-4xl mx-auto mb-12 text-white"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            Let's Discuss Your Project
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Video Call</p>
                <p className="text-sm text-slate-300">Quick chat anytime</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Zoom Meeting</p>
                <p className="text-sm text-slate-300">Detailed discussion</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Email/Chat</p>
                <p className="text-sm text-slate-300">Async updates</p>
              </div>
            </div>
          </div>
          <p className="text-center text-slate-300">
            100% Remote work - No office visits required. Work with clients from anywhere in India.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 md:p-12 rounded-2xl max-w-3xl mx-auto border-2 border-cyan-200">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Ready to Start Your Project?
            </h3>
            <p className="text-lg text-slate-700 mb-6">
              Get your free consultation today and let's build something amazing together
            </p>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              Get Your Free Consultation
            </button>
            <p className="text-sm text-slate-600 mt-4">
              Serving startups, businesses, and entrepreneurs across India 🇮🇳
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
