import { Globe, Building2, ShoppingCart, Code2, Clock, CheckCircle2, User, Briefcase, Rocket, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useMobile';

interface Service {
  icon: React.ReactNode;
  name: string;
  price: string;
  priceSubtext?: string;
  description: string;
  features: string[];
  timeline: string;
  ctaText: string;
  ctaAction: 'book' | 'quote';
  depositAmount?: number;
  popular?: boolean;
}

export default function Services() {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const isMobile = useIsMobile();

  const services: Service[] = [
    {
      icon: <Globe className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Landing Page',
      price: '₹15,000',
      description: '1-2 page website, modern design, mobile responsive, perfect for launching quickly',
      features: [
        'Responsive Design',
        'Contact Form Integration',
        'Google Analytics Setup',
        'SSL Certificate',
        'Fast Loading Speed',
        'Basic SEO Optimization'
      ],
      timeline: '1-2 weeks',
      ctaText: 'Book Now - Pay ₹5,000 Deposit',
      ctaAction: 'book',
      depositAmount: 5000,
    },
    {
      icon: <User className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Portfolio Website',
      price: '₹20,000',
      description: 'Professional portfolio for freelancers, designers, developers & creatives',
      features: [
        'Project Showcase Gallery',
        'About & Skills Section',
        'Resume Download',
        'Contact Form',
        'Testimonials Section',
        'Mobile Responsive'
      ],
      timeline: '2-3 weeks',
      ctaText: 'Book Now - Pay ₹7,000 Deposit',
      ctaAction: 'book',
      depositAmount: 7000,
    },
    {
      icon: <Building2 className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Business Website',
      price: '₹30,000',
      description: '5-10 pages, professional design, CMS integration, perfect for established businesses',
      features: [
        'Multi-page Layout (5-10 pages)',
        'CMS Integration (Easy Updates)',
        'Blog Section',
        'Advanced Analytics',
        'SEO Optimization',
        'Contact Forms & Maps'
      ],
      timeline: '3-4 weeks',
      ctaText: 'Book Now - Pay ₹10,000 Deposit',
      ctaAction: 'book',
      depositAmount: 10000,
      popular: true,
    },
    {
      icon: <Briefcase className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Personal Brand Website',
      price: '₹25,000',
      description: 'Build your personal brand with a professional website for coaches, consultants & professionals',
      features: [
        'About & Services Pages',
        'Blog/Articles Section',
        'Email Newsletter Integration',
        'Social Media Integration',
        'Booking/Calendar Integration',
        'SEO & Analytics'
      ],
      timeline: '3 weeks',
      ctaText: 'Book Now - Pay ₹8,000 Deposit',
      ctaAction: 'book',
      depositAmount: 8000,
    },
    {
      icon: <ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'E-Commerce Store',
      price: '₹50,000',
      description: 'Complete online store with payment gateway, inventory management & admin panel',
      features: [
        'Product Catalog (Unlimited)',
        'Shopping Cart',
        'Razorpay/PayPal Integration',
        'Inventory Management',
        'Order Tracking',
        'Admin Dashboard'
      ],
      timeline: '4-6 weeks',
      ctaText: 'Book Now - Pay ₹15,000 Deposit',
      ctaAction: 'book',
      depositAmount: 15000,
    },
    {
      icon: <Rocket className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'SaaS Product',
      price: '₹75,000+',
      priceSubtext: 'Starting from',
      description: 'Full-featured SaaS platform with user management, subscriptions & admin dashboard',
      features: [
        'User Authentication',
        'Subscription Billing',
        'Admin & User Dashboards',
        'API Integration',
        'Database Design',
        'Scalable Architecture'
      ],
      timeline: '6-10 weeks',
      ctaText: 'Book Now - Pay ₹20,000 Deposit',
      ctaAction: 'book',
      depositAmount: 20000,
    },
    {
      icon: <Layers className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Web Application',
      price: '₹60,000+',
      priceSubtext: 'Starting from',
      description: 'Custom web applications with complex features & functionality',
      features: [
        'Custom Requirements',
        'Database & Backend',
        'User Management',
        'Real-time Features',
        'Third-party Integrations',
        'Responsive Design'
      ],
      timeline: '5-8 weeks',
      ctaText: 'Book Now - Pay ₹18,000 Deposit',
      ctaAction: 'book',
      depositAmount: 18000,
    },
    {
      icon: <Code2 className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Custom Development',
      price: '₹500-₹1000/hour',
      priceSubtext: 'Negotiable',
      description: 'Hourly-based custom projects, API integrations, complex features & maintenance',
      features: [
        'Custom Requirements',
        'Full-stack Development',
        'API Integration',
        'Bug Fixes & Updates',
        'Code Reviews',
        'Ongoing Support'
      ],
      timeline: 'Flexible',
      ctaText: 'Get Quote - Discuss Project',
      ctaAction: 'quote',
    },
  ];

  const handleBooking = async (service: Service) => {
    if (service.ctaAction === 'quote' || !service.depositAmount) {
      // Scroll to contact form for quotes
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Handle Razorpay payment
    setIsPaymentLoading(true);

    try {
      // Call Supabase Edge Function to create Razorpay order
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: service.depositAmount * 100, // Convert to paise
          currency: 'INR',
          receipt: `deposit_${service.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          notes: {
            service_name: service.name,
            service_price: service.price,
            deposit_amount: service.depositAmount
          }
        })
      });

      const { orderId, amount } = await response.json();

      // Load Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Sudharsan Builds',
        description: `Deposit for ${service.name}`,
        order_id: orderId,
        handler: function (response: any) {
          // Payment successful
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}\n\nThank you for your deposit! I'll contact you on WhatsApp within 24 hours to discuss your project.`);

          // You can send this to your backend to verify and store
          console.log('Payment Response:', response);
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#0891b2'
        },
        modal: {
          ondismiss: function() {
            setIsPaymentLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      setIsPaymentLoading(false);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Unable to process payment. Please contact us directly via WhatsApp or email.');
      setIsPaymentLoading(false);

      // Fallback to contact form
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-slate-900"
          >
            Services & <span className="text-cyan-600">Pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Transparent pricing with no hidden fees. Choose the package that fits your needs.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services
            .slice(0, isMobile && !showAllServices ? 4 : services.length)
            .map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`relative bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${
                service.popular ? 'border-cyan-500' : 'border-slate-100'
              }`}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${
                  service.popular
                    ? 'from-cyan-500 to-blue-600'
                    : 'from-cyan-400 to-blue-500'
                } rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-transform hover:rotate-6`}>
                  {service.icon}
                </div>
              </div>

              {/* Service Name */}
              <h3 className="text-xl md:text-2xl font-bold text-center text-slate-900 mb-2">
                {service.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-4">
                <p className="text-2xl md:text-3xl font-extrabold text-cyan-600">
                  {service.price}
                </p>
                {service.priceSubtext && (
                  <p className="text-sm text-slate-500 mt-1">{service.priceSubtext}</p>
                )}
              </div>

              {/* Description */}
              <p className="text-slate-600 text-center mb-6 text-sm leading-relaxed">
                {service.description}
              </p>

              {/* Timeline */}
              <div className="flex items-center justify-center gap-2 mb-6 text-slate-700">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-semibold">Timeline: {service.timeline}</span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleBooking(service)}
                disabled={isPaymentLoading}
                className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  service.ctaAction === 'book'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/50'
                    : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:shadow-slate-500/50'
                }`}
              >
                {isPaymentLoading ? 'Processing...' : service.ctaText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* View All Services Button - Mobile Only */}
        {!showAllServices && services.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 md:hidden flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllServices(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              View All {services.length} Services
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Show Less Button - Mobile Only */}
        {showAllServices && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 md:hidden flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAllServices(false);
                // Scroll back to services section
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-slate-500/50 transition-all"
            >
              Show Less
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-semibold">100% Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <Code2 className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="font-semibold">100% Remote Work</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-600">
            <strong>Secure payments via Razorpay</strong> - UPI, Cards, Net Banking accepted.
            <br />
            Can't pay deposit now? <a href="#contact" className="text-cyan-600 hover:underline">Contact me</a> to discuss your project first.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
