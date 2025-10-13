import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
              <span className="block">Sudharsan</span>
            </h1>
            <p className="text-2xl md:text-3xl text-cyan-400 font-medium">
              AI-Assisted No Code Developer & Web App Builder
            </p>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              I Turn Ideas Into Powerful Web Apps & SaaS Products
            </p>
          </div>

          <div className="flex justify-center gap-6 pt-4">
  {/* GitHub */}
  <motion.a
    href="https://github.com/Sudharsan1-5"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{
      scale: 1.2,
      rotateY: 15,
      rotateX: 10,
      boxShadow: "0px 0px 25px rgba(34,211,238,0.6)", // cyan glow
    }}
    transition={{ type: "spring", stiffness: 300 }}
    className="text-slate-300 hover:text-cyan-400"
  >
    <Github size={28} />
  </motion.a>

  {/* LinkedIn */}
  <motion.a
    href="https://linkedin.com/in/sudharsan-k-2027b1370"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{
      scale: 1.2,
      rotateY: -15,
      rotateX: 10,
      boxShadow: "0px 0px 25px rgba(0,191,255,0.6)", // blue glow
    }}
    transition={{ type: "spring", stiffness: 300 }}
    className="text-slate-300 hover:text-cyan-400"
  >
    <Linkedin size={28} />
  </motion.a>

  {/* Twitter */}
  <motion.a
    href="https://x.com/SudharsanBuilds"
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{
      scale: 1.2,
      rotateY: 15,
      rotateX: -10,
      boxShadow: "0px 0px 25px rgba(29,155,240,0.6)", // Twitter glow
    }}
    transition={{ type: "spring", stiffness: 300 }}
    className="text-slate-300 hover:text-cyan-400"
  >
    <Twitter size={28} />
  </motion.a>

  {/* Mail */}
  <motion.a
    href="#contact"
    whileHover={{
      scale: 1.2,
      rotateY: -15,
      rotateX: -10,
      boxShadow: "0px 0px 25px rgba(255,255,255,0.6)", // white glow
    }}
    transition={{ type: "spring", stiffness: 300 }}
    className="text-slate-300 hover:text-cyan-400"
  >
    <Mail size={28} />
  </motion.a>
</div>


          <div className="pt-8">
            <a
              href="#contact"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Hire Me
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
