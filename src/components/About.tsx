import { Code2, Palette, Rocket, Zap } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

export default function About() {
  const skills = [
    { icon: <Code2 className="w-6 h-6" />, name: "No-Code Development" },
    { icon: <Rocket className="w-6 h-6" />, name: "SaaS Products" },
    { icon: <Palette className="w-6 h-6" />, name: "E-commerce Solutions" },
    { icon: <Zap className="w-6 h-6" />, name: "Workflow Automation" },
  ];

  // Motion values for realistic 3D cursor-based tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [15, -15]);
  const rotateY = useTransform(x, [-150, 150], [-15, 15]);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    x.set(offsetX);
    y.set(offsetY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovering(false);
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16 text-slate-900">
            About <span className="text-cyan-600">Me</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* ---------- 3D INTERACTIVE IMAGE SECTION ---------- */}
            <div className="flex justify-center">
              <motion.div
                className="relative w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX,
                  rotateY,
                  scale: isHovering ? 1.07 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                {/* Glowing border animation */}
                <div className="absolute inset-0 animate-spin-slow rounded-3xl border-4 border-cyan-300 opacity-20"></div>

                {/* Profile Image */}
                <motion.img
                  src={new URL('../assets/professional photo.jpg', import.meta.url).href}
                  alt="Sudharsan - Full Stack Web Developer and SaaS Expert - Professional Headshot"
                  title="Sudharsan | Web Developer specializing in React, TypeScript, and Node.js"
                  className="w-full h-full object-cover rounded-3xl transition-all duration-500"
                  whileHover={{ scale: 1.12 }}
                  loading="lazy"
                />

                {/* Soft gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>
            </div>

            {/* ---------- TEXT SECTION ---------- */}
            <div className="space-y-4 md:space-y-6">
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                Hi! I'm <strong>Sudharsan</strong>, a <strong>full stack web developer</strong> specializing in transforming
                ideas into fully functional <strong>web applications</strong> and <strong>SaaS products</strong>.
                With expertise in <strong>React, TypeScript, Node.js</strong>, and AI-assisted development, I
                help businesses and entrepreneurs bring their visions to life
                quickly and efficiently.
              </p>

              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                As a professional <strong>web developer</strong>, my goal is to provide high-quality, production-ready solutions
                that not only look stunning but also deliver exceptional user
                experiences. Whether you need an <strong>e-commerce platform</strong>, a
                <strong>subscription service</strong>, or a <strong>custom web application</strong>, I leverage modern
                web technologies to build scalable, performant solutions that drive results.
              </p>

              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                <strong>Based in India</strong>, I work with clients worldwide to deliver cutting-edge
                <strong> web development services</strong> including front-end development, back-end development,
                API integration, database design, and full-stack solutions. My portfolio showcases
                real-world projects built with industry-leading technologies.
              </p>

              <div className="pt-4 md:pt-6">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-6">
                  Core Skills
                </h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.name} // ✅ FIX: Use unique name instead of index
                      className="flex items-center gap-2 md:gap-3 p-2.5 md:p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                    >
                      <div className="text-cyan-600 flex-shrink-0">{skill.icon}</div>
                      <span className="text-slate-800 font-medium text-xs sm:text-sm md:text-base leading-tight">
                        {skill.name}
                      </span>
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
