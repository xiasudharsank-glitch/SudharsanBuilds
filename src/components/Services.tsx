import { Globe, Building2, ShoppingCart, Code2, Clock, CheckCircle2, User, Briefcase, Rocket, Layers, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { initEmailJS } from '../services/emailService';
import { generateAndSendInvoice } from '../services/invoiceService';
import { env, features } from '../utils/env';

interface Service {
  icon: React.ReactNode;
  name: string;
  price: string;
  priceSubtext?: string;
  totalAmount?: number; // Numeric total amount for calculations
  description: string;
  features: string[];
  timeline: string;
  ctaText: string;
  ctaAction: 'book' | 'quote';
  depositAmount?: number;
  popular?: boolean;
}

export default function Services({ showAll = false }: { showAll?: boolean }) {
  const navigate = useNavigate();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    projectDetails: ''
  });

  // ✅ ACCESSIBILITY: Focus management for modal
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Initialize EmailJS on component mount
  useEffect(() => {
    initEmailJS();
  }, []);

  // Lazy load Razorpay script when component mounts
  useEffect(() => {
    const loadRazorpay = () => {
      // Check if already loaded
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
        console.log('✅ Razorpay script loaded');
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        setRazorpayLoaded(false);
      };
      document.body.appendChild(script);
    };

    loadRazorpay();
  }, []);

  // ✅ ACCESSIBILITY: Focus first input when modal opens
  useEffect(() => {
    if (showBookingModal && firstInputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [showBookingModal]);

  const services: Service[] = [
    {
      icon: <Globe className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Landing Page',
      price: '₹15,000',
      totalAmount: 15000,
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
      totalAmount: 20000,
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
      totalAmount: 30000,
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
      totalAmount: 25000,
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
      totalAmount: 50000,
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
      totalAmount: 75000,
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
      totalAmount: 60000,
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
      totalAmount: undefined, // Hourly rate - no fixed total
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

    // Show booking modal to collect customer details
    setSelectedService(service);
    setShowBookingModal(true);
  };

  // ✅ NEW: Handle Enter key to move to next field in booking modal
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const modalContainer = e.currentTarget.closest('.booking-modal-form');
      if (!modalContainer) return;

      const formElements = Array.from(modalContainer.querySelectorAll('input[type="text"], input[type="email"], textarea')) as HTMLElement[];
      const currentIndex = formElements.indexOf(e.currentTarget as HTMLElement);

      // Find next focusable element
      const nextElement = formElements[currentIndex + 1];
      if (nextElement) {
        e.preventDefault();
        nextElement.focus();
      }
    }
  };

  // ✅ FIX: Parse Razorpay errors and provide specific messages
  const getRazorpayErrorMessage = (error: any): string => {
    const errorCode = error?.error?.code;
    const errorDescription = error?.error?.description;
    const errorReason = error?.error?.reason;

    // Specific Razorpay error codes
    switch (errorCode) {
      case 'BAD_REQUEST_ERROR':
        return '❌ Invalid payment request. Please try again or contact support.';
      case 'GATEWAY_ERROR':
        return '❌ Payment gateway error. Please try a different payment method.';
      case 'SERVER_ERROR':
        return '❌ Server error occurred. Please try again in a moment.';
      case 'NETWORK_ERROR':
        return '❌ Network connection issue. Please check your internet and try again.';
      default:
        // Check for common error reasons
        if (errorReason?.includes('payment_failed')) {
          return '❌ Payment failed. Please check your payment details and try again.';
        }
        if (errorReason?.includes('card_declined')) {
          return '❌ Card declined. Please try a different card or payment method.';
        }
        if (errorReason?.includes('insufficient_funds')) {
          return '❌ Insufficient funds. Please use a different payment method.';
        }
        if (errorDescription?.toLowerCase().includes('timeout')) {
          return '❌ Payment timeout. Please try again.';
        }

        // Generic fallback
        return errorDescription || '❌ Payment failed. Please contact us directly via email.';
    }
  };

  const handlePaymentProceed = async () => {
    if (!selectedService || !selectedService.depositAmount) return;

    // Validate customer details (phone is optional)
    if (!customerDetails.name.trim() || !customerDetails.email.trim() || !customerDetails.projectDetails.trim()) {
      alert('Please fill in all required fields (name, email, project details)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate phone format (international - handled by PhoneInput library) - OPTIONAL
    // Only validate if phone is provided
    if (customerDetails.phone && customerDetails.phone.trim() && customerDetails.phone.length < 8) {
      alert('Please enter a valid international phone number');
      return;
    }

    // ✅ FIX: Validate Razorpay script is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      alert('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    // Close modal and start payment
    setShowBookingModal(false);
    setIsPaymentLoading(true);

    try {
      // ✅ CRITICAL FIX: Check env vars BEFORE any URL construction
      if (!env.SUPABASE_URL ||
          env.SUPABASE_URL === '' ||
          !env.SUPABASE_URL.startsWith('http') ||
          env.SUPABASE_URL.includes('your-project') ||
          env.SUPABASE_URL.includes('YOUR_') ||
          !env.SUPABASE_ANON_KEY ||
          env.SUPABASE_ANON_KEY === '' ||
          !env.RAZORPAY_KEY_ID ||
          env.RAZORPAY_KEY_ID === '') {
        console.error('❌ Payment system not configured - missing or invalid environment variables');
        alert('⚠️ Payment system is not configured yet.\n\nPlease contact us directly via email:\nsudharsanofficial0001@gmail.com');
        setIsPaymentLoading(false);

        // Scroll to contact form
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        return; // Stop execution - don't construct URL or call fetch
      }

      // ✅ FIX: Use totalAmount field instead of parsing price string
      const totalAmount = selectedService.totalAmount || selectedService.depositAmount;

      // Now it's safe to construct the URL
      const createOrderUrl = `${env.SUPABASE_URL}/functions/v1/create-payment-order`;

      // Call Supabase Edge Function to create Razorpay order
      const response = await fetch(createOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: selectedService.depositAmount * 100, // Convert to paise
          currency: 'INR',
          receipt: `deposit_${selectedService.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
          notes: {
            service_name: selectedService.name,
            service_price: selectedService.price,
            total_amount: totalAmount,
            deposit_amount: selectedService.depositAmount,
            customer_name: customerDetails.name,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const { orderId, amount } = await response.json();

      // Load Razorpay checkout
      const options = {
        key: env.RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Sudharsan Builds',
        description: `Deposit for ${selectedService.name}`,
        order_id: orderId,
        handler: async function (razorpayResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          console.log('Payment Response:', razorpayResponse);

          try {
            // ✅ CRITICAL FIX: Check env vars before constructing verify URL
            if (!env.SUPABASE_URL || !env.SUPABASE_URL.startsWith('http')) {
              throw new Error('Payment verification unavailable - invalid configuration');
            }

            // Now safe to construct URL
            const verifyUrl = `${env.SUPABASE_URL}/functions/v1/verify-payment`;

            const verifyResponse = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature
              })
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResult.success || !verifyResult.verified) {
              console.error('Payment verification failed:', verifyResult);
              alert('❌ Payment verification failed. Please contact support with Payment ID: ' + razorpayResponse.razorpay_payment_id);
              return;
            }

            console.log('✅ Payment verified successfully');

            // Generate invoice and send all emails
            const invoiceResult = await generateAndSendInvoice({
              name: customerDetails.name,
              email: customerDetails.email,
              phone: customerDetails.phone,
              service: selectedService.name,
              amount: totalAmount,
              depositAmount: selectedService.depositAmount!,
              timeline: selectedService.timeline,
              projectDetails: customerDetails.projectDetails,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpaySignature: razorpayResponse.razorpay_signature
            });

            if (invoiceResult.success) {
              alert(`✅ Payment successful!\n\nInvoice ID: ${invoiceResult.invoiceId}\n\nThank you for your booking! You'll receive:\n• Booking confirmation email\n• Invoice with payment details\n\nI'll contact you within 24 hours to discuss your project.`);

              // Reset customer details
              setCustomerDetails({
                name: '',
                email: '',
                phone: '',
                projectDetails: ''
              });
            } else {
              alert(`✅ Payment successful!\n\nPayment ID: ${razorpayResponse.razorpay_payment_id}\n\nThank you for your deposit! I'll contact you within 24 hours.\n\nNote: Email notification may be delayed. Please check your inbox.`);
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            alert(`⚠️ Payment received but verification failed.\n\nPayment ID: ${razorpayResponse.razorpay_payment_id}\n\nPlease contact support to confirm your booking.`);
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
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
      razorpay.on('payment.failed', function (response: any) {
        // ✅ FIX: Handle Razorpay payment failures with specific messages
        const errorMessage = getRazorpayErrorMessage(response);
        alert(errorMessage + '\n\nNeed help? Contact us at:\nsudharsanofficial0001@gmail.com');
        setIsPaymentLoading(false);
      });
      razorpay.open();
      setIsPaymentLoading(false);
    } catch (error) {
      // ✅ FIX: Provide specific error messages
      console.error('Payment error:', error);
      const errorMessage = getRazorpayErrorMessage(error);
      alert(errorMessage + '\n\nNeed help? Contact us at:\nsudharsanofficial0001@gmail.com');
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
            .slice(0, showAll ? services.length : 2)
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
                disabled={isPaymentLoading || (service.ctaAction === 'book' && !razorpayLoaded)}
                className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  service.ctaAction === 'book'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/50'
                    : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:shadow-slate-500/50'
                }`}
              >
                {isPaymentLoading
                  ? 'Processing...'
                  : (service.ctaAction === 'book' && !razorpayLoaded)
                  ? 'Loading payment system...'
                  : service.ctaText}
              </button>
            </motion.div>
          ))}
        </div>

        {/* View All Services Button - Contrasting Color */}
        {!showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/services')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all border-2 border-orange-400"
            >
              View All {services.length} Services & Pricing
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        )}

        {/* Trust Indicators - Only show on dedicated Services page */}
        {showAll && (
          <>
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
          </>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] min-h-[300px] overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Complete Your Booking</h3>
                    <p className="text-cyan-50">{selectedService.name} - {selectedService.price}</p>
                    <p className="text-sm text-cyan-100 mt-1">Deposit: ₹{selectedService.depositAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="booking-modal-form p-6 space-y-4">
                <p className="text-slate-600 text-sm">
                  Please provide your details to complete the booking. You'll receive a confirmation email and invoice after payment.
                </p>

                {/* Name */}
                <div>
                  <label htmlFor="modal-name" className="block text-slate-700 font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="modal-name"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                    onKeyDown={handleModalKeyDown}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="modal-email" className="block text-slate-700 font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="modal-email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                    onKeyDown={handleModalKeyDown}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="modal-phone" className="block text-slate-700 font-semibold mb-2">
                    Phone Number (Optional)
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={customerDetails.phone}
                    onChange={(value) => setCustomerDetails({ ...customerDetails, phone: value || '' })}
                    className="w-full"
                    style={{
                      '--PhoneInputCountryFlag-height': '1em',
                      '--PhoneInput-color--focus': '#06b6d4',
                    } as React.CSSProperties}
                    numberInputProps={{
                      className: 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500'
                    }}
                  />
                </div>

                {/* Project Details */}
                <div>
                  <label htmlFor="modal-details" className="block text-slate-700 font-semibold mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="modal-details"
                    value={customerDetails.projectDetails}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, projectDetails: e.target.value })}
                    onKeyDown={(e) => {
                      // Shift+Enter: new line, Enter: proceed to payment (last field)
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePaymentProceed();
                      }
                    }}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    placeholder="Brief description of your project requirements..."
                    required
                  />
                </div>

                {/* Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service:</span>
                      <span className="font-semibold text-slate-900">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-semibold text-slate-900">{selectedService.price}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-600">Deposit (Pay Now):</span>
                      <span className="font-bold text-cyan-600 text-lg">₹{selectedService.depositAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Timeline:</span>
                      <span className="font-semibold text-slate-900">{selectedService.timeline}</span>
                    </div>
                  </div>
                </div>

                {/* Actions - Sticky at bottom for better UX */}
                <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-4 border-t border-slate-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePaymentProceed}
                      disabled={isPaymentLoading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPaymentLoading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
