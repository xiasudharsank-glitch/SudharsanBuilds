import { Globe, Building2, ShoppingCart, Code2, Clock, CheckCircle2, User, Briefcase, Rocket, Layers, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { sendBookingConfirmation, sendNewBookingAlert } from '../services/emailService'; // ✅ CHANGED: Import functions, not init
import { generateAndSendInvoice } from '../services/invoiceService';
import { env, features } from '../utils/env';
import { validatePhone } from '../utils/validation'; // ✅ FIX: Use shared validation
import { getActiveRegion, formatCurrency } from '../config/regions';

// TypeScript declarations for payment gateways
declare global {
  interface Window {
    Razorpay: any;
    paypal: any;
  }
}

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
  const location = useLocation();
  const regionConfig = getActiveRegion();
  const { currency, pricing, payment } = regionConfig;
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    projectDetails: ''
  });
  // ✅ P1 FIX: Inline validation errors instead of alert()
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    projectDetails?: string;
  }>({});

  // ✅ ACCESSIBILITY: Focus management for modal
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // ✅ FIX #8: CSRF token generation for payment security
  useEffect(() => {
    // Generate CSRF token on component mount if not already present
    if (!sessionStorage.getItem('csrf_token')) {
      const csrfToken = crypto.randomUUID();
      sessionStorage.setItem('csrf_token', csrfToken);
      console.log('✅ CSRF token generated for payment security');
    }
  }, []);

  // ✅ LAZY LOAD: EmailJS now initializes only when actually sending emails (in handlePaymentProceed)

  // ✅ LAZY LOAD: Payment Gateway Script - loads Razorpay OR PayPal based on region
  useEffect(() => {
    if (!showBookingModal) return;

    // Load Razorpay for India region
    if (payment.gateway === 'razorpay' && !razorpayLoaded && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
        console.log('✅ Razorpay script loaded (India region)');
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        setRazorpayLoaded(false);
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }

    // Load PayPal for Global region
    if (payment.gateway === 'paypal' && !paypalLoaded && !window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${env.PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
        console.log('✅ PayPal SDK loaded (Global region)');
      };
      script.onerror = () => {
        console.error('❌ Failed to load PayPal SDK');
        setPaypalLoaded(false);
      };
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [showBookingModal, payment.gateway, razorpayLoaded, paypalLoaded]);


  // ✅ P2 FIX: Focus management and escape key for modal
  useEffect(() => {
    if (showBookingModal) {
      // Focus first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // ✅ P2 FIX: Escape key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowBookingModal(false);
        }
      };

      // ✅ P2 FIX: Focus trap - keep focus inside modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTab);
      };
    }
  }, [showBookingModal]);

  const services: Service[] = [
    {
      icon: <Globe className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Landing Page',
      price: formatCurrency(pricing.landingPage.total, regionConfig),
      totalAmount: pricing.landingPage.total,
      description: '1-2 page website, modern design, mobile responsive, perfect for launching quickly',
      features: [
        'Responsive Design',
        'Contact Form Integration',
        'Google Analytics Setup',
        'SSL Certificate',
        'Fast Loading Speed',
        'Basic SEO Optimization'
      ],
      timeline: pricing.landingPage.timeline,
      ctaText: `Book Now - Pay ${formatCurrency(pricing.landingPage.deposit, regionConfig)} Deposit`,
      ctaAction: 'book',
      depositAmount: pricing.landingPage.deposit,
    },
    {
      icon: <User className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Portfolio Website',
      price: formatCurrency(pricing.portfolio.total, regionConfig),
      totalAmount: pricing.portfolio.total,
      description: 'Professional portfolio for freelancers, designers, developers & creatives',
      features: [
        'Project Showcase Gallery',
        'About & Skills Section',
        'Resume Download',
        'Contact Form',
        'Testimonials Section',
        'Mobile Responsive'
      ],
      timeline: pricing.portfolio.timeline,
      ctaText: `Book Now - Pay ${formatCurrency(pricing.portfolio.deposit, regionConfig)} Deposit`,
      ctaAction: 'book',
      depositAmount: pricing.portfolio.deposit,
    },
    {
      icon: <Building2 className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Business Website',
      price: formatCurrency(pricing.business.total, regionConfig),
      totalAmount: pricing.business.total,
      description: '5-10 pages, professional design, CMS integration, perfect for established businesses',
      features: [
        'Multi-page Layout (5-10 pages)',
        'CMS Integration (Easy Updates)',
        'Blog Section',
        'Advanced Analytics',
        'SEO Optimization',
        'Contact Forms & Maps'
      ],
      timeline: pricing.business.timeline,
      ctaText: `Book Now - Pay ${formatCurrency(pricing.business.deposit, regionConfig)} Deposit`,
      ctaAction: 'book',
      depositAmount: pricing.business.deposit,
      popular: true,
    },
    {
      icon: <Briefcase className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Personal Brand Website',
      price: formatCurrency(pricing.personalBrand.total, regionConfig),
      totalAmount: pricing.personalBrand.total,
      description: 'Build your personal brand with a professional website for coaches, consultants & professionals',
      features: [
        'About & Services Pages',
        'Blog/Articles Section',
        'Email Newsletter Integration',
        'Social Media Integration',
        'Booking/Calendar Integration',
        'SEO & Analytics'
      ],
      timeline: pricing.personalBrand.timeline,
      ctaText: `Book Now - Pay ${formatCurrency(pricing.personalBrand.deposit, regionConfig)} Deposit`,
      ctaAction: 'book',
      depositAmount: pricing.personalBrand.deposit,
    },
    {
      icon: <ShoppingCart className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'E-Commerce Store',
      price: formatCurrency(pricing.ecommerce.total, regionConfig),
      totalAmount: pricing.ecommerce.total,
      description: `Complete online store with payment gateway, inventory management & admin panel`,
      features: [
        'Product Catalog (Unlimited)',
        'Shopping Cart',
        `${payment.gateway === 'razorpay' ? 'Razorpay' : 'PayPal'} Integration`,
        'Inventory Management',
        'Order Tracking',
        'Admin Dashboard'
      ],
      timeline: pricing.ecommerce.timeline,
      ctaText: `Book Now - Pay ${formatCurrency(pricing.ecommerce.deposit, regionConfig)} Deposit`,
      ctaAction: 'book',
      depositAmount: pricing.ecommerce.deposit,
    },
    {
      icon: <Rocket className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'SaaS Product',
      price: `${formatCurrency(pricing.saas.total, regionConfig)}+`,
      priceSubtext: 'Starting from',
      totalAmount: pricing.saas.total,
      description: 'Full-featured SaaS platform with user management, subscriptions & admin dashboard',
      features: [
        'User Authentication',
        'Subscription Billing',
        'Admin & User Dashboards',
        'API Integration',
        'Database Design',
        'Scalable Architecture'
      ],
      timeline: pricing.saas.timeline,
      ctaText: `Book Now - Pay ${formatCurrency(pricing.saas.deposit, regionConfig)} Deposit`,
      ctaAction: 'book',
      depositAmount: pricing.saas.deposit,
    },
    {
      icon: <Layers className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Web Application',
      price: `${formatCurrency(pricing.webApp.total, regionConfig)}+`,
      priceSubtext: 'Starting from',
      totalAmount: pricing.webApp.total,
      description: 'Custom web applications with complex features & functionality',
      features: [
        'Custom Requirements',
        'Database & Backend',
        'User Management',
        'Real-time Features',
        'Third-party Integrations',
        'Responsive Design'
      ],
      timeline: pricing.webApp.timeline,
      ctaText: `Book Now - Pay ${formatCurrency(pricing.webApp.deposit, regionConfig)} Deposit`,
      ctaAction: 'book',
      depositAmount: pricing.webApp.deposit,
    },
    {
      icon: <Code2 className="w-8 h-8 md:w-10 md:h-10" />,
      name: 'Custom Development',
      price: `${formatCurrency(pricing.hourly.rate, regionConfig)}/hour`,
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
      // Navigate to home page first if not already there, then scroll to contact form
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for route change and DOM update before scrolling
        setTimeout(() => {
          const contactSection = document.getElementById('contact');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // Retry if element not found (page might still be loading)
            setTimeout(() => {
              const retrySection = document.getElementById('contact');
              if (retrySection) {
                retrySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          }
        }, 100);
      } else {
        // Already on home page, just scroll to contact
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

  // ✅ Razorpay Payment Handler (India)
  const processRazorpayPayment = async () => {
    if (!selectedService || !selectedService.depositAmount) return;

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

      // ✅ FIX #8: Get CSRF token from sessionStorage for security
      const csrfToken = sessionStorage.getItem('csrf_token');

      // Call Supabase Edge Function to create Razorpay order
      const response = await fetch(createOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'X-CSRF-Token': csrfToken || '' // ✅ FIX #8: Include CSRF token for request validation
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
          console.log('✅ Payment Response:', razorpayResponse);

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
              console.error('❌ Payment verification failed:', verifyResult);
              alert('❌ Payment verification failed. Please contact support with Payment ID: ' + razorpayResponse.razorpay_payment_id);
              setIsPaymentLoading(false);
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

            // ✅ P1 FIX: Show email failure warning if needed
            const hasEmailIssue = invoiceResult.message.includes('⚠️') || invoiceResult.message.includes('❌');

            // ✅ P2 FIX: Log detailed status for debugging
            if (invoiceResult.emailStatus || invoiceResult.databaseSaved !== undefined) {
              console.log('📊 Invoice generation detailed status:', {
                databaseSaved: invoiceResult.databaseSaved,
                emailStatus: invoiceResult.emailStatus,
                invoiceId: invoiceResult.invoiceId
              });
            }

            if (hasEmailIssue) {
              // Show warning but still navigate to confirmation
              console.warn('⚠️ Email notification issue:', invoiceResult.message);
              alert(`Payment successful! However:\n\n${invoiceResult.message}\n\nYou'll be redirected to your confirmation page.`);
            }

            // ✅ P0 FIX: Navigate to confirmation page
            // Build URL with payment details
            const confirmationUrl = new URLSearchParams({
              invoiceId: invoiceResult.invoiceId || 'N/A',
              paymentId: razorpayResponse.razorpay_payment_id,
              service: selectedService.name,
              name: customerDetails.name,
              email: customerDetails.email,
              deposit: selectedService.depositAmount!.toString(),
              total: totalAmount.toString(),
              emailStatus: hasEmailIssue ? 'warning' : 'success'
            });

            // Reset customer details before navigation
            setCustomerDetails({
              name: '',
              email: '',
              phone: '',
              projectDetails: ''
            });

            // Navigate to confirmation page
            navigate(`/payment-confirmation?${confirmationUrl.toString()}`);
          } catch (error) {
            console.error('❌ Payment processing error:', error);
            alert(`⚠️ Payment received but verification failed.\n\nPayment ID: ${razorpayResponse.razorpay_payment_id}\n\nPlease contact support to confirm your booking.`);
          } finally {
            setIsPaymentLoading(false);
          }
        },
        prefill: {
          name: customerDetails.name || '',
          email: customerDetails.email || '',
          // ✅✅✅ THIS IS THE MAIN FIX ✅✅✅
          // Remove all non-digit characters from phone
          // Converts: "+91 9999999999" to "9999999999"
          contact: customerDetails.phone 
            ? customerDetails.phone.replace(/[^0-9]/g, '') 
            : ''
        },
        theme: {
          color: '#0891b2'
        },
        modal: {
          ondismiss: function() {
            console.log('ℹ️ Payment modal dismissed by user');
            setIsPaymentLoading(false);
            // ✅ P0 FIX: Reopen modal WITHOUT clearing customerDetails
            // User can retry payment with their data still filled in
            setShowBookingModal(true);
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      console.log('📤 Razorpay options being sent:', {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id,
        prefill: {
          name: options.prefill.name,
          email: options.prefill.email,
          contact: options.prefill.contact
        }
      });

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed:', response);
        const errorMessage = getRazorpayErrorMessage(response);
        alert(errorMessage + '\n\nNeed help? Contact us at:\nsudharsanofficial0001@gmail.com');
        setIsPaymentLoading(false);
        // ✅ P0 FIX: Reopen modal WITHOUT clearing customerDetails
        // User can retry payment with their data still filled in
        setShowBookingModal(true);
      });
      razorpay.open();
      setIsPaymentLoading(false);
    } catch (error) {
      console.error('❌ Payment error:', error);
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

  // ✅ PayPal Payment Handler (Global)
  const processPayPalPayment = async () => {
    if (!selectedService || !selectedService.depositAmount) return;

    try {
      // Check PayPal env vars
      if (!env.PAYPAL_CLIENT_ID || env.PAYPAL_CLIENT_ID === '') {
        console.error('❌ PayPal not configured');
        alert('⚠️ Payment system is not configured yet.\n\nPlease contact us directly via email:\nsudharsanofficial0001@gmail.com');
        setIsPaymentLoading(false);
        return;
      }

      const totalAmount = selectedService.totalAmount || selectedService.depositAmount;

      // Create PayPal order via Supabase Edge Function
      const createOrderUrl = `${env.SUPABASE_URL}/functions/v1/create-paypal-order`;
      const csrfToken = sessionStorage.getItem('csrf_token');

      const response = await fetch(createOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          amount: selectedService.depositAmount,
          currency: 'USD',
          description: `Deposit for ${selectedService.name}`,
          service_name: selectedService.name,
          service_price: selectedService.price,
          total_amount: totalAmount,
          deposit_amount: selectedService.depositAmount,
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const order = await response.json();
const orderId = order.id;

      // Render PayPal buttons
if (!window.paypal) {
  throw new Error('PayPal SDK not loaded');
}

// Create a container for PayPal buttons
const paypalContainer = document.createElement('div');
paypalContainer.id = 'paypal-button-container';
document.body.appendChild(paypalContainer);

window.paypal.Buttons({
  createOrder: (data: any, actions: any) => {
    return orderId; // Return the order ID
  },
  onApprove: async (data: any, actions: any) => {
    console.log('✅ PayPal Payment Approved:', data);
    
    try {
      // Call verify-paypal-payment function instead of capture
      const verifyUrl = `${env.SUPABASE_URL}/functions/v1/verify-paypal-payment`;

      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          order_id: data.orderID,
          customer_email: customerDetails.email,
          amount: selectedService.depositAmount,
          service_name: selectedService.name
        })
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        console.error('❌ Payment verification failed:', verifyResult);
        alert('❌ Payment verification failed. Please contact support.');
        setIsPaymentLoading(false);
        paypalContainer.remove();
        return;
      }

      console.log('✅ Payment verified successfully');

      // Generate invoice and send emails
      const invoiceResult = await generateAndSendInvoice({
        name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        service: selectedService.name,
        amount: totalAmount,
        depositAmount: selectedService.depositAmount!,
        timeline: selectedService.timeline,
        projectDetails: customerDetails.projectDetails,
        razorpayPaymentId: data.orderID,
        razorpayOrderId: data.orderID,
        razorpaySignature: ''
      });

      const hasEmailIssue = invoiceResult.message.includes('⚠️') || invoiceResult.message.includes('❌');

      if (hasEmailIssue) {
        console.warn('⚠️ Email notification issue:', invoiceResult.message);
        alert(`Payment successful! However:\n\n${invoiceResult.message}\n\nYou'll be redirected to confirmation.`);
      }

      // Navigate to confirmation
      const confirmationUrl = new URLSearchParams({
        invoiceId: invoiceResult.invoiceId || 'N/A',
        paymentId: data.orderID,
        service: selectedService.name,
        name: customerDetails.name,
        email: customerDetails.email,
        deposit: selectedService.depositAmount!.toString(),
        total: totalAmount.toString(),
        emailStatus: hasEmailIssue ? 'warning' : 'success'
      });

      setCustomerDetails({
        name: '',
        email: '',
        phone: '',
        projectDetails: ''
      });

      paypalContainer.remove();
      navigate(`/payment-confirmation?${confirmationUrl.toString()}`);
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('❌ Payment error. Please contact support.');
      paypalContainer.remove();
    } finally {
      setIsPaymentLoading(false);
    }
  },
  onError: (err: any) => {
    console.error('❌ PayPal error:', err);
    alert('❌ Payment failed. Please try again.');
    setIsPaymentLoading(false);
    setShowBookingModal(true);
    paypalContainer.remove();
  },
  onCancel: () => {
    console.log('ℹ️ Payment cancelled');
    setIsPaymentLoading(false);
    setShowBookingModal(true);
    paypalContainer.remove();
  }
}).render('#paypal-button-container')
} catch (error) {
      console.error('❌ PayPal payment error:', error);
      alert('❌ Payment system error. Please try again or contact us at:\nsudharsanofficial0001@gmail.com');
      setIsPaymentLoading(false);
    }
  };

  // ✅ Render PayPal Buttons in Modal (Global Region Only)
  // ✅ CRITICAL FIX: Removed customerDetails from dependency array to prevent re-rendering on every keystroke
  useEffect(() => {
    if (showBookingModal && payment.gateway === 'paypal' && paypalLoaded && window.paypal && selectedService) {
      const container = document.getElementById('paypal-button-container-modal');
      if (!container) return;

      // Clear existing buttons
      container.innerHTML = '';

      const totalAmount = selectedService.totalAmount || selectedService.depositAmount;

      // Render PayPal buttons with proper styling
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',    // ✅ Changed from 'blue' to 'gold' for proper PayPal branding
          shape: 'rect',
          label: 'paypal',  // Shows PayPal logo with text
          height: 45,
          tagline: false    // Remove "The safer, easier way to pay" tagline
        },
        createOrder: async () => {
          try {
            // ✅ FIX: Validate fields using current DOM values (not stale state)
            const nameInput = document.getElementById('modal-name') as HTMLInputElement;
            const emailInput = document.getElementById('modal-email') as HTMLInputElement;
            const detailsInput = document.getElementById('modal-details') as HTMLTextAreaElement;

            const currentName = nameInput?.value || '';
            const currentEmail = emailInput?.value || '';
            const currentDetails = detailsInput?.value || '';

            if (!currentName.trim() || !currentEmail.trim() || !currentDetails.trim()) {
              alert('❌ Please fill in all required fields (Name, Email, and Project Details) before proceeding with payment.');
              throw new Error('Please fill in all required fields');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(currentEmail)) {
              alert('❌ Please enter a valid email address.');
              throw new Error('Invalid email format');
            }

            const createOrderUrl = `${env.SUPABASE_URL}/functions/v1/create-paypal-order`;
            const csrfToken = sessionStorage.getItem('csrf_token');

            console.log('📤 Creating PayPal order with:', {
              amount: selectedService.depositAmount,
              service_name: selectedService.name,
              customer_email: currentEmail
            });

            const response = await fetch(createOrderUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
                'X-CSRF-Token': csrfToken || ''
              },
              body: JSON.stringify({
                amount: selectedService.depositAmount,
                service_name: selectedService.name,
                customer_name: currentName,
                customer_email: currentEmail,
                customer_details: currentDetails
              })
            });

            // ✅ CRITICAL FIX: Check response status before parsing
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ PayPal order creation failed:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
              });
              alert(`❌ Failed to create payment order (${response.status}). Please try again or contact support.`);
              throw new Error(`Failed to create order: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('📥 PayPal order response:', data);

            // ✅ CRITICAL FIX: Validate response structure
            if (!data || !data.id) {
              console.error('❌ Invalid order response - missing order ID:', data);
              alert('❌ Invalid payment response. Please try again or contact support.');
              throw new Error('Invalid order response: missing order ID');
            }

            console.log('✅ PayPal order created successfully:', data.id);
            return data.id;
          } catch (error) {
            console.error('❌ Order creation error:', error);
            // Re-throw to let PayPal SDK handle it
            throw error;
          }
        },
        onApprove: async (data: any) => {
          console.log('✅ PayPal Payment Approved:', data.orderID);
          setIsPaymentLoading(true);
          setShowBookingModal(false);

          try {
            // Get current form values
            const nameInput = document.getElementById('modal-name') as HTMLInputElement;
            const emailInput = document.getElementById('modal-email') as HTMLInputElement;
            const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement;
            const detailsInput = document.getElementById('modal-details') as HTMLTextAreaElement;

            const currentName = nameInput?.value || '';
            const currentEmail = emailInput?.value || '';
            const currentPhone = phoneInput?.value || '';
            const currentDetails = detailsInput?.value || '';

            // Capture payment
            const captureUrl = `${env.SUPABASE_URL}/functions/v1/capture-paypal-payment`;
            const captureResponse = await fetch(captureUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                orderId: data.orderID,
                customer_email: currentEmail,
                amount: selectedService.depositAmount,
                service_name: selectedService.name
              })
            });

            const captureResult = await captureResponse.json();

            if (!captureResult.success) {
              throw new Error('Payment capture failed');
            }

            console.log('✅ Payment captured');

            // Generate invoice
            const invoiceResult = await generateAndSendInvoice({
              name: currentName,
              email: currentEmail,
              phone: currentPhone,
              service: selectedService.name,
              amount: totalAmount!,
              depositAmount: selectedService.depositAmount!,
              timeline: selectedService.timeline,
              projectDetails: currentDetails,
              razorpayPaymentId: data.orderID,
              razorpayOrderId: data.orderID,
              razorpaySignature: ''
            });

            // Navigate to confirmation
            const confirmationUrl = new URLSearchParams({
              invoiceId: invoiceResult.invoiceId || 'N/A',
              paymentId: data.orderID,
              service: selectedService.name,
              name: currentName,
              email: currentEmail,
              deposit: selectedService.depositAmount!.toString(),
              total: totalAmount!.toString(),
              emailStatus: 'success'
            });

            setCustomerDetails({ name: '', email: '', phone: '', projectDetails: '' });
            navigate(`/payment-confirmation?${confirmationUrl.toString()}`);
          } catch (error) {
            console.error('❌ Payment error:', error);
            alert('❌ Payment processing failed. Please contact support with Order ID: ' + data.orderID);
            setShowBookingModal(true);
          } finally {
            setIsPaymentLoading(false);
          }
        },
        onError: (err: any) => {
          console.error('❌ PayPal error:', err);
          alert('❌ Payment failed. Please try again.');
        },
        onCancel: () => {
          console.log('ℹ️ Payment cancelled');
        }
      }).render('#paypal-button-container-modal');
    }
  }, [showBookingModal, payment.gateway, paypalLoaded, selectedService, navigate]); // ✅ Removed customerDetails from deps

  // ✅ Main Payment Handler - Routes to correct payment gateway
  const handlePaymentProceed = async () => {
    if (!selectedService || !selectedService.depositAmount) return;

    // Validate customer details
    const errors: typeof validationErrors = {};

    if (!customerDetails.name.trim()) {
      errors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(customerDetails.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (customerDetails.phone && customerDetails.phone.trim() && !validatePhone(customerDetails.phone)) {
      errors.phone = 'Please enter a valid phone number (8-15 digits, no leading zero)';
    }

    if (!customerDetails.projectDetails.trim()) {
      errors.projectDetails = 'Project details are required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`modal-${firstErrorField === 'projectDetails' ? 'details' : firstErrorField}`);
      errorElement?.focus();
      return;
    }

    setValidationErrors({});
    setIsPaymentLoading(true);

    // Wait for payment gateway to load
    const isRazorpay = payment.gateway === 'razorpay';
    const isPayPal = payment.gateway === 'paypal';

    if (isRazorpay && (!razorpayLoaded || !window.Razorpay)) {
      let retries = 0;
      const maxRetries = 30;

      while (retries < maxRetries) {
        if (window.Razorpay && razorpayLoaded) break;
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      if (!window.Razorpay || !razorpayLoaded) {
        setIsPaymentLoading(false);
        alert('⚠️ Payment system failed to load. Please refresh the page and try again.\n\nIf the issue persists, contact us at:\nsudharsanofficial0001@gmail.com');
        return;
      }
    }

    if (isPayPal && (!paypalLoaded || !window.paypal)) {
      let retries = 0;
      const maxRetries = 30;

      while (retries < maxRetries) {
        if (window.paypal && paypalLoaded) break;
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      if (!window.paypal || !paypalLoaded) {
        setIsPaymentLoading(false);
        alert('⚠️ Payment system failed to load. Please refresh the page and try again.\n\nIf the issue persists, contact us at:\nsudharsanofficial0001@gmail.com');
        return;
      }
    }

    // Close modal before payment
    setShowBookingModal(false);

    // Route to correct payment handler
    if (isRazorpay) {
      await processRazorpayPayment();
    } else if (isPayPal) {
      await processPayPalPayment();
    } else {
      console.error('❌ Unknown payment gateway:', payment.gateway);
      alert('⚠️ Payment system configuration error. Please contact support.');
      setIsPaymentLoading(false);
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

              {/* CTA Button - ✅ P1 FIX: Hide payment buttons when system is disabled */}
              {service.ctaAction === 'book' && !features.hasPayment ? (
                // Payment system disabled - show contact button instead
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base text-center transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:shadow-slate-500/50"
                >
                  Contact for Quote
                </a>
              ) : (
                // Payment enabled or quote service
                <button
                  onClick={() => handleBooking(service)}
                  disabled={isPaymentLoading}
                  className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    service.ctaAction === 'book'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/50'
                      : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:shadow-slate-500/50'
                  }`}
                >
                  {isPaymentLoading
                    ? 'Loading payment...'
                    : service.ctaText}
                </button>
              )}
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
                <strong>{regionConfig.content.paymentNote}</strong>
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
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] min-h-[300px] overflow-y-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 id="modal-title" className="text-2xl font-bold mb-2">Complete Your Booking</h3>
                    <p className="text-cyan-50">{selectedService.name} - {selectedService.price}</p>
                    <p className="text-sm text-cyan-100 mt-1">
                      Deposit: {formatCurrency(selectedService.depositAmount!, regionConfig)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    aria-label="Close modal (Press Escape)"
                    title="Close (Esc)"
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
                    ref={firstInputRef}
                    type="text"
                    id="modal-name"
                    value={customerDetails.name}
                    onChange={(e) => {
                      setCustomerDetails({ ...customerDetails, name: e.target.value });
                      // Clear error when user starts typing
                      if (validationErrors.name) {
                        setValidationErrors({ ...validationErrors, name: undefined });
                      }
                    }}
                    onKeyDown={handleModalKeyDown}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.name
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-slate-300 focus:ring-cyan-500'
                    }`}
                    placeholder="John Doe"
                    required
                    aria-invalid={!!validationErrors.name}
                    aria-describedby={validationErrors.name ? 'name-error' : undefined}
                  />
                  {validationErrors.name && (
                    <p id="name-error" className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {validationErrors.name}
                    </p>
                  )}
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
                    onChange={(e) => {
                      setCustomerDetails({ ...customerDetails, email: e.target.value });
                      // Clear error when user starts typing
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: undefined });
                      }
                    }}
                    onKeyDown={handleModalKeyDown}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.email
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-slate-300 focus:ring-cyan-500'
                    }`}
                    placeholder="john@example.com"
                    required
                    aria-invalid={!!validationErrors.email}
                    aria-describedby={validationErrors.email ? 'email-error' : undefined}
                  />
                  {validationErrors.email && (
                    <p id="email-error" className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {validationErrors.email}
                    </p>
                  )}
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
                    onChange={(value) => {
                      setCustomerDetails({ ...customerDetails, phone: value || '' });
                      // Clear error when user starts typing
                      if (validationErrors.phone) {
                        setValidationErrors({ ...validationErrors, phone: undefined });
                      }
                    }}
                    className="w-full"
                    style={{
                      '--PhoneInputCountryFlag-height': '1em',
                      '--PhoneInput-color--focus': '#06b6d4',
                    } as React.CSSProperties}
                    numberInputProps={{
                      className: `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        validationErrors.phone
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-slate-300 focus:ring-cyan-500'
                      }`,
                      'aria-invalid': !!validationErrors.phone,
                      'aria-describedby': validationErrors.phone ? 'phone-error' : undefined
                    }}
                  />
                  {validationErrors.phone && (
                    <p id="phone-error" className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {validationErrors.phone}
                    </p>
                  )}
                </div>

                {/* Project Details */}
                <div>
                  <label htmlFor="modal-details" className="block text-slate-700 font-semibold mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="modal-details"
                    value={customerDetails.projectDetails}
                    onChange={(e) => {
                      setCustomerDetails({ ...customerDetails, projectDetails: e.target.value });
                      // Clear error when user starts typing
                      if (validationErrors.projectDetails) {
                        setValidationErrors({ ...validationErrors, projectDetails: undefined });
                      }
                    }}
                    onKeyDown={(e) => {
                      // Shift+Enter: new line, Enter: proceed to payment (last field)
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePaymentProceed();
                      }
                    }}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors ${
                      validationErrors.projectDetails
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-slate-300 focus:ring-cyan-500'
                    }`}
                    placeholder="Brief description of your project requirements..."
                    required
                    aria-invalid={!!validationErrors.projectDetails}
                    aria-describedby={validationErrors.projectDetails ? 'details-error' : undefined}
                  />
                  {validationErrors.projectDetails && (
                    <p id="details-error" className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠️</span> {validationErrors.projectDetails}
                    </p>
                  )}
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
                      <span className="font-bold text-cyan-600 text-lg">
                        {formatCurrency(selectedService.depositAmount!, regionConfig)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Timeline:</span>
                      <span className="font-semibold text-slate-900">{selectedService.timeline}</span>
                    </div>
                  </div>
                </div>

                {/* Actions - Sticky at bottom for better UX */}
                <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-4 border-t border-slate-200">
                  {payment.gateway === 'razorpay' ? (
                    // India: Show Proceed to Payment button for Razorpay
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
                  ) : (
                    // Global: Show PayPal buttons inline
                    <div className="space-y-3">
                      <div id="paypal-button-container-modal" className="min-h-[45px]"></div>
                      <button
                        onClick={() => setShowBookingModal(false)}
                        className="w-full px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}