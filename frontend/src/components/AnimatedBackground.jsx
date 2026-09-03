import React from "react";
import { motion } from "framer-motion";
export default function AnimatedBackground() {
  const glows = {
    orb1: "bg-blue-600/15",
    orb2: "bg-indigo-600/12",
    orb3: "bg-slate-700/12"
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[var(--bg-main)]">
      {/* 1. Subtle Architectural Stipple / Dot Grid Matrix */}
      <div className="absolute inset-0 dot-matrix opacity-40" />

      {/* 2. Soft Floating Ambient Gradient Orbs */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 40, 0],
          y: [0, 25, 0]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-32 -left-32 w-[600px] h-[600px] ${glows.orb1} rounded-full blur-[160px]`}
      />

      <motion.div 
        animate={{
          scale: [1.15, 1, 1.15],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -50, 0],
          y: [0, -35, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-1/3 -right-32 w-[650px] h-[650px] ${glows.orb2} rounded-full blur-[170px]`}
      />

      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, 30, 0],
          y: [0, -25, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -bottom-32 left-1/3 w-[550px] h-[550px] ${glows.orb3} rounded-full blur-[150px]`}
      />

      {/* 3. Refined Top Edge Light Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-80" />
    </div>
  );
}
