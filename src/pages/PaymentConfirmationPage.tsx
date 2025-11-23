import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Phone, Download, Home, MessageCircle } from 'lucide-react';
import { env } from '../utils/env';
import { getActiveRegion } from '../config/regions'; // ✅ ADDED: Dynamic currency support

export default function PaymentConfirmationPage() {
  const [searchParams] = useSearchParams();

  // ✅ Get region-specific currency configuration
  const regionConfig = getActiveRegion();
  const currency = regionConfig.currency;

  // Extract payment details from URL params
  const invoiceId = searchParams.get('invoiceId') || 'N/A';
  const paymentId = searchParams.get('paymentId') || 'N/A';
  const serviceName = searchParams.get('service') || 'Service';
  const customerName = searchParams.get('name') || 'Valued Customer';
  const customerEmail = searchParams.get('email') || '';
  const depositAmount = searchParams.get('deposit') || '0';
  const totalAmount = searchParams.get('total') || '0';
  const emailStatus = searchParams.get('emailStatus') || 'success';

  // WhatsApp contact link
  const whatsappNumber = env.WHATSAPP_NUMBER || '919876543210';
  const whatsappMessage = encodeURIComponent(
    `Hi! I just completed payment for ${serviceName}. Invoice ID: ${invoiceId}, Payment ID: ${paymentId}`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Email contact
  const yourEmail = env.YOUR_EMAIL || 'sudharsanofficial0001@gmail.com';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <CheckCircle className="w-20 h-20 mx-auto" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-green-100 text-lg">
              Thank you, {customerName}! Your booking is confirmed.
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8 space-y-6">
            {/* Order Summary */}
            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Invoice ID:</span>
                  <span className="font-mono font-semibold text-slate-900">{invoiceId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Payment ID:</span>
                  <span className="font-mono font-semibold text-slate-900 break-all">{paymentId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Service:</span>
                  <span className="font-semibold text-slate-900">{serviceName}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-slate-600">Total Amount:</span>
                  <span className="font-semibold text-slate-900">{currency.symbol}{parseInt(totalAmount).toLocaleString(currency.locale)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Deposit Paid:</span>
                  <span className="font-bold text-green-600 text-lg">{currency.symbol}{parseInt(depositAmount).toLocaleString(currency.locale)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Remaining Balance:</span>
                  <span className="font-semibold text-slate-900">{currency.symbol}{(parseInt(totalAmount) - parseInt(depositAmount)).toLocaleString(currency.locale)}</span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-cyan-50 rounded-xl p-6 border-2 border-cyan-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">What Happens Next?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Email Confirmation</p>
                    <p className="text-sm text-slate-600">
                      You'll receive booking confirmation and invoice at <span className="font-mono">{customerEmail}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Project Kickoff</p>
                    <p className="text-sm text-slate-600">
                      I'll contact you within 24 hours to discuss project requirements and timeline
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Development Begins</p>
                    <p className="text-sm text-slate-600">
                      Once requirements are finalized, I'll start building your project
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Need Help or Have Questions?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                >
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-slate-900">WhatsApp</p>
                    <p className="text-xs text-slate-600">Message me directly</p>
                  </div>
                </a>
                <a
                  href={`mailto:${yourEmail}?subject=Booking Inquiry - ${invoiceId}`}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-xs text-slate-600 truncate">{yourEmail}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Email Status Warning */}
            {emailStatus === 'warning' && (
              <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500 mb-4">
                <p className="text-sm text-red-900">
                  <strong>⚠️ Email Notification Issue:</strong> Some confirmation emails may not have been delivered.
                  Please contact me immediately via WhatsApp or email to ensure you receive your invoice and booking details.
                </p>
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-500">
              <p className="text-sm text-amber-900">
                <strong>Important:</strong> Please check your email inbox (and spam folder) for booking confirmation and invoice.
                If you don't receive it within 15 minutes, please contact me via WhatsApp or email.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Return to Homepage
                </motion.button>
              </Link>
              <Link to="/services" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  View More Services
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-600 text-sm mt-6"
        >
          Thank you for choosing my services! Looking forward to working on your project.
        </motion.p>
      </div>
    </div>
  );
}
