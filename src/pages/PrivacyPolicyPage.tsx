import Footer from '../components/Footer';
import { useEffect } from 'react';
import { Shield, Lock, Eye, UserCheck, Database, Mail, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-slate-300">Last Updated: December 15, 2025</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="mb-12">
              <p className="text-lg text-slate-700 leading-relaxed mb-4">
                At Sudharsan Builds, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>sudharsanbuilds.com</strong> or use our services.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                By using our website and services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Database className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">1. Information We Collect</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Personal Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Fill out contact forms on our website</li>
                <li>Make a service booking or payment</li>
                <li>Subscribe to our newsletter or blog updates</li>
                <li>Communicate with us via email or other channels</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-3 ml-9">
                The personal information we collect may include:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li><strong>Name</strong> - To identify you and personalize communications</li>
                <li><strong>Email Address</strong> - To send confirmations, invoices, and project updates</li>
                <li><strong>Phone Number</strong> - For direct communication regarding your project (optional)</li>
                <li><strong>Project Details</strong> - Information about your requirements and specifications</li>
                <li><strong>Payment Information</strong> - Processed securely through Razorpay (India) or PayPal (Global)</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Automatically Collected Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                When you visit our website, we automatically collect certain information about your device and browsing activity:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-9">
                <li><strong>Usage Data</strong> - Pages visited, time spent, links clicked</li>
                <li><strong>Device Information</strong> - Browser type, operating system, IP address</li>
                <li><strong>Cookies and Tracking</strong> - We use cookies to enhance user experience and analyze site traffic</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">2. How We Use Your Information</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-9">
                <li><strong>Service Delivery</strong> - To provide, operate, and maintain our web development services</li>
                <li><strong>Communication</strong> - To send project updates, invoices, and respond to inquiries</li>
                <li><strong>Payment Processing</strong> - To process deposits and payments securely through our payment partners</li>
                <li><strong>Customer Support</strong> - To address technical issues and provide assistance</li>
                <li><strong>Website Improvement</strong> - To analyze usage patterns and enhance user experience</li>
                <li><strong>Marketing</strong> - To send promotional emails about new services (you can opt-out anytime)</li>
                <li><strong>Legal Compliance</strong> - To comply with applicable laws and regulations</li>
                <li><strong>Fraud Prevention</strong> - To detect and prevent fraudulent transactions and security breaches</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">3. How We Protect Your Information</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-9">
                <li><strong>SSL/TLS Encryption</strong> - All data transmitted between your browser and our servers is encrypted</li>
                <li><strong>Secure Payment Gateways</strong> - We use Razorpay and PayPal, which are PCI-DSS compliant</li>
                <li><strong>Data Storage</strong> - Personal data is stored securely on Supabase with encryption at rest</li>
                <li><strong>Access Control</strong> - Only authorized personnel have access to personal information</li>
                <li><strong>Regular Security Audits</strong> - We conduct periodic reviews of our security practices</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4 ml-9">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">4. Information Sharing and Disclosure</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Service Providers</h3>
              <p className="text-slate-700 leading-relaxed mb-3 ml-9">
                We work with trusted third-party service providers to operate our business:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li><strong>Razorpay (India)</strong> - Payment processing for Indian customers</li>
                <li><strong>PayPal (Global)</strong> - Payment processing for international customers</li>
                <li><strong>EmailJS</strong> - Email delivery service for notifications and confirmations</li>
                <li><strong>Supabase</strong> - Database and backend infrastructure</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Legal Requirements</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We may disclose your information if required by law or in response to valid legal requests from public authorities.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Business Transfers</h3>
              <p className="text-slate-700 leading-relaxed ml-9">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">5. Your Rights and Choices</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-9">
                <li><strong>Access</strong> - Request a copy of the personal data we hold about you</li>
                <li><strong>Correction</strong> - Request corrections to inaccurate or incomplete information</li>
                <li><strong>Deletion</strong> - Request deletion of your personal data (subject to legal obligations)</li>
                <li><strong>Opt-Out</strong> - Unsubscribe from marketing emails via the link in any promotional email</li>
                <li><strong>Data Portability</strong> - Request your data in a structured, machine-readable format</li>
                <li><strong>Objection</strong> - Object to processing of your data for certain purposes</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4 ml-9">
                To exercise any of these rights, please contact us at <a href="mailto:info@sudharsanbuilds.com" className="text-cyan-600 hover:underline font-semibold">info@sudharsanbuilds.com</a>
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Mail className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">6. Cookies and Tracking Technologies</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We use cookies and similar tracking technologies to enhance your browsing experience:
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Essential Cookies</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Required for the website to function properly (e.g., session management, security tokens)
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Analytics Cookies</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Help us understand how visitors interact with our website to improve user experience
              </p>

              <p className="text-slate-700 leading-relaxed ml-9">
                You can control cookies through your browser settings. However, disabling cookies may affect website functionality.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">7. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">8. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Sudharsan Builds operates from India and serves clients globally. Your information may be transferred to and processed in India or other countries where our service providers operate.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We ensure appropriate safeguards are in place to protect your personal information in accordance with this Privacy Policy.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">9. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Provide our services and fulfill transactions</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records for tax and accounting purposes</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Typically, we retain customer data for 7 years from the last transaction for accounting and legal compliance purposes.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Posting the updated policy on this page with a new "Last Updated" date</li>
                <li>Sending an email notification to registered users (for significant changes)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Your continued use of our services after changes are posted constitutes acceptance of the updated Privacy Policy.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">11. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-slate-900 font-bold mb-3">Sudharsan Builds</p>
                <div className="space-y-2 text-slate-700">
                  <p><strong>Email:</strong> <a href="mailto:info@sudharsanbuilds.com" className="text-cyan-600 hover:underline">info@sudharsanbuilds.com</a></p>
                  <p><strong>Website:</strong> <a href="https://sudharsanbuilds.com" className="text-cyan-600 hover:underline">sudharsanbuilds.com</a></p>
                  <p><strong>Location:</strong> Remote Work - Serving Clients Across India</p>
                  <p className="text-sm text-slate-600 mt-4">
                    We aim to respond to all privacy-related inquiries within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Acknowledgment */}
            <div className="bg-cyan-50 border-l-4 border-cyan-600 p-6 rounded-lg">
              <p className="text-slate-700 leading-relaxed">
                <strong>Acknowledgment:</strong> By using Sudharsan Builds' website and services, you acknowledge that you have read and understood this Privacy Policy and agree to be bound by its terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
