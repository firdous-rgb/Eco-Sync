"use client";

import { motion } from "framer-motion";
import { Zap, Power, Gauge, IndianRupee } from "lucide-react";

interface Stat {
  label: string;
  value: string;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  shadow: string;
}

interface StatsBarProps {
  totalWattage: number;
  activeDevices: number;
  totalDevices: number;
  currentPrice: number;
  avgVoltage: number;
}

export default function StatsBar({
  totalWattage,
  activeDevices,
  totalDevices,
  currentPrice,
  avgVoltage,
}: StatsBarProps) {
  const stats: Stat[] = [
    {
      label: "Total Load",
      value: totalWattage.toLocaleString(),
      unit: "W",
      icon: Zap,
      color: "text-[var(--color-mint-light)]",
      bg: "bg-[var(--color-mint-bg)]",
      shadow: "shadow-[0_0_15px_var(--color-mint-bg)]",
    },
    {
      label: "Active Devices",
      value: `${activeDevices}/${totalDevices}`,
      unit: "",
      icon: Power,
      color: "text-blue-400",
      bg: "bg-[rgba(59,130,246,0.15)]",
      shadow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    },
    {
      label: "Unit Price",
      value: `₹${currentPrice.toFixed(1)}`,
      unit: "/kWh",
      icon: IndianRupee,
      color: currentPrice > 10 ? "text-[var(--color-danger)]" : "text-amber-400",
      bg: currentPrice > 10 ? "bg-[var(--color-danger-bg)]" : "bg-[rgba(251,191,36,0.15)]",
      shadow: currentPrice > 10 ? "shadow-[0_0_15px_var(--color-danger-bg)]" : "shadow-[0_0_15px_rgba(251,191,36,0.15)]",
    },
    {
      label: "Avg Voltage",
      value: avgVoltage.toFixed(0),
      unit: "V",
      icon: Gauge,
      color: "text-purple-400",
      bg: "bg-[rgba(139,92,246,0.15)]",
      shadow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="bento-card px-5 py-5 flex items-center gap-4 relative overflow-hidden group"
        >
          {/* Subtle gradient flash on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div
            className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.shadow} flex items-center justify-center flex-shrink-0 z-10`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color} drop-shadow-md`} />
          </div>
          <div className="min-w-0 z-10">
            <p className="text-xs text-[var(--color-text-secondary)] font-medium mb-1 tracking-wide uppercase">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold tracking-tight ${stat.color}`}>
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
                  {stat.unit}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
