import { Code2, Palette, Rocket, Zap } from 'lucide-react';
import React from "react";
import { motion } from "framer-motion"; // optional, for smooth animation

export default function About() {
  const skills = [
    { icon: <Code2 className="w-6 h-6" />, name: 'No-Code Development' },
    { icon: <Rocket className="w-6 h-6" />, name: 'SaaS Products' },
    { icon: <Palette className="w-6 h-6" />, name: 'E-commerce Solutions' },
    { icon: <Zap className="w-6 h-6" />, name: 'Workflow Automation' }
  ];

  return (
   <section id="about" className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 p-10 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      
      {/* 3D Profile Image */}
      <motion.div
        whileHover={{ scale: 1.08, rotateY: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.4)] hover:shadow-[0_0_80px_rgba(0,255,255,0.6)] transform transition-all duration-300"
      >
        <img
          src="https://files.imagetourl.net/uploads/1760358752168-eb843ce2-4540-46f6-b9a1-c6fcc6a4c5cf.jpg" // ← replace with your own image file or URL
          alt="Sudharsan"
          className="w-full h-full object-cover rounded-full"
        />
      </motion.div>


            <div className="space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Hi! I'm a passionate developer specializing in transforming ideas into fully functional web applications and SaaS products. With expertise in modern no-code and AI-assisted development, I help businesses and entrepreneurs bring their visions to life quickly and efficiently.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                My goal is to provide high-quality, production-ready solutions that not only look stunning but also deliver exceptional user experiences. Whether you need an e-commerce platform, a subscription service, or a custom web application, I've got you covered.
              </p>

              <div className="pt-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Core Skills</h3>
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-cyan-600">{skill.icon}</div>
                      <span className="text-slate-800 font-medium">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
