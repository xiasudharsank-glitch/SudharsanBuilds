import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

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
            <a href="https://github.com/xiasudharsank-glitch" className="text-slate-300 hover:text-cyan-400 transition-colors transform hover:scale-110 duration-300">
              <Github size={28} />
            </a>
            <a href="linkedin.com/in/sudharsan-k-2027b1370" 
               target="_blank"
               rel="noopener noreferrer"
              className="text-slate-300 hover:text-cyan-400 transition-colors transform hover:scale-110 duration-300">
              <Linkedin size={28} />
            </a>
            <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors transform hover:scale-110 duration-300">
              <Twitter size={28} />
            </a>
            <a href="#contact" className="text-slate-300 hover:text-cyan-400 transition-colors transform hover:scale-110 duration-300">
              <Mail size={28} />
            </a>
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
