import Footer from '../components/Footer';
import { useEffect } from 'react';
import { FileText, AlertCircle, DollarSign, Clock, Shield, Gavel, RefreshCw } from 'lucide-react';

export default function TermsOfServicePage() {
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
                <FileText className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
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
                Welcome to Sudharsan Builds. These Terms and Conditions ("Terms") govern your use of our website <strong>sudharsanbuilds.com</strong> and the web development services we provide.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-4">
                By accessing our website or engaging our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our services.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                These Terms constitute a legally binding agreement between you (the "Client") and Sudharsan Builds (the "Service Provider").
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">1. Service Description</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Sudharsan Builds provides professional freelance web development services, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-9">
                <li><strong>Landing Pages</strong> - Single-page websites optimized for conversions</li>
                <li><strong>Business Websites</strong> - Multi-page professional websites for businesses</li>
                <li><strong>E-Commerce Stores</strong> - Online shopping platforms with payment integration</li>
                <li><strong>Custom Web Development</strong> - Tailored solutions using React, TypeScript, and Node.js</li>
                <li><strong>SaaS Products</strong> - Subscription-based web applications</li>
                <li><strong>SEO Optimization</strong> - Search engine optimization services</li>
                <li><strong>Website Maintenance</strong> - Ongoing support and updates</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4 ml-9">
                Specific deliverables, features, and timelines will be agreed upon in writing for each project through project proposals, contracts, or email confirmations.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">2. Pricing and Payment Terms</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Pricing Structure</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Our service packages have fixed pricing displayed on our website. Prices are subject to change, but any confirmed project will be honored at the agreed-upon price.
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>All prices are listed in Indian Rupees (₹) for Indian clients and US Dollars ($) for international clients</li>
                <li>Prices include GST/taxes where applicable</li>
                <li>Custom projects will receive a detailed quote based on requirements</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Deposit Payment</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                To initiate a project, clients must pay a non-refundable deposit:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>The deposit amount varies by service package (typically 30-50% of total project cost)</li>
                <li>Deposits are payable via Razorpay (India) or PayPal (Global)</li>
                <li>Work will commence only after deposit payment is confirmed</li>
                <li>Deposits secure your project slot and cover initial development costs</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Final Payment</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                The remaining balance is due upon project completion:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Final payment must be received before website deployment or handover</li>
                <li>An invoice will be provided upon project completion</li>
                <li>Payment is due within 7 days of invoice date</li>
                <li>Late payments may incur additional charges or project delays</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Payment Methods</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-9">
                <li><strong>India:</strong> Razorpay (UPI, Credit/Debit Cards, Net Banking)</li>
                <li><strong>Global:</strong> PayPal, International Wire Transfer</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">3. Project Timeline and Delivery</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Estimated Timelines</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Project timelines are estimates and may vary based on:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Project complexity and scope</li>
                <li>Timely provision of content, assets, and feedback from the client</li>
                <li>Number of revision rounds requested</li>
                <li>Third-party dependencies (APIs, hosting, etc.)</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Client Responsibilities</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                To ensure timely delivery, clients must:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Provide all necessary content, images, and assets within agreed deadlines</li>
                <li>Respond to queries and provide feedback within 3 business days</li>
                <li>Approve design mockups and milestones promptly</li>
                <li>Make timely payments as per the payment schedule</li>
              </ul>

              <p className="text-slate-700 leading-relaxed ml-9">
                <strong>Note:</strong> Delays caused by the client may extend the project timeline accordingly. Extended delays beyond 30 days may result in project cancellation and forfeiture of deposit.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <RefreshCw className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">4. Revisions and Changes</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Included Revisions</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Each service package includes a specific number of revision rounds:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li><strong>Landing Pages:</strong> Up to 2 rounds of revisions</li>
                <li><strong>Business Websites:</strong> Up to 3 rounds of revisions</li>
                <li><strong>E-Commerce Stores:</strong> Up to 4 rounds of revisions</li>
                <li><strong>Custom Projects:</strong> As specified in the project agreement</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Scope Changes</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Significant changes to project scope after approval may incur additional costs:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Adding new pages or features beyond original agreement</li>
                <li>Major design overhauls after initial approval</li>
                <li>Integration of additional third-party services</li>
                <li>Changes to core functionality or architecture</li>
              </ul>

              <p className="text-slate-700 leading-relaxed ml-9">
                We will provide a revised quote for any scope changes before proceeding with the work.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">5. Intellectual Property Rights</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Client Ownership</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Upon receipt of full payment, the client owns:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Custom code written specifically for the project</li>
                <li>Website design and layout created for the client</li>
                <li>Content and assets provided by or created for the client</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Service Provider Rights</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Sudharsan Builds retains rights to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Proprietary frameworks, libraries, and reusable components</li>
                <li>Development methodologies and processes</li>
                <li>Display the completed project in our portfolio (unless otherwise agreed)</li>
                <li>Use the project as a case study for marketing purposes</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Third-Party Assets</h3>
              <p className="text-slate-700 leading-relaxed ml-9">
                Any third-party libraries, frameworks, fonts, or assets used remain the property of their respective owners and are subject to their license terms.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <Gavel className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">6. Refunds and Cancellations</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Deposit Non-Refundable</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                The initial deposit payment is <strong>non-refundable</strong> as it covers:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Project planning and consultation time</li>
                <li>Initial development work and setup</li>
                <li>Reserved project slot in our schedule</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Project Cancellation by Client</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                If the client cancels the project mid-way:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>The deposit is forfeited</li>
                <li>Any work completed up to the cancellation point will be billed at our hourly rate</li>
                <li>No refund will be provided for completed work</li>
                <li>Source files and work-in-progress may be provided upon request (at additional cost)</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Refund Policy</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                Refunds may be considered only in the following exceptional circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Service provider fails to deliver the project within the agreed timeline without valid reason</li>
                <li>Delivered project significantly deviates from agreed specifications and cannot be corrected</li>
                <li>Technical issues make the project fundamentally unusable</li>
              </ul>

              <p className="text-slate-700 leading-relaxed ml-9">
                Refund requests must be submitted in writing within 14 days of project completion. Approved refunds will be processed within 30 business days.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">7. Warranties and Disclaimers</h2>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Service Warranties</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We warrant that:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Services will be performed in a professional and workmanlike manner</li>
                <li>Work will substantially conform to agreed specifications</li>
                <li>Code will be functional and free from critical bugs at the time of delivery</li>
                <li>We have the right to provide the services and deliverables</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Bug Fixes and Support</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We provide <strong>30 days of free bug fixes</strong> from the date of project delivery for:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Functionality issues that existed at delivery but were not discovered during testing</li>
                <li>Bugs introduced by our code (not client modifications or third-party services)</li>
                <li>Critical errors preventing normal website operation</li>
              </ul>

              <h3 className="text-xl font-bold text-slate-900 mb-3 ml-9">Limitations and Disclaimers</h3>
              <p className="text-slate-700 leading-relaxed mb-4 ml-9">
                We do NOT warrant:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4 ml-9">
                <li>Uninterrupted or error-free operation of third-party services and APIs</li>
                <li>Compatibility with all future browser versions or devices</li>
                <li>Specific business outcomes, traffic, or revenue results</li>
                <li>SEO rankings or search engine placement</li>
                <li>Security against all possible cyber threats</li>
              </ul>

              <p className="text-slate-700 leading-relaxed ml-9 mt-4">
                <strong>Disclaimer:</strong> Services are provided "AS IS" without any warranties beyond those explicitly stated. We disclaim all implied warranties of merchantability and fitness for a particular purpose.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">8. Limitation of Liability</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Sudharsan Builds shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>This includes loss of profits, revenue, data, or business opportunities</li>
                <li>Our total liability shall not exceed the amount paid by the client for the specific project</li>
                <li>We are not liable for damages caused by client modifications, third-party services, or force majeure events</li>
              </ul>

              <p className="text-slate-700 leading-relaxed">
                Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">9. Client Obligations and Conduct</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                Clients agree to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Own or have proper licenses for all content, images, and materials provided</li>
                <li>Not request services for illegal, fraudulent, or harmful purposes</li>
                <li>Not use delivered websites for spam, phishing, or malicious activities</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect intellectual property rights of third parties</li>
                <li>Maintain professional and respectful communication</li>
              </ul>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">10. Confidentiality</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                Both parties agree to maintain confidentiality of:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Proprietary business information shared during the project</li>
                <li>Project specifications and technical details (unless public)</li>
                <li>Login credentials and access information</li>
                <li>Trade secrets and confidential data</li>
              </ul>

              <p className="text-slate-700 leading-relaxed">
                This obligation survives project completion and termination of the agreement.
              </p>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">11. Hosting and Domain</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                Unless specifically included in the service package:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Domain registration and hosting are the client's responsibility</li>
                <li>We can provide recommendations for hosting providers</li>
                <li>We can assist with deployment setup (may incur additional charges)</li>
                <li>Ongoing hosting costs, SSL certificates, and renewals are client's responsibility</li>
              </ul>

              <p className="text-slate-700 leading-relaxed">
                We are not responsible for hosting downtime, server issues, or domain expiration.
              </p>
            </div>

            {/* Section 12 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">12. Dispute Resolution</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                In the event of a dispute:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li><strong>Good Faith Negotiation:</strong> Both parties will attempt to resolve disputes through direct communication</li>
                <li><strong>Mediation:</strong> If negotiation fails, disputes will be submitted to mediation before legal action</li>
                <li><strong>Governing Law:</strong> These Terms are governed by the laws of India</li>
                <li><strong>Jurisdiction:</strong> Courts in India shall have exclusive jurisdiction</li>
              </ul>
            </div>

            {/* Section 13 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">13. Termination</h2>

              <h3 className="text-xl font-bold text-slate-900 mb-3">Termination by Client</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Clients may terminate the project at any time with written notice. Deposit is non-refundable and completed work will be billed.
              </p>

              <h3 className="text-xl font-bold text-slate-900 mb-3">Termination by Service Provider</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to terminate a project if:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
                <li>Client fails to make required payments</li>
                <li>Client provides false or misleading information</li>
                <li>Client requests illegal or unethical work</li>
                <li>Client engages in abusive or threatening behavior</li>
                <li>Client fails to respond for more than 30 days</li>
              </ul>

              <p className="text-slate-700 leading-relaxed">
                Upon termination, client will receive any work completed up to that point, and must pay for all completed work.
              </p>
            </div>

            {/* Section 14 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">14. Force Majeure</h2>

              <p className="text-slate-700 leading-relaxed">
                Neither party shall be liable for delays or failures in performance resulting from circumstances beyond reasonable control, including but not limited to: natural disasters, war, terrorism, labor strikes, government actions, internet outages, or pandemics. Timelines will be extended reasonably to account for such delays.
              </p>
            </div>

            {/* Section 15 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">15. Changes to Terms</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Material changes will be communicated via email.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Continued use of our services after changes constitutes acceptance of the updated Terms. Existing projects in progress will be governed by the Terms in effect at the time of project commencement.
              </p>
            </div>

            {/* Section 16 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">16. Severability</h2>

              <p className="text-slate-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
              </p>
            </div>

            {/* Section 17 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">17. Entire Agreement</h2>

              <p className="text-slate-700 leading-relaxed">
                These Terms, together with any project-specific agreements, invoices, and our Privacy Policy, constitute the entire agreement between the client and Sudharsan Builds. They supersede all prior negotiations, agreements, and understandings.
              </p>
            </div>

            {/* Section 18 */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">18. Contact Information</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                For questions about these Terms or our services, please contact us:
              </p>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-slate-900 font-bold mb-3">Sudharsan Builds</p>
                <div className="space-y-2 text-slate-700">
                  <p><strong>Email:</strong> <a href="mailto:info@sudharsanbuilds.com" className="text-cyan-600 hover:underline">info@sudharsanbuilds.com</a></p>
                  <p><strong>Website:</strong> <a href="https://sudharsanbuilds.com" className="text-cyan-600 hover:underline">sudharsanbuilds.com</a></p>
                  <p><strong>Location:</strong> Remote Work - Serving Clients Across India</p>
                  <p className="text-sm text-slate-600 mt-4">
                    Business Hours: Monday - Friday, 9:00 AM - 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Acknowledgment */}
            <div className="bg-cyan-50 border-l-4 border-cyan-600 p-6 rounded-lg">
              <p className="text-slate-700 leading-relaxed mb-3">
                <strong>Acknowledgment:</strong> By using our services or making a payment, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
              <p className="text-slate-700 leading-relaxed">
                If you do not agree with these Terms, please do not engage our services. For custom terms or specific project requirements, please contact us to discuss a tailored agreement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
