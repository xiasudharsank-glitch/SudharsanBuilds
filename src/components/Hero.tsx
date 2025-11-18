import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { Github, Linkedin, Mail, Twitter, Bot, ArrowDown } from 'lucide-react'; // Added ArrowDown
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";

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

// --- 4. New Component: Bot Head with Reactive Eyes ---
interface ReactiveBotProps {
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}

const ReactiveBot: FC<ReactiveBotProps> = ({ mouseX, mouseY }) => {
    const botRef = useRef<HTMLDivElement>(null);
    const [angle, setAngle] = useState(0);

    // Calculate angle of cursor relative to bot's center for eye rotation
    useEffect(() => {
        const updateAngle = () => {
            if (botRef.current) {
                const rect = botRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const dx = mouseX.get() - centerX;
                const dy = mouseY.get() - centerY;
                
                // atan2 calculates the angle in radians
                const angleRad = Math.atan2(dy, dx); 
                // Convert to degrees and adjust (90 degrees offset for Lucide Bot icon orientation)
                setAngle(angleRad * (180 / Math.PI) + 90); 
            }
        };

        // Re-calculate whenever mouseX or mouseY updates
        const unsubscribeX = mouseX.on("change", updateAngle);
        const unsubscribeY = mouseY.on("change", updateAngle);
        
        // Recalculate on window resize to keep tracking accurate
        window.addEventListener('resize', updateAngle);

        return () => {
            unsubscribeX();
            unsubscribeY();
            window.removeEventListener('resize', updateAngle);
        };
    }, [mouseX, mouseY]);

    // Small movement of the head (translation) on mouse hover
    const headTranslateX = useTransform(mouseX, [0, window.innerWidth], [-2, 2]);
    const headTranslateY = useTransform(mouseY, [0, window.innerHeight], [-2, 2]);

    return (
        <motion.div
            ref={botRef}
            className="relative hidden sm:block w-24 h-24 p-2" 
            style={{ x: headTranslateX, y: headTranslateY }} // Subtle head movement
        >
            {/* Bot Head Icon (Lucide Bot) */}
            <Bot size={90} className="text-slate-700/80 drop-shadow-xl" strokeWidth={1} />
            
            {/* The Eyes Container - Rotates based on the cursor position */}
            <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                style={{ rotate: angle }}
            >
                {/* Single Large Eye (The 'funny' element) */}
                <div 
                    className="w-8 h-8 rounded-full bg-cyan-400 absolute left-[-1.5rem] top-[-3.2rem]" 
                    style={{ 
                        boxShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee',
                        transform: 'translateY(-2px)' // Keeps the pupil slightly up for a focused look
                    }}
                />
            </motion.div>
        </motion.div>
    );
};


// --- 5. New Component: Generative 3D Grid ---
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

// --- 6. Hero Component (The main showpiece) ---
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

    // Mouse motion values with smooth spring animations
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        mouseX.set(x);
        mouseY.set(y);
    }, [x, y, mouseX, mouseY]);

    // 3D Name Effect: Maps mouse position to rotation values
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    // Use a stronger damping for a more responsive (less springy) feel
    const springConfig = { stiffness: 100, damping: 20 }; 

    // Rotate X
    const rotateX = useSpring(
        useTransform(
            mouseY,
            [bounds.top, centerY, bounds.top + bounds.height],
            [10, 0, -10]
        ),
        springConfig
    );

    // Rotate Y
    const rotateY = useSpring(
        useTransform(
            mouseX,
            [bounds.left, centerX, bounds.left + bounds.width],
            [-10, 0, 10]
        ),
        springConfig
    );

    // Dynamic Background Blob: Maps mouse position to movement
    const blobX = useSpring(
        useTransform(
            mouseX,
            [bounds.left, centerX, bounds.left + bounds.width],
            [-150, 0, 150]
        ),
        { stiffness: 50, damping: 30 }
    );

    const blobY = useSpring(
        useTransform(
            mouseY,
            [bounds.top, centerY, bounds.top + bounds.height],
            [-150, 0, 150]
        ),
        { stiffness: 50, damping: 30 }
    );

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
                    <div className="space-y-4">
                        {/* 3. 3D Name Effect: Mouse reactive rotation - SEO Optimized H1 */}
                        <motion.h1
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight cursor-default flex flex-col items-center justify-center gap-4"
                            transition={springConfig}
                        >
                            {/* Main Name with Bot */}
                            <span className="flex items-center gap-6">
                                {/* Reactive Bot Component */}
                                <ReactiveBot mouseX={mouseX} mouseY={mouseY} />

                                <span
                                    className="inline-block text-6xl md:text-8xl lg:text-9xl tracking-tighter"
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
                                </span>
                            </span>

                            {/* SEO-Rich Professional Title */}
                            <span className="text-2xl md:text-3xl lg:text-4xl text-cyan-400 font-semibold tracking-wide">
                                Full Stack Web Developer & SaaS Builder
                            </span>
                        </motion.h1>

                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto pt-4">
                            Expert in <span className="text-cyan-400 font-semibold">React, TypeScript, Node.js</span> — Building modern web applications, SaaS platforms, and e-commerce solutions that drive business growth
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
                            Hire me
                        </motion.a>
                    </div>
                </div>
            </div>
            
            {/* --- Scroll Down Visual Cue (NEW) --- */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
                initial={{ y: 0, opacity: 0 }}
                // Simple bounce animation: moves down 10px, fades in and then out
                animate={{ y: [0, 10, 0], opacity: [0, 1, 1, 0] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2 // Wait for the main content to load
                }}
            >
                <ArrowDown size={32} className="text-cyan-400 drop-shadow-xl" />
            </motion.div>
        </section>
    );
}

export default Hero;