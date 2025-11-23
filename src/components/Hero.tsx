import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { Github, Linkedin, Mail, Twitter, ArrowDown, Sparkles, Calendar } from 'lucide-react';
import { motion, useSpring, useReducedMotion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { getActiveRegion } from '../config/regions';

// --- 1. TYPES ---
type MousePosition = { x: number; y: number };

// --- 2. Mobile Detection Hook ---
const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// --- 3. Custom Hook for Mouse Position (For 3D Parallax and Blob movement) - Desktop Only ---
// ✅ FIX: Throttled to prevent excessive re-renders (60 fps max)
const useMousePosition = (enabled: boolean = true): MousePosition => {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

    useEffect(() => {
        if (!enabled) return;

        let animationFrameId: number | null = null;
        let lastUpdateTime = 0;
        const throttleMs = 16; // ~60fps

        const updateMousePosition = (e: MouseEvent) => {
            const currentTime = Date.now();

            // Cancel previous frame if it hasn't been processed yet
            if (animationFrameId !== null) {
                return; // Skip this update if previous one is still queued
            }

            // Throttle updates to max 60fps
            if (currentTime - lastUpdateTime < throttleMs) {
                return;
            }

            animationFrameId = requestAnimationFrame(() => {
                setMousePosition({ x: e.clientX, y: e.clientY });
                lastUpdateTime = currentTime;
                animationFrameId = null;
            });
        };

        window.addEventListener('mousemove', updateMousePosition, { passive: true });

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [enabled]);

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


// --- 4. New Component: Generative 3D Grid (Mobile-Optimized) ---
const GenerativeGrid: FC<{ isMobile: boolean }> = ({ isMobile }) => {
    // Disable heavy 3D animation on mobile
    if (isMobile) {
        return (
            <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
                {/* Simplified static grid for mobile */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundSize: '30px 30px',
                        backgroundImage: 'linear-gradient(to right, #083344 1px, transparent 1px), linear-gradient(to bottom, #083344 1px, transparent 1px)',
                        opacity: 0.5,
                    }}
                >
                    {/* Subtle static glow overlay */}
                    <div className="absolute inset-0 bg-transparent"
                         style={{
                            boxShadow: 'inset 0 0 100px rgba(6, 182, 212, 0.15)',
                         }}
                    />
                </div>
            </div>
        );
    }

    // Full 3D animation for desktop
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
                        transform: 'rotateZ(45deg)'
                     }}
                />
            </motion.div>
        </div>
    );
};

// --- 5. Hero Component (The main showpiece - Mobile-Optimized) ---
const Hero: FC = () => {
    const navigate = useNavigate();
    const scrollToSection = useSmoothScroll();
    const heroRef = useRef<HTMLElement>(null);

    // Get region-specific content
    const regionConfig = getActiveRegion();
    const { content } = regionConfig;

    // Mobile detection and reduced motion preference
    const isMobile = useIsMobile();
    const shouldReduceMotion = useReducedMotion();
    const enableMouseTracking = !isMobile && !shouldReduceMotion;

    const { x, y } = useMousePosition(enableMouseTracking);

    const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });

    useEffect(() => {
        if (!enableMouseTracking) return;

        const updateBounds = () => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setBounds({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
            }
        };
        updateBounds();
        window.addEventListener('resize', updateBounds);
        return () => window.removeEventListener('resize', updateBounds);
    }, [enableMouseTracking]);

    // 3D Name Effect: Maps mouse position to rotation values (Desktop only)
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    // Use a stronger damping for a more responsive (less springy) feel
    const springConfig = { stiffness: 100, damping: 20 };

    // Calculate rotation based on mouse position (disabled on mobile)
    const rotateXValue = enableMouseTracking && bounds.height > 0 ? ((y - centerY) / bounds.height) * -20 : 0;
    const rotateYValue = enableMouseTracking && bounds.width > 0 ? ((x - centerX) / bounds.width) * 20 : 0;

    // Rotate X and Y with spring animation (desktop only)
    const rotateX = useSpring(rotateXValue, springConfig);
    const rotateY = useSpring(rotateYValue, springConfig);

    // Dynamic Background Blob: Maps mouse position to movement (desktop only)
    const blobXValue = enableMouseTracking && bounds.width > 0 ? ((x - centerX) / bounds.width) * 150 : 0;
    const blobYValue = enableMouseTracking && bounds.height > 0 ? ((y - centerY) / bounds.height) * 150 : 0;

    const blobX = useSpring(blobXValue, { stiffness: 50, damping: 30 });
    const blobY = useSpring(blobYValue, { stiffness: 50, damping: 30 });

    return (
        <section
            ref={heroRef}
            id="home"
            className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 border-b-4 border-cyan-500/20"
            style={{ perspective: isMobile ? undefined : 1000 }} // Disable 3D perspective on mobile
        >

            {/* 1. Wireframe Grid Background */}
            <GenerativeGrid isMobile={isMobile} />

            {/* 2. Dynamic Background Blob (Cosmic Glow) - ✅ P0 FIX: Static on mobile */}
            {!isMobile && (
                <motion.div
                    className="absolute rounded-full mix-blend-screen w-[500px] h-[500px] md:w-[800px] md:h-[800px] opacity-35 blur-3xl"
                    style={{
                        x: blobX,
                        y: blobY,
                        background: 'radial-gradient(circle, rgba(6,182,212,0.9) 0%, rgba(59,130,246,0.6) 40%, rgba(2,132,199,0) 70%)',
                        zIndex: 2,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            )}
            {/* ✅ P0 FIX: Simple static gradient on mobile for better performance */}
            {isMobile && (
                <div
                    className="absolute w-full h-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.4) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)',
                        zIndex: 2,
                    }}
                />
            )}

            {/* Content Layer */}
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center space-y-8 py-20">
                    <div className="space-y-4 sm:space-y-6">
                        {/* 3D Name Effect: Mouse reactive rotation - SEO Optimized H1 - ✅ P0 FIX: No 3D on mobile */}
                        {isMobile ? (
                            <h1
                                className="text-5xl xs:text-6xl sm:text-7xl font-extrabold text-white tracking-tighter px-4"
                                style={{
                                    textShadow: `
                                        0 0 3px rgba(255, 255, 255, 0.6),
                                        0 3px 0px rgba(0, 0, 0, 0.3),
                                        0 6px 0px rgba(0, 175, 255, 0.2)
                                    `
                                }}
                            >
                                Sudharsan
                            </h1>
                        ) : (
                            <motion.div
                                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                                className="cursor-default"
                                transition={springConfig}
                            >
                                <h1
                                    className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-white tracking-tighter px-4"
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
                        )}

                        {/* Animated subtitle with gradient - SEO Optimized - ✅ P0 FIX: Simpler animations on mobile */}
                        <div className="space-y-3 px-4">
                            <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 font-bold pt-2 flex flex-wrap items-center justify-center gap-2">
                                <Sparkles className="text-cyan-400" size={isMobile ? 20 : 28} />
                                <span className="text-center">
                                    {content.heroSubtitle || 'Full Stack Web Developer & SaaS Builder'}
                                </span>
                                <Sparkles className="text-cyan-400" size={isMobile ? 20 : 28} />
                            </p>
                            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto pt-2 leading-relaxed">
                                {content.heroDescription || (
                                    <>
                                        Expert in <span className="text-cyan-400 font-semibold">React, TypeScript, Node.js</span> — Building modern web applications, SaaS platforms, and e-commerce solutions that drive business growth
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Social Icons - Enhanced with better animations and mobile-optimized touch targets - ✅ P0 FIX: No entry animation on mobile */}
                    <div className="flex justify-center gap-4 sm:gap-6 pt-6 sm:pt-8">
                        {/* GitHub */}
                        <motion.a
                            href="https://github.com/Sudharsan1-5"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={!isMobile ? {
                                scale: 1.3,
                                rotate: 5,
                                boxShadow: "0px 0px 25px rgba(34,211,238,0.8)"
                            } : {}}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300 touch-target"
                            aria-label="GitHub Profile"
                        >
                            <Github size={isMobile ? 24 : 28} />
                        </motion.a>

                        {/* LinkedIn */}
                        <motion.a
                            href="https://linkedin.com/in/sudharsan-k-2027b1370"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={!isMobile ? {
                                scale: 1.3,
                                rotate: -5,
                                boxShadow: "0px 0px 25px rgba(0,191,255,0.8)"
                            } : {}}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300 touch-target"
                            aria-label="LinkedIn Profile"
                        >
                            <Linkedin size={isMobile ? 24 : 28} />
                        </motion.a>

                        {/* Twitter/X */}
                        <motion.a
                            href="https://x.com/SudharsanBuilds"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={!isMobile ? {
                                scale: 1.3,
                                rotate: 5,
                                boxShadow: "0px 0px 25px rgba(29,155,240,0.8)"
                            } : {}}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300 touch-target"
                            aria-label="Twitter Profile"
                        >
                            <Twitter size={isMobile ? 24 : 28} />
                        </motion.a>

                        {/* Mail */}
                        <motion.a
                            href="#contact"
                            onClick={scrollToSection}
                            whileHover={!isMobile ? {
                                scale: 1.3,
                                rotate: -5,
                                boxShadow: "0px 0px 25px rgba(255,255,255,0.8)"
                            } : {}}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className="text-slate-300 hover:text-cyan-400 p-3 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 transition-colors duration-300 touch-target"
                            aria-label="Contact via Email"
                        >
                            <Mail size={isMobile ? 24 : 28} />
                        </motion.a>
                    </div>

                    {/* CTA Buttons - Book Now + Let's Work Together - ✅ P0 FIX: No entry animation on mobile */}
                    <div className={`pt-8 sm:pt-12 px-4 flex flex-col sm:flex-row items-center justify-center gap-4 ${
                            isMobile ? 'w-full max-w-md mx-auto' : ''
                        }`}>
                        {/* Book Now Button - Primary CTA */}
                        <motion.button
                            onClick={() => navigate('/services')}
                            className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-bold tracking-wide shadow-2xl shadow-purple-500/50 border-2 border-purple-400 touch-target ${
                                isMobile ? 'w-full px-8 py-4 text-base' : 'px-12 py-5 text-lg'
                            }`}
                            whileHover={!isMobile ? {
                                scale: 1.08,
                                y: -3,
                                boxShadow: "0 0 45px rgba(168, 85, 247, 0.9), 0 10px 30px rgba(168, 85, 247, 0.4)",
                            } : {}}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                            <Calendar size={isMobile ? 18 : 20} />
                            Book Now
                        </motion.button>

                        {/* Let's Work Together Button - Secondary CTA */}
                        <motion.a
                            href="#contact"
                            onClick={scrollToSection}
                            className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 text-white rounded-full font-bold tracking-wide shadow-xl shadow-cyan-500/40 border border-cyan-400/20 touch-target ${
                                isMobile ? 'w-full px-8 py-4 text-base' : 'px-12 py-5 text-lg'
                            }`}
                            whileHover={!isMobile ? {
                                scale: 1.08,
                                y: -3,
                                boxShadow: "0 0 45px rgba(6, 182, 212, 0.9), 0 10px 30px rgba(6, 182, 212, 0.4)",
                            } : {}}
                            whileTap={{ scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                            <Sparkles size={isMobile ? 18 : 20} />
                            Let's Work Together
                        </motion.a>
                    </div>
                </div>
            </div>
            
            {/* Scroll Down Visual Cue - Clean and Prominent - Properly positioned below CTAs */}
            <motion.div
                className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    y: [0, 10, 0]
                }}
                transition={{
                    opacity: { delay: 1, duration: 0.5 },
                    y: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }
                }}
                onClick={() => {
                    const aboutSection = document.getElementById('about');
                    if (aboutSection) {
                        aboutSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
                <div className="flex flex-col items-center gap-2 bg-slate-800/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-cyan-500/40 hover:border-cyan-400/70 hover:bg-slate-800/80 transition-all shadow-lg">
                    <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Explore</span>
                    <ArrowDown size={24} className="text-cyan-400" />
                </div>
            </motion.div>
        </section>
    );
}

export default Hero;