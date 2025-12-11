import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Mail, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

// Payment gateway scripts
declare global {
  interface Window {
    Razorpay: any;
    paypal: any;
  }
}

interface CheckoutData {
  serviceName: string;
  totalAmount: number;
  depositAmount: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state as CheckoutData | null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [payment, setPayment] = useState({
    gateway: 'razorpay' as 'razorpay' | 'paypal',
    processing: false
  });

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Redirect if no checkout data
  useEffect(() => {
    if (!checkoutData) {
      navigate('/services');
    }
  }, [checkoutData, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Load PayPal script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD';
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize PayPal buttons when loaded and payment method is PayPal
  useEffect(() => {
    if (!paypalLoaded || payment.gateway !== 'paypal' || !checkoutData) return;

    const paypalContainer = document.getElementById('paypal-button-container');
    if (!paypalContainer) return;

    paypalContainer.innerHTML = '';

    window.paypal?.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: (checkoutData.depositAmount / 100).toFixed(2),
              currency_code: 'USD'
            }
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          navigate('/payment-confirmation', {
            state: {
              success: true,
              service: checkoutData.serviceName,
              amount: checkoutData.depositAmount,
              gateway: 'PayPal',
              paymentId: details.id,
              customerName: formData.name,
              customerEmail: formData.email
            }
          });
        });
      },
      onError: (err: any) => {
        console.error('PayPal Error:', err);
        alert('Payment failed. Please try again.');
      }
    }).render('#paypal-button-container');
  }, [paypalLoaded, payment.gateway, checkoutData, formData, navigate]);

  const handleRazorpayPayment = () => {
    if (!razorpayLoaded || !checkoutData) return;

    setPayment({ ...payment, processing: true });

    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID',
      amount: checkoutData.depositAmount,
      currency: 'INR',
      name: 'Sudharsan Builds',
      description: `Deposit for ${checkoutData.serviceName}`,
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: '#06b6d4'
      },
      handler: function (response: any) {
        navigate('/payment-confirmation', {
          state: {
            success: true,
            service: checkoutData.serviceName,
            amount: checkoutData.depositAmount,
            gateway: 'Razorpay',
            paymentId: response.razorpay_payment_id,
            customerName: formData.name,
            customerEmail: formData.email
          }
        });
      },
      modal: {
        ondismiss: function () {
          setPayment({ ...payment, processing: false });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (payment.gateway === 'razorpay') {
      handleRazorpayPayment();
    }
    // PayPal is handled by the button itself
  };

  if (!checkoutData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Customer Information Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Project Details (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition resize-none"
                    placeholder="Tell us about your project requirements..."
                  />
                </div>
              </div>
            </form>
          </motion.div>

          {/* Right: Payment & Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
                <div className="flex justify-between text-slate-300">
                  <span>Service</span>
                  <span className="font-semibold text-white">{checkoutData.serviceName}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Amount</span>
                  <span className="font-semibold">₹{checkoutData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-white">Deposit (50%)</span>
                  <span className="font-bold text-cyan-400">₹{checkoutData.depositAmount.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-slate-400 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                💡 Pay 50% now to start your project. Remaining balance due upon completion.
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, gateway: 'razorpay' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    payment.gateway === 'razorpay'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mx-auto mb-2 ${payment.gateway === 'razorpay' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <p className={`text-sm font-medium ${payment.gateway === 'razorpay' ? 'text-cyan-400' : 'text-slate-300'}`}>
                    Razorpay
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Card / UPI / Net Banking</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment({ ...payment, gateway: 'paypal' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    payment.gateway === 'paypal'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 mx-auto mb-2 ${payment.gateway === 'paypal' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <p className={`text-sm font-medium ${payment.gateway === 'paypal' ? 'text-cyan-400' : 'text-slate-300'}`}>
                    PayPal
                  </p>
                  <p className="text-xs text-slate-500 mt-1">International</p>
                </button>
              </div>

              {/* Payment Button / PayPal Container */}
              {payment.gateway === 'razorpay' ? (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={payment.processing}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {payment.processing ? 'Processing...' : `Pay ₹${checkoutData.depositAmount.toLocaleString()}`}
                </button>
              ) : (
                <div id="paypal-button-container" className="w-full"></div>
              )}

              <p className="text-xs text-slate-500 text-center mt-4">
                🔒 Secure payment. Your information is encrypted.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
