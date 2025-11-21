import { useState, useEffect, useRef, FC } from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FloatingAvatar Component
 *
 * An interactive floating avatar that:
 * - Stays fixed at the bottom-right of the screen
 * - Moves away (repels) when the mouse gets close
 * - Returns smoothly to its original position when mouse moves far
 * - Has reactive eyes that follow the cursor
 * - Has a subtle idle floating animation
 * - Clickable to open AI chat
 * - Optimized for performance using requestAnimationFrame
 */

interface FloatingAvatarProps {
    onClick?: () => void;
}

const FloatingAvatar: FC<FloatingAvatarProps> = ({ onClick }) => {
    // State for avatar position offset (repel effect)
    const [position, setPosition] = useState({ x: 0, y: 0 });
    // State for eye rotation (eye-tracking effect)
    const [eyeAngle, setEyeAngle] = useState(0);
    const avatarRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Configuration constants
    const REPEL_DISTANCE = 150; // Distance in pixels when repel effect starts
    const REPEL_STRENGTH = 0.8; // Strength of the repel effect (0-1)
    const RETURN_SPEED = 0.15; // Speed of return to original position (0-1, higher = faster)

    // ✅ P0 FIX: Detect mobile and disable animations completely
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // ✅ P0 FIX: Skip all animations and mouse tracking on mobile for better performance
        if (isMobile) {
            return; // Exit early - no animations on mobile
        }

        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;

        /**
         * Calculate the repel effect and eye tracking based on mouse position
         * Uses distance formula and inverse square law for natural movement
         */
        const handleMouseMove = (e: MouseEvent) => {
            if (!avatarRef.current) return;

            // Get avatar's center position on screen
            const rect = avatarRef.current.getBoundingClientRect();
            const avatarCenterX = rect.left + rect.width / 2;
            const avatarCenterY = rect.top + rect.height / 2;

            // Calculate distance from cursor to avatar center
            const deltaX = e.clientX - avatarCenterX;
            const deltaY = e.clientY - avatarCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Calculate eye angle (eyes follow cursor)
            const angleRad = Math.atan2(deltaY, deltaX);
            setEyeAngle(angleRad * (180 / Math.PI) + 90); // Convert to degrees with offset

            // If mouse is within repel distance, calculate repel offset
            if (distance < REPEL_DISTANCE) {
                // Calculate repel strength (stronger when closer)
                const repelFactor = (1 - distance / REPEL_DISTANCE) * REPEL_STRENGTH;

                // Calculate angle from cursor to avatar
                const angle = Math.atan2(deltaY, deltaX);

                // Calculate repel offset (move away from cursor)
                // Negative because we want to move AWAY from the cursor
                targetX = -Math.cos(angle) * REPEL_DISTANCE * repelFactor;
                targetY = -Math.sin(angle) * REPEL_DISTANCE * repelFactor;
            } else {
                // When mouse is far, return to original position
                targetX = 0;
                targetY = 0;
            }
        };

        /**
         * Smooth animation loop using requestAnimationFrame
         * Provides 60fps smooth motion with easing
         */
        const animate = () => {
            // Lerp (Linear Interpolation) for smooth easing
            currentX += (targetX - currentX) * RETURN_SPEED;
            currentY += (targetY - currentY) * RETURN_SPEED;

            // Only update state if there's significant movement (performance optimization)
            if (Math.abs(currentX - position.x) > 0.1 || Math.abs(currentY - position.y) > 0.1) {
                setPosition({ x: currentX, y: currentY });
            }

            // Continue animation loop
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Start event listener and animation loop
        window.addEventListener('mousemove', handleMouseMove);
        animationFrameRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isMobile]); // ✅ P0 FIX: Re-run if mobile state changes

    // ✅ P0 FIX: Render static avatar on mobile (no animations)
    if (isMobile) {
        return (
            <div
                ref={avatarRef}
                onClick={onClick}
                className="fixed bottom-6 right-6 z-50 cursor-pointer select-none active:scale-95 transition-transform"
            >
                {/* Simple static avatar for mobile - no animations */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border-2 border-cyan-400/30 shadow-lg flex items-center justify-center">
                    {/* Bot Icon */}
                    <Bot
                        size={32}
                        className="text-cyan-400 drop-shadow-lg"
                        strokeWidth={2}
                    />
                    {/* Simple static pulse indicator */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                </div>
            </div>
        );
    }

    // ✅ Desktop: Full animated experience
    return (
        <motion.div
            ref={avatarRef}
            onClick={onClick}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 cursor-pointer select-none"
            style={{
                // Apply the repel offset using CSS transform for best performance
                transform: `translate(${position.x}px, ${position.y}px)`,
                willChange: 'transform', // Hint to browser for GPU acceleration
            }}
            // Idle floating animation (when not being repelled)
            animate={{
                y: [0, -10, 0], // Float up and down
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Avatar Container with background and glow effect */}
            <motion.div
                className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm border-2 border-cyan-400/30 shadow-lg flex items-center justify-center"
                // Subtle rotation animation
                animate={{
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                // Glow effect
                style={{
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)',
                }}
            >
                {/* Bot Icon (Background) */}
                <Bot
                    size={40}
                    className="text-slate-700/60 drop-shadow-lg md:w-12 md:h-12"
                    strokeWidth={1.5}
                />

                {/* Reactive Eye - Follows cursor */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ rotate: eyeAngle }}
                >
                    {/* Single Large Eye */}
                    <div
                        className="w-6 h-6 rounded-full bg-cyan-400 absolute left-[-0.75rem] top-[-2.4rem]"
                        style={{
                            boxShadow: '0 0 10px #22d3ee, 0 0 20px #22d3ee',
                            transform: 'translateY(-2px)'
                        }}
                    />
                </motion.div>

                {/* Animated pulse ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                />

                {/* Inner glow */}
                <div
                    className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl"
                />
            </motion.div>
        </motion.div>
    );
};

export default FloatingAvatar;
