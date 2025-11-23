import { useState, useEffect } from 'react';
import { Mail, Send, Github, Linkedin, Twitter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
// ✅ LAZY LOAD FIX: Removed initEmailJS import - Contact form only saves to Supabase, does not send emails
import { sanitizeFormData } from '../utils/sanitize';
import { validatePhone } from '../utils/validation'; // ✅ FIX: Use shared validation
import { supabase } from '../services/supabaseClient'; // ✅ FIX: Use singleton Supabase client
import { getActiveRegion } from '../config/regions'; // ✅ ADDED: For region-based phone defaults

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  timeline?: string;
  budget?: string;
  message?: string;
}

export default function Contact() {
  // ✅ Get region config for phone number defaults
  const regionConfig = getActiveRegion();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    timeline: '',
    budget: '',
    message: '',
    honeypot: '' // Hidden field for bot protection
  });
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // ✅ LAZY LOAD FIX: Removed initEmailJS() call - not needed as Contact form only saves to Supabase, doesn't send emails

  // ✅ FIX: Auto-clear status with proper cleanup
  useEffect(() => {
    if (status && status !== "sending") {
      const duration = status === "success" ? 7000 : 5000;
      const timer = setTimeout(() => setStatus(""), duration);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // ✅ FIX: Enhanced phone validation using shared utility
    // Only validate if phone is provided (not empty) - phone is OPTIONAL
    if (formData.phone && formData.phone.trim() && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (8-15 digits, no leading zero)";
    }

    // Service validation
    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    // Timeline validation
    if (!formData.timeline) {
      newErrors.timeline = "Please select a timeline";
    }

    // Budget validation
    if (!formData.budget) {
      newErrors.budget = "Please select a budget range";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Project details are required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Honeypot check (bot protection)
  if (formData.honeypot) {
    console.warn("Honeypot field filled - likely a bot");
    return;
  }

  if (!validateForm()) {
    setStatus("error");
    return;
  }

  setStatus("sending");

  try {
    // ✅ SECURITY: Sanitize all user inputs before processing
    const sanitizedData = sanitizeFormData(formData);

    // ✅ FIX: Save to Supabase and check for success
    let dataSaved = false;
    if (supabase) {
      const { error: supabaseError } = await supabase
        .from('inquiries')
        .insert([
          {
            name: sanitizedData.name,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            service: sanitizedData.service,
            timeline: sanitizedData.timeline,
            budget: sanitizedData.budget || null,
            message: sanitizedData.message,
            created_at: new Date().toISOString()
          }
        ]);

      if (supabaseError) {
        console.error("❌ Supabase error:", supabaseError);
        dataSaved = false;
      } else {
        console.log("✅ Inquiry saved to database successfully");
        dataSaved = true;
      }
    } else {
      console.error("❌ Supabase not configured");
    }

    // ✅ NEW: Send email via Formspree
    let emailSent = false;
    if (dataSaved) {
      try {
        const formspreeResponse = await fetch('https://formspree.io/f/xeopodle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: sanitizedData.name,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            service: sanitizedData.service,
            timeline: sanitizedData.timeline,
            budget: sanitizedData.budget,
            message: sanitizedData.message,
          }),
        });

        if (formspreeResponse.ok) {
          console.log("✅ Email sent via Formspree successfully");
          emailSent = true;
        } else {
          console.error("❌ Formspree error:", formspreeResponse.statusText);
          emailSent = false;
        }
      } catch (formspreeError) {
        console.error("❌ Formspree submission error:", formspreeError);
        emailSent = false;
      }
    }

    // ✅ FIX: Show success/error based on both database save AND email
    // Note: Email notifications are sent via Formspree
    if (dataSaved && emailSent) {
      setStatus("success");
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        timeline: '',
        budget: '',
        message: '',
        honeypot: ''
      });
      setErrors({});
    } else if (dataSaved) {
      // Database saved but email failed - still show success
      console.warn("⚠️ Data saved but email sending failed");
      setStatus("success");
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        timeline: '',
        budget: '',
        message: '',
        honeypot: ''
      });
      setErrors({});
    } else {
      setStatus("error");
    }
  } catch (error) {
    console.error("❌ Form submission error:", error);
    setStatus("error");
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // ✅ NEW: Handle Enter key to move to next field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (!form) return;

      const formElements = Array.from(form.querySelectorAll(
        'input[type="text"], input[type="email"], input[type="tel"], select, textarea'
      )) as HTMLElement[];
      
      const currentIndex = formElements.indexOf(e.currentTarget as HTMLElement);
      if (currentIndex < formElements.length - 1) {
        (formElements[currentIndex + 1] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).focus();
      }
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Get In <span className="text-cyan-600">Touch</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Have a project in mind? Let's discuss your requirements and find the perfect solution. 
            Fill out the form below and I'll get back to you within 24 hours.
          </p>
        </motion.div>

        {/* Contact Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 md:gap-12"
        >
          {/* Left: Contact Info & Social */}
          <div>
            {/* Contact Info Cards */}
            <div className="space-y-6">
              {/* Email */}
              <motion.div
                whileHover={{ translateX: 8 }}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                  <p className="text-slate-600 text-sm break-all">sudharsanofficial0001@gmail.com</p>
                </div>
              </motion.div>

              {/* Response Time */}
              <motion.div
                whileHover={{ translateX: 8 }}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Response Time</h3>
                  <p className="text-slate-600 text-sm">I typically respond within 24 hours</p>
                </div>
              </motion.div>

              {/* Availability */}
              <motion.div
                whileHover={{ translateX: 8 }}
                className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Location</h3>
                  <p className="text-slate-600 text-sm">Trichy, India (GMT+5:30)</p>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-slate-700 font-semibold mb-4">Connect on Social</p>
              <div className="flex gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sky-400 text-white rounded-lg flex items-center justify-center hover:bg-sky-300 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={status === "sending"}
                  required
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                  } ${status === "sending" ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p id="name-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={status === "sending"}
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                  } ${status === "sending" ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p id="email-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                  Phone Number (Optional)
                </label>
                <PhoneInput
                  international
                  defaultCountry={regionConfig.region === 'india' ? 'IN' : 'US'}
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                  disabled={status === "sending"}
                  className="w-full"
                  style={{
                    '--PhoneInputCountryFlag-height': '1em',
                    '--PhoneInput-color--focus': '#06b6d4',
                  } as React.CSSProperties}
                  numberInputProps={{
                    className: `w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                      errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                    } ${status === "sending" ? 'opacity-60 cursor-not-allowed' : ''}`,
                  }}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label htmlFor="service" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                  Service Type *
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={status === "sending"}
                  required
                  aria-invalid={!!errors.service}
                  aria-describedby={errors.service ? "service-error" : undefined}
                  className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                    errors.service ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                  } ${status === "sending" ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select a service</option>
                  <option value="Landing Page (₹15,000)">Landing Page (₹15,000)</option>
                  <option value="Portfolio Website (₹20,000)">Portfolio Website (₹20,000)</option>
                  <option value="Personal Brand Website (₹25,000)">Personal Brand Website (₹25,000)</option>
                  <option value="Business Website (₹30,000)">Business Website (₹30,000)</option>
                  <option value="E-Commerce Store (₹50,000)">E-Commerce Store (₹50,000)</option>
                  <option value="Web Application (₹60,000+)">Web Application (₹60,000+)</option>
                  <option value="SaaS Product (₹75,000+)">SaaS Product (₹75,000+)</option>
                  <option value="Custom Development (Hourly)">Custom Development (Hourly)</option>
                </select>
                {errors.service && (
                  <p id="service-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.service}
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div>
                <label htmlFor="timeline" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                  Timeline/Deadline *
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                  disabled={status === "sending"}
                  aria-invalid={!!errors.timeline}
                  aria-describedby={errors.timeline ? "timeline-error" : undefined}
                  className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                    errors.timeline ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                  } ${status === "sending" ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select a timeline</option>
                  <option value="ASAP (Rush)">ASAP (Rush)</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="Flexible">Flexible</option>
                </select>
                {errors.timeline && (
                  <p id="timeline-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.timeline}
                  </p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                  Budget Range *
                </label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  required
                  disabled={status === "sending"}
                  aria-invalid={!!errors.budget}
                  aria-describedby={errors.budget ? "budget-error" : undefined}
                  className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                    errors.budget ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                  } ${status === "sending" ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select your budget range</option>
                  <option value="Under ₹15,000">Under ₹15,000</option>
                  <option value="₹15,000 - ₹25,000">₹15,000 - ₹25,000</option>
                  <option value="₹25,000 - ₹40,000">₹25,000 - ₹40,000</option>
                  <option value="₹40,000 - ₹60,000">₹40,000 - ₹60,000</option>
                  <option value="₹60,000 - ₹1,00,000">₹60,000 - ₹1,00,000</option>
                  <option value="Above ₹1,00,000">Above ₹1,00,000</option>
                  <option value="Not sure yet">Not sure yet</option>
                </select>
                {errors.budget && (
                  <p id="budget-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.budget}
                  </p>
                )}
              </div>

              {/* Project Details */}
              <div>
                <label htmlFor="message" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                  Project Details/Description *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={status === "sending"}
                  onKeyDown={(e) => {
                    // Shift+Enter: new line, Enter: submit form (last field)
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  required
                  rows={4}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none text-sm md:text-base ${
                    errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                  } ${status === "sending" ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="Tell me about your project requirements, goals, features you need..."
                />
                {errors.message && (
                  <p id="message-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </p>
                )}
              </div>

              {/* Honeypot field for bot protection (hidden) */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 md:py-4 rounded-lg font-semibold hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {status === "sending" ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="fixed bottom-4 right-4 md:bottom-10 md:right-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl shadow-2xl z-50 flex items-center gap-2 md:gap-3 max-w-[calc(100vw-2rem)]"
            >
              <span className="text-xl md:text-2xl">✅</span>
              <div>
                <p className="font-bold text-base md:text-lg">Inquiry Submitted!</p>
                <p className="text-xs md:text-sm">Your message has been saved. We'll review and respond soon!</p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="fixed bottom-4 right-4 md:bottom-10 md:right-10 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl shadow-2xl z-50 flex items-center gap-2 md:gap-3 max-w-[calc(100vw-2rem)]"
            >
              <span className="text-xl md:text-2xl">❌</span>
              <div>
                <p className="font-bold text-base md:text-lg">Oops!</p>
                <p className="text-xs md:text-sm">Please check the form and try again.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}