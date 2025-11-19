import { useState } from 'react';
import { Mail, Send, Github, Linkedin, Twitter, AlertCircle, Phone, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from '@supabase/supabase-js';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  timeline?: string;
  message?: string;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function Contact() {
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

    // Phone validation (Indian format) - OPTIONAL
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid Indian phone number";
    }

    // Service validation
    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    // Timeline validation
    if (!formData.timeline) {
      newErrors.timeline = "Please select a timeline";
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
      setTimeout(() => setStatus(""), 5000);
      return;
    }

    setStatus("sending");

    try {
      // Store in Supabase
      if (supabase) {
        const { error: supabaseError } = await supabase
          .from('inquiries')
          .insert([
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              service: formData.service,
              timeline: formData.timeline,
              budget: formData.budget || null,
              message: formData.message,
              created_at: new Date().toISOString()
            }
          ]);

        if (supabaseError) {
          console.error("Supabase error:", supabaseError);
        }
      }

      // Send via Formspree (email notification)
      const formspreeId = import.meta.env.VITE_FORMSPREE_ID || 'xeopodle';
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          timeline: formData.timeline,
          budget: formData.budget,
          message: formData.message
        })
      });

      if (res.ok) {
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
        setTimeout(() => setStatus(""), 7000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus(""), 5000);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setStatus("error");
      setTimeout(() => setStatus(""), 5000);
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

  return (
    <section id="contact" className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">
          Get In <span className="text-cyan-600">Touch</span>
        </h2>
        <p className="text-center text-slate-600 mb-12 md:mb-16 text-lg">
          Ready to start your project? Fill out the form and I'll get back to you within 24 hours!
        </p>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">Let's Work Together</h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                Ready to bring your idea to life? Fill out the booking form and I'll get back to you within 24 hours. Let's create something amazing together!
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-700">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:sudharsanofficial0001@gmail.com" className="text-cyan-600 hover:text-cyan-700">
                    sudharsanofficial0001@gmail.com
                  </a>
                </div>
              </div>

            </div>

            <div>
              <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4">Connect With Me</h4>
              <div className="flex gap-3 md:gap-4">
                <a href="https://github.com/Sudharsan1-5" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com/in/sudharsan-k-2027b1370" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://x.com/SudharsanBuilds" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-5 md:p-8 rounded-2xl shadow-xl space-y-4"
          >
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
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                }`}
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
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                }`}
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
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={`w-full pl-10 pr-3 py-2.5 md:px-4 md:py-3 md:pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                    errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                  }`}
                  placeholder="+91 98765 43210"
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </p>
              )}
            </div>

            {/* Service Selection */}
            <div>
              <label htmlFor="service" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                Which Service? *
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                aria-invalid={!!errors.service}
                aria-describedby={errors.service ? "service-error" : undefined}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                  errors.service ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                }`}
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
                required
                aria-invalid={!!errors.timeline}
                aria-describedby={errors.timeline ? "timeline-error" : undefined}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                  errors.timeline ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                }`}
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

            {/* Budget (Optional) */}
            <div>
              <label htmlFor="budget" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                Budget (Optional)
              </label>
              <input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm md:text-base"
                placeholder="₹20,000 - ₹50,000"
              />
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
                required
                rows={4}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none text-sm md:text-base ${
                  errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                }`}
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
      </div>

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
              <p className="font-bold text-base md:text-lg">Thank You!</p>
              <p className="text-xs md:text-sm">We'll get back to you within 24 hours!</p>
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
    </section>
  );
}
