import { Code2, Palette, Rocket, Zap } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

export default function About() {
  const skills = [
    { icon: <Code2 className="w-6 h-6" />, name: "No-Code Development" },
    { icon: <Rocket className="w-6 h-6" />, name: "SaaS Products" },
    { icon: <Palette className="w-6 h-6" />, name: "UI/UX Design" },
    { icon: <Zap className="w-6 h-6" />, name: "Workflow Automation" },
  ];

  return (
    <section
      id="about"
      className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 p-10 bg-gradient-to-b from-gray-900 to-gray-800 text-white"
    >
      {/* Profile Image */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 10 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="relative w-48 h-48 md:w-80 md:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.4)] hover:shadow-[0_0_80px_rgba(0,255,255,0.6)] transform transition-all duration-300"
      >
        <img
          src="/profile.jpg" // ✅ Replace with your correct path or import
          alt="Sudharsan"
          className="w-full h-full object-cover rounded-full"
        />
      </motion.div>

      {/* About Text */}
      <div className="space-y-5">
        <p className="text-lg text-slate-300 leading-relaxed">
          Hi! I'm a passionate developer specializing in transforming ideas into fully functional
          web applications and SaaS products. With expertise in modern no-code and AI-assisted
          development, I help businesses and entrepreneurs bring their visions to life quickly and
          efficiently.
        </p>

        <p className="text-lg text-slate-300 leading-relaxed">
          My goal is to provide high-quality, production-ready solutions that not only look
          stunning but also deliver exceptional user experiences. Whether you need an e-commerce
          platform, a subscription service, or a custom web application, I’ve got you covered.
        </p>

        {/* Skills Section */}
        <div className="pt-5">
          <h3 className="text-xl font-bold text-slate-300 mb-3">Core Skills</h3>
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <span className="text-cyan-400">{skill.icon}</span>
                <span className="text-slate-300 font-medium">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
