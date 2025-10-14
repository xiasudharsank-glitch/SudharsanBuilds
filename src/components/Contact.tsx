import { useState } from 'react';
import { Mail, Send, Github, Linkedin, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    message: ''
  });
  const [status, setStatus] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.target as HTMLFormElement;
    const formDataObj = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/xldpowyp", {
        method: "POST",
        body: formDataObj,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: '', email: '', projectType: '', message: '' });
        form.reset();
        setTimeout(() => setStatus(""), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus(""), 5000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus(""), 5000);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-16 text-slate-900">
          Get In <span className="text-cyan-600">Touch</span>
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Let's Work Together</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
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
                  <a href="mailto:your.email@example.com" className="text-cyan-600 hover:text-cyan-700">
                    sudharsanofficial0001@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">Connect With Me</h4>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-cyan-600 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-xl space-y-6"
          >

            <div>
              <label htmlFor="name" className="block text-slate-700 font-semibold mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-slate-700 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="projectType" className="block text-slate-700 font-semibold mb-2">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Select a project type"
              >
                <option value="">Select a project type</option>
                <option value="ecommerce">E-commerce Website</option>
                <option value="saas">SaaS Product</option>
                <option value="webapp">Web Application</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-slate-700 font-semibold mb-2">
                Project Details
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="fixed bottom-10 right-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3"
            >
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-lg">Success!</p>
                <p className="text-sm">Your message was sent successfully!</p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="fixed bottom-10 right-10 bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3"
            >
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-bold text-lg">Oops!</p>
                <p className="text-sm">Something went wrong. Please try again.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </section>
  );
}
