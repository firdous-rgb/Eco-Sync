"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { IndianRupee, TrendingUp, Sparkles } from "lucide-react";

interface SavingsWidgetProps {
  totalSaved: number;
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v * 100) / 100);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => setDisplayed(Math.round(v * 100) / 100),
    });
    return controls.stop;
  }, [value, motionVal]);

  // suppress unused var
  void rounded;

  return (
    <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
      {displayed.toFixed(2)}
    </span>
  );
}

export default function SavingsWidget({ totalSaved }: SavingsWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bento-card p-6 relative overflow-hidden h-full flex flex-col justify-center"
    >
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,transparent_100%)] rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1)_0%,transparent_100%)] rounded-full blur-xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl primary-gradient-bg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Savings Today
            </span>
          </div>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-4 h-4 text-[var(--color-mint-light)] drop-shadow-[0_0_5px_var(--color-mint-light)]" />
          </motion.div>
        </div>

        {/* Amount */}
        <div className="flex items-baseline gap-1 mt-6 mb-4">
          <span className="text-2xl font-bold text-[var(--color-mint-light)] drop-shadow-[0_0_8px_var(--color-mint)]">
            ₹
          </span>
          <AnimatedCounter value={totalSaved} />
        </div>

        {/* Change indicator */}
        <div className="flex items-center gap-1.5 bg-[rgba(6,182,212,0.15)] rounded-lg px-3 py-2 w-fit border border-[rgba(6,182,212,0.3)]">
          <TrendingUp className="w-4 h-4 text-[var(--color-mint-light)] drop-shadow-[0_0_5px_var(--color-mint-light)]" />
          <span className="text-xs font-bold tracking-widest uppercase text-[var(--color-mint-light)]">
            AI-optimized
          </span>
        </div>
      </div>
    </motion.div>
  );
}
