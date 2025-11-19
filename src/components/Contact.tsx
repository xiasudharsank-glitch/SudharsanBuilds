import { useState } from 'react';
import { Mail, Send, Github, Linkedin, Twitter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

interface FormErrors {
  name?: string;
  email?: string;
  projectType?: string;
  message?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
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

    // Project type validation
    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type";
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
      const formspreeId = import.meta.env.VITE_FORMSPREE_ID;
      if (!formspreeId) {
        throw new Error('Formspree ID not configured');
      }
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          projectType: formData.projectType,
          message: formData.message
        })
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: '', email: '', projectType: '', message: '', honeypot: '' });
        setErrors({});
        setTimeout(() => setStatus(""), 5000);
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
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16 text-slate-900">
          Get In <span className="text-cyan-600">Touch</span>
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">Let's Work Together</h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                Ready to bring your idea to life? Fill out the form and I'll get back to you within 24 hours. Let's create something amazing together!
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
                <a href="https://github.com/Sudharsan1-5" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com/in/sudharsan-k-2027b1370" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://x.com/SudharsanBuilds" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-5 md:p-8 rounded-2xl shadow-xl space-y-4 md:space-y-6"
          >

            <div>
              <label htmlFor="name" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                Your Name
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

            <div>
              <label htmlFor="email" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                Email Address
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

            <div>
              <label htmlFor="projectType" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                required
                aria-invalid={!!errors.projectType}
                aria-describedby={errors.projectType ? "projectType-error" : undefined}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm md:text-base ${
                  errors.projectType ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'
                }`}
              >
                <option value="">Select a project type</option>
                <option value="ecommerce">E-commerce Website</option>
                <option value="saas">SaaS Product</option>
                <option value="webapp">Web Application</option>
                <option value="other">Other</option>
              </select>
              {errors.projectType && (
                <p id="projectType-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.projectType}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-slate-700 font-semibold mb-2 text-sm md:text-base">
                Project Details
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
                placeholder="Tell me about your project..."
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
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
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
                <p className="font-bold text-base md:text-lg">Success!</p>
                <p className="text-xs md:text-sm">Your message was sent successfully!</p>
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
                <p className="text-xs md:text-sm">Something went wrong. Please try again.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </section>
  );
}
