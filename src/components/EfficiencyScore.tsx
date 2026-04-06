"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

interface EfficiencyScoreProps {
  score: number; // 0-100
}

export default function EfficiencyScore({ score }: EfficiencyScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = () => {
    if (clampedScore >= 80) return { stroke: "#06b6d4", bg: "rgba(6,182,212,0.15)", border: "rgba(6,182,212,0.3)", label: "Excellent" };
    if (clampedScore >= 60) return { stroke: "#10b981", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", label: "Good" };
    if (clampedScore >= 40) return { stroke: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", label: "Fair" };
    return { stroke: "#f43f5e", bg: "rgba(244,63,94,0.15)", border: "rgba(244,63,94,0.3)", label: "Poor" };
  };

  const color = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bento-card p-6 flex flex-col items-center h-full relative"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[120px] h-[120px] rounded-full blur-[40px]" style={{ backgroundColor: color.stroke, opacity: 0.15 }} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 self-start">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white drop-shadow-md" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight uppercase">
            Green Score
          </h3>
          <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-widest mt-0.5">
            Efficiency Rating
          </p>
        </div>
      </div>

      {/* Radial Progress */}
      <div className="relative w-[148px] h-[148px] mt-2">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 140 140"
        >
          {/* Background track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ filter: `drop-shadow(0 0 10px ${color.stroke})` }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
          >
            {clampedScore}
          </motion.span>
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
        style={{ backgroundColor: color.bg, color: color.stroke, borderColor: color.border, boxShadow: `0 0 15px ${color.bg}` }}
      >
        {color.label}
      </motion.div>
    </motion.div>
  );
}
