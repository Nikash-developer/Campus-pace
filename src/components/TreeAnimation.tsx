import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const LeafShape = ({ delay, x, y, rotate, scale = 1, color = "#22C55E" }: { delay: number; x: number; y: number; rotate: number; scale?: number; color?: string }) => (
    <motion.path
        d="M10 0 C10 0 20 10 10 20 C0 10 10 0 10 0"
        fill={color}
        initial={{ scale: 0, opacity: 0, rotate }}
        animate={{ scale, opacity: 1, rotate }}
        transition={{
            type: "spring",
            stiffness: 100,
            delay,
            opacity: { duration: 0.5, delay }
        }}
        style={{ originX: "10px", originY: "20px", x: x - 10, y: y - 20 }}
        whileHover={{ scale: scale * 1.3, fill: "#4ADE80", filter: "drop-shadow(0 0 12px rgba(34, 197, 94, 0.6))" }}
    />
);

const FallingLeaf = () => {
    const startX = useMemo(() => Math.random() * 200, []);
    const duration = useMemo(() => 8 + Math.random() * 7, []);
    const delay = useMemo(() => Math.random() * 15, []);
    const drift = useMemo(() => (Math.random() - 0.5) * 60, []);

    return (
        <motion.path
            d="M5 0 C5 0 10 5 5 10 C0 5 5 0 5 0"
            fill="#22C55E"
            initial={{ x: startX, y: -20, opacity: 0, rotate: 0 }}
            animate={{
                y: 220,
                x: startX + drift,
                rotate: 720,
                opacity: [0, 0.6, 0.6, 0]
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    );
};

export default function TreeAnimation({ onComplete }: { onComplete?: () => void }) {
    const [isHovered, setIsHovered] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onComplete?.();
        }, 4200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Enhanced Background Depth */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{
                        scale: isHovered ? [1, 1.25, 1] : [1, 1.1, 1],
                        opacity: isHovered ? [0.2, 0.35, 0.2] : [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px]"
                />
                {/* Darker overlays to anchor the tree and make text pop */}
                <div className="absolute inset-0 bg-[#111827]/30 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent pointer-events-none" />
            </div>

            <svg
                viewBox="0 0 200 200"
                className="w-full h-full p-12 drop-shadow-[0_0_35px_rgba(34,197,94,0.2)] filter saturate-[1.3] brightness-[1.05]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Falling Leaves Background Layer */}
                {[...Array(8)].map((_, i) => (
                    <FallingLeaf key={i} />
                ))}

                {/* Tree Group for swaying */}
                <motion.g
                    animate={{ rotate: isHovered ? [0, 1.5, -1.5, 0] : [0, 0.6, -0.6, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originX: "100px", originY: "160px" }}
                >
                    {/* Main Trunk - Higher quality wood color */}
                    <motion.path
                        d="M100 160 Q105 120 100 60"
                        stroke="#5D4037"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.8, ease: "easeInOut", delay: 0.5 }}
                    />

                    {/* Branches Left */}
                    <motion.path
                        d="M102 120 Q80 110 65 90"
                        stroke="#5D4037"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 1.2 }}
                    />
                    <motion.path
                        d="M100 80 Q85 70 75 50"
                        stroke="#5D4037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 1.8 }}
                    />

                    {/* Branches Right */}
                    <motion.path
                        d="M98 100 Q120 90 135 70"
                        stroke="#5D4037"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 1.5 }}
                    />
                    <motion.path
                        d="M100 70 Q115 60 125 40"
                        stroke="#5D4037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 2.1 }}
                    />

                    {/* Top Branch */}
                    <motion.path
                        d="M100 60 Q105 40 100 20"
                        stroke="#5D4037"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: "easeInOut", delay: 2.2 }}
                    />

                    {/* Leaves - Mixed greens for depth */}
                    <LeafShape delay={2.0} x={65} y={90} rotate={-45} color="#22C55E" />
                    <LeafShape delay={2.2} x={55} y={95} rotate={-60} scale={0.7} color="#4ADE80" />
                    <LeafShape delay={2.5} x={75} y={50} rotate={-30} color="#22C55E" />
                    <LeafShape delay={2.7} x={65} y={55} rotate={-50} scale={0.8} color="#16A34A" />
                    <LeafShape delay={2.3} x={135} y={70} rotate={45} color="#22C55E" />
                    <LeafShape delay={2.5} x={145} y={95} rotate={60} scale={0.7} color="#4ADE80" />
                    <LeafShape delay={2.8} x={125} y={40} rotate={30} color="#22C55E" />
                    <LeafShape delay={3.0} x={135} y={45} rotate={50} scale={0.8} color="#16A34A" />
                    <LeafShape delay={2.9} x={100} y={20} rotate={0} color="#22C55E" />
                    <LeafShape delay={3.1} x={110} y={15} rotate={20} scale={0.8} color="#4ADE80" />
                    <LeafShape delay={3.2} x={90} y={15} rotate={-20} scale={0.8} color="#16A34A" />
                    <LeafShape delay={3.5} x={85} y={85} rotate={-20} scale={0.6} color="#4ADE80" />
                    <LeafShape delay={3.6} x={115} y={65} rotate={20} scale={0.6} color="#22C55E" />
                    <LeafShape delay={3.7} x={105} y={100} rotate={10} scale={0.5} color="#16A34A" />
                </motion.g>

                {/* Hover Sparkles */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {[...Array(12)].map((_, i) => (
                                <motion.circle
                                    key={i}
                                    cx={100 + (Math.random() - 0.5) * 120}
                                    cy={80 + (Math.random() - 0.5) * 120}
                                    r={Math.random() * 2 + 0.5}
                                    fill="#4ADE80"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.5, 0],
                                        y: [0, -40]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.1
                                    }}
                                />
                            ))}
                        </motion.g>
                    )}
                </AnimatePresence>
            </svg>

            {/* Subtle Hint */}
            <motion.div
                animate={{ opacity: isHovered ? 0 : 0.6 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-white uppercase tracking-[0.4em] font-black pointer-events-none"
            >
                Hover to interact
            </motion.div>
        </div>
    );
}
