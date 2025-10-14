import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { motion, useMotionValue, useTransform } from "framer-motion";

// --- 1. TYPES ---
type MousePosition = { x: number; y: number };

// --- 2. Custom Hook for Mouse Position (For 3D Parallax and Blob movement) ---
const useMousePosition = (): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return mousePosition;
};

// --- 3. Custom Hook for Smooth Scrolling (Handles internal navigation) ---
const useSmoothScroll = () => {
    const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href')?.substring(1);
        const targetElement = targetId ? document.getElementById(targetId) : null;
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);
    return scrollToSection;
};

// --- 4. Hero Component (The main showpiece) ---
const Hero: FC = () => {
    const scrollToSection = useSmoothScroll();
    const heroRef = useRef<HTMLElement>(null);
    const { x, y } = useMousePosition();
    // Default bounds are set to zero until the component mounts and measures itself
    const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });

    useEffect(() => {
        const updateBounds = () => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setBounds({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
            }
        };

        // Initialize bounds and listen for window resize
        updateBounds();
        window.addEventListener('resize', updateBounds);
        return () => window.removeEventListener('resize', updateBounds);
    }, []);

    // 3D Name Effect: Maps mouse position to rotation values
    const rotateX = useTransform(
        useMotionValue(y),
        [bounds.top, bounds.top + bounds.height],
        [10, -10] // Tilts up/down
    );

    const rotateY = useTransform(
        useMotionValue(x),
        [bounds.left, bounds.left + bounds.width],
        [-10, 10] // Tilts left/right
    );

    // Dynamic Background Blob: Maps mouse position to subtle movement
    const blobX = useTransform(
        useMotionValue(x),
        [bounds.left, bounds.left + bounds.width],
        [-150, 150]
    );

    const blobY = useTransform(
        useMotionValue(y),
        [bounds.top, bounds.top + bounds.height],
        [-150, 150]
    );

    return (
        <section
            ref={heroRef}
            id="home"
            className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 border-b-4 border-cyan-500/20"
            style={{ perspective: 1000 }} // Enables 3D context for rotation
        >
            {/* 1. Dynamic Background Blob (Always in motion + mouse reactive) */}
            <motion.div
                className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full mix-blend-screen opacity-30 blur-3xl"
                style={{
                    x: blobX,
                    y: blobY,
                    background: 'radial-gradient(circle, rgba(6,182,212,1) 0%, rgba(2,132,199,0) 70%)',
                    zIndex: 0,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* 2. Content */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center space-y-8 py-20">
                    <div className="space-y-4">
                        {/* 3. 3D Name Effect: Mouse reactive rotation */}
                        <motion.h1
                            style={{ rotateX, rotateY }}
                            className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tighter cursor-default"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            <span
                                className="inline-block"
                                style={{
                                    textShadow: `
                                        0 0 5px rgba(255, 255, 255, 0.8),
                                        0 10px 0px rgba(0, 0, 0, 0.5),
                                        0 20px 0px rgba(0, 175, 255, 0.4),
                                        0 30px 10px rgba(0, 0, 0, 0.3)
                                    `
                                }}
                            >
                                Sudharsan
                            </span>
                        </motion.h1>

                        <p className="text-2xl md:text-3xl text-cyan-400 font-medium pt-2">
                            AI-Assisted No Code Developer & Web App Builder
                        </p>
                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto pt-2">
                            I turn ideas into powerful, premium Web Apps & SaaS Products
                        </p>
                    </div>

                    {/* Social Icons */}
                    <div className="flex justify-center gap-6 pt-6">
                        {/* GitHub */}
                        <motion.a
                            href="https://github.com/Sudharsan1-5"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.3, rotate: 5, boxShadow: "0px 0px 20px rgba(34,211,238,0.7)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-2 rounded-full transition-colors duration-300"
                            aria-label="GitHub Profile"
                        >
                            <Github size={32} />
                        </motion.a>

                        {/* LinkedIn */}
                        <motion.a
                            href="https://linkedin.com/in/sudharsan-k-2027b1370"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.3, rotate: -5, boxShadow: "0px 0px 20px rgba(0,191,255,0.7)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-2 rounded-full transition-colors duration-300"
                            aria-label="LinkedIn Profile"
                        >
                            <Linkedin size={32} />
                        </motion.a>

                        {/* Twitter/X */}
                        <motion.a
                            href="https://x.com/SudharsanBuilds"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.3, rotate: 5, boxShadow: "0px 0px 20px rgba(29,155,240,0.7)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-2 rounded-full transition-colors duration-300"
                            aria-label="Twitter Profile"
                        >
                            <Twitter size={32} />
                        </motion.a>

                        {/* Mail */}
                        <motion.a
                            href="#contact"
                            onClick={scrollToSection}
                            whileHover={{ scale: 1.3, rotate: -5, boxShadow: "0px 0px 20px rgba(255,255,255,0.7)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-2 rounded-full transition-colors duration-300"
                            aria-label="Contact via Email"
                        >
                            <Mail size={32} />
                        </motion.a>
                    </div>

                    {/* Hire Me Button */}
                    <div className="pt-10">
                        <motion.a
                            href="#contact"
                            onClick={scrollToSection}
                            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-5 rounded-full text-xl font-bold tracking-wide shadow-lg shadow-cyan-500/30"
                            whileHover={{
                                scale: 1.05,
                                y: -2,
                                boxShadow: "0 0 35px rgba(6, 182, 212, 0.8)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Start a Project
                        </motion.a>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator (Position adjusted to bottom-10 for safety) */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-12 border-2 border-cyan-400/50 rounded-full flex justify-center p-1">
                    <motion.div
                        className="w-1.5 h-3 bg-cyan-400 rounded-full"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    ></motion.div>
                </div>
            </div>
        </section>
    );
}

export default Hero;