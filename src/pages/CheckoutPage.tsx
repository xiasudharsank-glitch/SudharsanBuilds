import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useRegion, formatCurrency } from '../utils/region';
import { env } from '../utils/env';

// Payment gateway scripts
declare global {
  interface Window {
    Razorpay: any;
    paypal: any;
  }
}

interface Service {
  name: string;
  price: string;
  totalAmount: number;
  depositAmount: number;
  timeline: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedService = location.state as Service | null;

  const { regionConfig, payment, currency } = useRegion();

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Payment Successful!');

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    projectDetails: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    projectDetails?: string;
  }>({});

  // ❌ NO AUTO-FOCUS - User requested this specifically
  // const firstInputRef = useRef<HTMLInputElement>(null);

  // Redirect if no service data
  useEffect(() => {
    if (!selectedService) {
      navigate('/services');
    }
  }, [selectedService, navigate]);

  // CSRF token generation
  useEffect(() => {
    if (!sessionStorage.getItem('csrf_token')) {
      const csrfToken = crypto.randomUUID();
      sessionStorage.setItem('csrf_token', csrfToken);
    }
  }, []);

  // Load Razorpay for India region
  useEffect(() => {
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
  }, [payment.gateway, razorpayLoaded]);

  // Load PayPal for Global region
  useEffect(() => {
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
  }, [payment.gateway, paypalLoaded]);

  // Render PayPal buttons
  useEffect(() => {
    if (payment.gateway !== 'paypal' || !paypalLoaded || !window.paypal || !selectedService) return;

    const paypalContainer = document.getElementById('paypal-button-container-page');
    if (!paypalContainer) return;

    paypalContainer.innerHTML = '';

    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        // Validate before creating order
        const errors: typeof validationErrors = {};
        if (!customerDetails.name.trim()) errors.name = 'Name is required';
        if (!customerDetails.email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) errors.email = 'Invalid email';
        if (!customerDetails.projectDetails.trim()) errors.projectDetails = 'Project details required';

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return Promise.reject('Validation failed');
        }

        return actions.order.create({
          purchase_units: [{
            amount: {
              value: (selectedService.depositAmount / currency.exchangeRate).toFixed(2),
              currency_code: currency.code
            },
            description: `Deposit for ${selectedService.name}`,
            custom_id: `${customerDetails.name}|${customerDetails.email}|${customerDetails.phone}|${selectedService.name}`,
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        return actions.order.capture().then(async (details: any) => {
          console.log('✅ PayPal Payment captured:', details);
          await showSuccessAndRedirect(`/payment-confirmation?status=success&gateway=paypal&id=${details.id}&service=${encodeURIComponent(selectedService.name)}&amount=${selectedService.depositAmount}`);
        });
      },
      onError: (err: any) => {
        console.error('❌ PayPal Error:', err);
        alert('Payment failed. Please try again or contact support.');
      },
      onCancel: () => {
        console.log('ℹ️ Payment cancelled');
      }
    }).render('#paypal-button-container-page');
  }, [payment.gateway, paypalLoaded, selectedService, customerDetails, currency]);

  // Phone validation
  const validatePhone = (phone: string): boolean => {
    try {
      return isValidPhoneNumber(phone);
    } catch {
      return false;
    }
  };

  // Razorpay error messages
  const getRazorpayErrorMessage = (error: any): string => {
    const errorCode = error?.error?.code;
    const errorDescription = error?.error?.description;
    const errorReason = error?.error?.reason;

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
        return errorDescription || '❌ Payment failed. Please contact us directly via email.';
    }
  };

  // Razorpay payment processing
  const processRazorpayPayment = async () => {
    if (!selectedService || !selectedService.depositAmount) return;

    try {
      if (!env.SUPABASE_URL || !env.SUPABASE_URL.startsWith('http') || !env.SUPABASE_ANON_KEY || !env.RAZORPAY_KEY_ID) {
        alert('⚠️ Payment system is not configured yet.\n\nPlease contact us directly via email:\ncontact@sudharsanbuilds.com');
        setIsPaymentLoading(false);
        return;
      }

      const totalAmount = selectedService.totalAmount || selectedService.depositAmount;
      const createOrderUrl = `${env.SUPABASE_URL}/functions/v1/create-payment-order`;
      const csrfToken = sessionStorage.getItem('csrf_token');

      const response = await fetch(createOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({
          amount: selectedService.depositAmount * 100,
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

      const options = {
        key: env.RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Sudharsan Builds',
        description: `Deposit for ${selectedService.name}`,
        order_id: orderId,
        handler: async function (razorpayResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          console.log('✅ Payment Response:', razorpayResponse);
          await showSuccessAndRedirect(`/payment-confirmation?status=success&gateway=razorpay&id=${razorpayResponse.razorpay_payment_id}&service=${encodeURIComponent(selectedService.name)}&amount=${selectedService.depositAmount}`);
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        theme: {
          color: '#06b6d4'
        },
        modal: {
          ondismiss: function () {
            setIsPaymentLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        const errorMessage = getRazorpayErrorMessage(response);
        alert(errorMessage);
        setIsPaymentLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsPaymentLoading(false);
    }
  };

  // Success overlay and redirect
  const showSuccessAndRedirect = async (confirmationUrl: string) => {
    setShowSuccessOverlay(true);
    setSuccessMessage('✓ Payment Successful!');

    await new Promise(resolve => setTimeout(resolve, 800));
    setSuccessMessage('Generating invoice...');

    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccessMessage('Sending confirmation email...');

    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccessMessage('Redirecting...');

    await new Promise(resolve => setTimeout(resolve, 500));
    navigate(confirmationUrl);
  };

  // Main payment handler
  const handlePaymentProceed = async () => {
    if (!selectedService || !selectedService.depositAmount) return;

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

    const phoneDigitsOnly = customerDetails.phone?.replace(/\D/g, '') || '';
    if (customerDetails.phone && phoneDigitsOnly.length >= 6 && !validatePhone(customerDetails.phone)) {
      errors.phone = 'Please enter a valid phone number (8-15 digits, no leading zero)';
    }

    if (!customerDetails.projectDetails.trim()) {
      errors.projectDetails = 'Project details are required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(`checkout-${firstErrorField === 'projectDetails' ? 'details' : firstErrorField}`);
      errorElement?.focus();
      return;
    }

    setValidationErrors({});

    // For PayPal, validation happens in createOrder callback
    if (payment.gateway === 'paypal') {
      return;
    }

    // Razorpay flow
    setIsPaymentLoading(true);

    if (!razorpayLoaded || !window.Razorpay) {
      let retries = 0;
      const maxRetries = 30;

      while (retries < maxRetries) {
        if (window.Razorpay && razorpayLoaded) break;
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      if (!window.Razorpay || !razorpayLoaded) {
        setIsPaymentLoading(false);
        alert('⚠️ Payment system failed to load. Please refresh the page and try again.');
        return;
      }
    }

    await processRazorpayPayment();
  };

  if (!selectedService) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/services')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services
        </button>

        {/* Checkout Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Complete Your Booking</h1>
            <p className="text-cyan-50">{selectedService.name} - {selectedService.price}</p>
            <p className="text-sm text-cyan-100 mt-1">
              Deposit: {formatCurrency(selectedService.depositAmount, regionConfig)}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <p className="text-slate-600 text-sm">
              Please provide your details to complete the booking. You'll receive a confirmation email and invoice after payment.
            </p>

            {/* Name */}
            <div>
              <label htmlFor="checkout-name" className="block text-slate-700 font-semibold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="checkout-name"
                value={customerDetails.name}
                onChange={(e) => {
                  setCustomerDetails({ ...customerDetails, name: e.target.value });
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: undefined });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.name
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-slate-300 focus:ring-cyan-500'
                }`}
                placeholder="John Doe"
                required
              />
              {validationErrors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="checkout-email" className="block text-slate-700 font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="checkout-email"
                value={customerDetails.email}
                onChange={(e) => {
                  setCustomerDetails({ ...customerDetails, email: e.target.value });
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: undefined });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.email
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-slate-300 focus:ring-cyan-500'
                }`}
                placeholder="john@example.com"
                required
              />
              {validationErrors.email && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="checkout-phone" className="block text-slate-700 font-semibold mb-2">
                Phone Number (Optional)
              </label>
              <PhoneInput
                international
                defaultCountry={regionConfig.region === 'india' ? 'IN' : 'US'}
                value={customerDetails.phone}
                onChange={(value) => {
                  setCustomerDetails({ ...customerDetails, phone: value || '' });
                  if (validationErrors.phone) {
                    setValidationErrors({ ...validationErrors, phone: undefined });
                  }
                }}
                numberInputProps={{
                  className: `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    validationErrors.phone
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-slate-300 focus:ring-cyan-500'
                  }`
                }}
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Project Details */}
            <div>
              <label htmlFor="checkout-details" className="block text-slate-700 font-semibold mb-2">
                Project Details *
              </label>
              <textarea
                id="checkout-details"
                value={customerDetails.projectDetails}
                onChange={(e) => {
                  setCustomerDetails({ ...customerDetails, projectDetails: e.target.value });
                  if (validationErrors.projectDetails) {
                    setValidationErrors({ ...validationErrors, projectDetails: undefined });
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
              />
              {validationErrors.projectDetails && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
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
                    {formatCurrency(selectedService.depositAmount, regionConfig)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Timeline:</span>
                  <span className="font-semibold text-slate-900">{selectedService.timeline}</span>
                </div>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="pt-4 border-t border-slate-200">
              {payment.gateway === 'razorpay' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/services')}
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
                <div className="space-y-3">
                  <div id="paypal-button-container-page" className="min-h-[45px]"></div>
                  <p className="text-xs text-center text-slate-500">
                    💡 Complete the form above, then click PayPal to proceed
                  </p>
                  <button
                    onClick={() => navigate('/services')}
                    className="w-full px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </motion.div>

              <motion.h2
                key={successMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold text-slate-900 mb-4"
              >
                {successMessage}
              </motion.h2>

              {(successMessage.includes('Generating') || successMessage.includes('Sending') || successMessage.includes('Redirecting')) && (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
