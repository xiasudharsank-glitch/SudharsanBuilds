import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

// --- 1. TYPES ---
type MousePosition = { x: number; y: number };

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

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

    // Particle system state
    const [particles, setParticles] = useState<Particle[]>([]);

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

    // Initialize particle field
    useEffect(() => {
        const particleCount = 80;
        const initialParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            initialParticles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.3
            });
        }

        setParticles(initialParticles);
    }, []);

    // Animate particles
    useEffect(() => {
        const interval = setInterval(() => {
            setParticles(prevParticles =>
                prevParticles.map(particle => {
                    let newX = particle.x + particle.speedX;
                    let newY = particle.y + particle.speedY;

                    // Wrap around edges
                    if (newX < -5) newX = 105;
                    if (newX > 105) newX = -5;
                    if (newY < -5) newY = 105;
                    if (newY > 105) newY = -5;

                    return { ...particle, x: newX, y: newY };
                })
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    // Mouse motion values with smooth spring animations
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        mouseX.set(x);
        mouseY.set(y);
    }, [x, y, mouseX, mouseY]);

    // 3D Name Effect: Maps mouse position to rotation values with stronger effect
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    const rotateX = useSpring(
        useTransform(
            mouseY,
            [bounds.top, centerY, bounds.top + bounds.height],
            [15, 0, -15]
        ),
        { stiffness: 150, damping: 30 }
    );

    const rotateY = useSpring(
        useTransform(
            mouseX,
            [bounds.left, centerX, bounds.left + bounds.width],
            [-15, 0, 15]
        ),
        { stiffness: 150, damping: 30 }
    );

    // Dynamic Background Blob: Maps mouse position to stronger movement
    const blobX = useSpring(
        useTransform(
            mouseX,
            [bounds.left, centerX, bounds.left + bounds.width],
            [-200, 0, 200]
        ),
        { stiffness: 50, damping: 30 }
    );

    const blobY = useSpring(
        useTransform(
            mouseY,
            [bounds.top, centerY, bounds.top + bounds.height],
            [-200, 0, 200]
        ),
        { stiffness: 50, damping: 30 }
    );

    return (
        <section
            ref={heroRef}
            id="home"
            className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 border-b-4 border-cyan-500/20"
            style={{ perspective: 1500 }}
        >
            {/* Layer 1: Dynamic Background Blob (Cosmic Glow) */}
            <motion.div
                className="absolute w-[500px] h-[500px] md:w-[800px] md:h-[800px] rounded-full mix-blend-screen opacity-35 blur-3xl"
                style={{
                    x: blobX,
                    y: blobY,
                    background: 'radial-gradient(circle, rgba(6,182,212,0.9) 0%, rgba(59,130,246,0.6) 40%, rgba(2,132,199,0) 70%)',
                    zIndex: 0,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 15, -15, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Layer 2: Particle Field (Star/Dot Animation) */}
            <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
                {particles.map(particle => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            opacity: particle.opacity,
                            boxShadow: `0 0 ${particle.size * 2}px rgba(6,182,212,${particle.opacity})`,
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            {/* Additional accent particles (larger cyan dots) */}
            <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={`accent-${i}`}
                        className="absolute w-1 h-1 rounded-full bg-cyan-400"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            scale: [0, 1.5, 0],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            {/* Content Layer */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center space-y-8 py-20">
                    <div className="space-y-4">
                        {/* 3D Name Effect: Enhanced mouse reactive rotation with dramatic depth */}
                        <motion.h1
                            style={{
                                rotateX,
                                rotateY,
                                transformStyle: "preserve-3d",
                            }}
                            className="text-6xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tighter cursor-default"
                        >
                            <span
                                className="inline-block"
                                style={{
                                    textShadow: `
                                        0 0 10px rgba(255, 255, 255, 1),
                                        0 0 20px rgba(6, 182, 212, 0.8),
                                        0 5px 0px rgba(0, 0, 0, 0.6),
                                        0 10px 0px rgba(0, 0, 0, 0.5),
                                        0 15px 0px rgba(0, 175, 255, 0.5),
                                        0 20px 0px rgba(0, 175, 255, 0.4),
                                        0 25px 0px rgba(0, 100, 200, 0.3),
                                        0 30px 5px rgba(0, 0, 0, 0.4),
                                        0 35px 10px rgba(0, 0, 0, 0.3),
                                        0 40px 15px rgba(0, 0, 0, 0.2)
                                    `,
                                    transform: "translateZ(50px)",
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
        </section>
    );
}

export default Hero;