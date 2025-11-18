import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { Github, Linkedin, Mail, Twitter, ArrowDown, Sparkles } from 'lucide-react';
import { motion, useTransform, useSpring } from "framer-motion";

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


// --- 4. New Component: Generative 3D Grid ---
const GenerativeGrid: FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1, perspective: '800px' }}>
            {/* Main Grid Container (3D perspective) */}
            <motion.div
                className="absolute inset-0"
                initial={{ rotateX: 65, translateY: 150 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                style={{
                    transformStyle: 'preserve-3d',
                    backgroundSize: '30px 30px',
                    backgroundImage: 'linear-gradient(to right, #083344 1px, transparent 1px), linear-gradient(to bottom, #083344 1px, transparent 1px)',
                }}
            >
                {/* Subtle Glow Overlay */}
                <div className="absolute inset-0 bg-transparent"
                     style={{
                        boxShadow: 'inset 0 0 150px rgba(6, 182, 212, 0.2)',
                        // Rotating the glow source itself
                        transform: 'rotateZ(45deg)'
                     }}
                />
            </motion.div>
        </div>
    );
};

// --- 5. Hero Component (The main showpiece) ---
const Hero: FC = () => {
    const scrollToSection = useSmoothScroll();
    const heroRef = useRef<HTMLElement>(null);
    const { x, y } = useMousePosition();

    const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });

    useEffect(() => {
        const updateBounds = () => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setBounds({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
            }
        };
        updateBounds();
        window.addEventListener('resize', updateBounds);
        return () => window.removeEventListener('resize', updateBounds);
    }, []);

    // 3D Name Effect: Maps mouse position to rotation values
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    // Use a stronger damping for a more responsive (less springy) feel
    const springConfig = { stiffness: 100, damping: 20 };

    // Calculate rotation based on mouse position
    const rotateXValue = bounds.height > 0 ? ((y - centerY) / bounds.height) * -20 : 0;
    const rotateYValue = bounds.width > 0 ? ((x - centerX) / bounds.width) * 20 : 0;

    // Rotate X and Y with spring animation
    const rotateX = useSpring(rotateXValue, springConfig);
    const rotateY = useSpring(rotateYValue, springConfig);

    // Dynamic Background Blob: Maps mouse position to movement
    const blobXValue = bounds.width > 0 ? ((x - centerX) / bounds.width) * 150 : 0;
    const blobYValue = bounds.height > 0 ? ((y - centerY) / bounds.height) * 150 : 0;

    const blobX = useSpring(blobXValue, { stiffness: 50, damping: 30 });
    const blobY = useSpring(blobYValue, { stiffness: 50, damping: 30 });

    return (
        <section
            ref={heroRef}
            id="home"
            className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 border-b-4 border-cyan-500/20"
            style={{ perspective: 1000 }} // Increased perspective for deeper 3D feel
        >
            
            {/* 1. Wireframe Grid Background */}
            <GenerativeGrid />

            {/* 2. Dynamic Background Blob (Cosmic Glow) */}
            <motion.div
                className="absolute w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full mix-blend-screen opacity-35 blur-3xl"
                style={{
                    x: blobX,
                    y: blobY,
                    background: 'radial-gradient(circle, rgba(6,182,212,0.9) 0%, rgba(59,130,246,0.6) 40%, rgba(2,132,199,0) 70%)',
                    zIndex: 2, // Ensure blob sits above the grid
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                }}
                transition={{
                    duration: 30, // Slowed down the rotation
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Content Layer */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center space-y-8 py-20">
                    <div className="space-y-6">
                        {/* 3D Name Effect: Mouse reactive rotation - SEO Optimized H1 */}
                        <motion.div
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="cursor-default"
                            transition={springConfig}
                        >
                            <h1
                                className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tighter"
                                style={{
                                    textShadow: `
                                        0 0 5px rgba(255, 255, 255, 0.8),
                                        0 5px 0px rgba(0, 0, 0, 0.3),
                                        0 10px 0px rgba(0, 175, 255, 0.2),
                                        0 15px 5px rgba(0, 0, 0, 0.1)
                                    `
                                }}
                            >
                                Sudharsan
                            </h1>
                        </motion.div>

                        {/* Animated subtitle with gradient - SEO Optimized */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="space-y-3"
                        >
                            <p className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 font-bold pt-2 flex items-center justify-center gap-2">
                                <Sparkles className="text-cyan-400 animate-pulse" size={28} />
                                Full Stack Web Developer & SaaS Builder
                                <Sparkles className="text-cyan-400 animate-pulse" size={28} />
                            </p>
                            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto pt-2 leading-relaxed">
                                Expert in <span className="text-cyan-400 font-semibold">React, TypeScript, Node.js</span> — Building modern web applications, SaaS platforms, and e-commerce solutions that drive business growth
                            </p>
                        </motion.div>
                    </div>

                    {/* Social Icons - Enhanced with better animations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex justify-center gap-6 pt-8"
                    >
                        {/* GitHub */}
                        <motion.a
                            href="https://github.com/Sudharsan1-5"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{
                                scale: 1.3,
                                rotate: 5,
                                boxShadow: "0px 0px 25px rgba(34,211,238,0.8)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300"
                            aria-label="GitHub Profile"
                        >
                            <Github size={28} />
                        </motion.a>

                        {/* LinkedIn */}
                        <motion.a
                            href="https://linkedin.com/in/sudharsan-k-2027b1370"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{
                                scale: 1.3,
                                rotate: -5,
                                boxShadow: "0px 0px 25px rgba(0,191,255,0.8)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300"
                            aria-label="LinkedIn Profile"
                        >
                            <Linkedin size={28} />
                        </motion.a>

                        {/* Twitter/X */}
                        <motion.a
                            href="https://x.com/SudharsanBuilds"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{
                                scale: 1.3,
                                rotate: 5,
                                boxShadow: "0px 0px 25px rgba(29,155,240,0.8)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300"
                            aria-label="Twitter Profile"
                        >
                            <Twitter size={28} />
                        </motion.a>

                        {/* Mail */}
                        <motion.a
                            href="#contact"
                            onClick={scrollToSection}
                            whileHover={{
                                scale: 1.3,
                                rotate: -5,
                                boxShadow: "0px 0px 25px rgba(255,255,255,0.8)"
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300"
                            aria-label="Contact via Email"
                        >
                            <Mail size={28} />
                        </motion.a>
                    </motion.div>

                    {/* Hire Me Button - Enhanced with better styling */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="pt-12"
                    >
                        <motion.a
                            href="#contact"
                            onClick={scrollToSection}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 text-white px-14 py-6 rounded-full text-xl font-bold tracking-wide shadow-xl shadow-cyan-500/40 border border-cyan-400/20"
                            whileHover={{
                                scale: 1.08,
                                y: -3,
                                boxShadow: "0 0 45px rgba(6, 182, 212, 0.9), 0 10px 30px rgba(6, 182, 212, 0.4)",
                            }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                            <Sparkles size={24} className="animate-pulse" />
                            Let's Work Together
                            <Sparkles size={24} className="animate-pulse" />
                        </motion.a>
                    </motion.div>
                </div>
            </div>
            
            {/* Scroll Down Visual Cue - Enhanced */}
            <motion.div
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                }}
                onClick={() => {
                    const aboutSection = document.getElementById('about');
                    if (aboutSection) {
                        aboutSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                <div className="flex flex-col items-center gap-1">
                    <ArrowDown size={36} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    <span className="text-xs text-cyan-400/80 font-medium">Scroll to explore</span>
                </div>
            </motion.div>
        </section>
    );
}

export default Hero;