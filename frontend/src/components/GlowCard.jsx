import React, { useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function GlowCard({ 
  children, 
  className = "", 
  spotlightColor,
  onClick
}) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { currentTheme } = useTheme();

  const defaultSpotlight = () => {
    switch (currentTheme) {
      case "nebula": return "rgba(139, 92, 246, 0.18)";
      case "solaris": return "rgba(245, 158, 11, 0.18)";
      case "monolith": return "rgba(255, 255, 255, 0.12)";
      default: return "rgba(16, 185, 129, 0.18)";
    }
  };

  const activeSpotlight = spotlightColor || defaultSpotlight();

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`glass-card rounded-2xl relative overflow-hidden group ${className}`}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"
        style={{
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${activeSpotlight}, transparent 70%)`,
        }}
      />

      {/* Subtle Top Edge Refraction Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card Content Container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
