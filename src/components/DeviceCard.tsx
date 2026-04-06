"use client";

import { motion } from "framer-motion";
import {
  Thermometer,
  BatteryCharging,
  Lightbulb,
  Flame,
  Power,
  AlertTriangle,
  Leaf,
  Refrigerator,
} from "lucide-react";
import type { Device } from "@/lib/supabase";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  thermometer: Thermometer,
  "battery-charging": BatteryCharging,
  refrigerator: Refrigerator,
  lightbulb: Lightbulb,
  flame: Flame,
};

interface DeviceCardProps {
  device: Device;
  isAnomaly?: boolean;
  index?: number;
}

export default function DeviceCard({
  device,
  isAnomaly = false,
  index = 0,
}: DeviceCardProps) {
  const IconComponent = iconMap[device.icon] || Power;
  const isHighLoad = device.category === "High-Load";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={`bento-card p-5 relative overflow-hidden group ${
        isAnomaly ? "card-anomaly" : ""
      }`}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-mint-bg)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Anomaly Alert Banner */}
      {isAnomaly && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-semibold py-1.5 px-3 flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.6)] z-20"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Anomaly Detected — Check Device</span>
        </motion.div>
      )}

      <div className={`relative z-10 ${isAnomaly ? "mt-6" : ""}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              device.status
                ? isAnomaly
                  ? "bg-[var(--color-danger-bg)] shadow-[0_0_15px_var(--color-danger-bg)]"
                  : "primary-gradient-bg shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "bg-white/5 border border-white/10"
            }`}
          >
            <IconComponent
              className={`w-5 h-5 ${
                device.status
                  ? "text-white drop-shadow-md"
                  : "text-[var(--color-text-tertiary)]"
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            {device.is_eco_mode && (
              <span className="eco-badge flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                ECO
              </span>
            )}
            <div
              className={`status-dot ${device.status ? "active" : "inactive"}`}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mb-3">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">
            {device.name}
          </h3>
          <span
            className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md border ${
              isHighLoad
                ? "bg-[rgba(245,158,11,0.1)] text-amber-400 border-[rgba(245,158,11,0.2)] shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                : "bg-[rgba(59,130,246,0.1)] text-blue-400 border-[rgba(59,130,246,0.2)] shadow-[0_0_8px_rgba(59,130,246,0.1)]"
            }`}
          >
            {device.category}
          </span>
        </div>

        {/* Wattage */}
        <div className="flex items-baseline gap-1 mt-4">
          <span
            className={`text-3xl font-bold tracking-tight ${
              device.status 
                ? isAnomaly
                  ? "text-[var(--color-danger)]"
                  : "text-white"
                : "text-[var(--color-text-tertiary)]"
            }`}
          >
            {device.current_draw.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
            W
          </span>
        </div>

        {/* Status Bar */}
        <div className="mt-4 bg-white/5 rounded-full p-0.5">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
              Load
            </span>
            <span className="text-[10px] font-bold primary-gradient-text">
              {Math.min(
                Math.round((device.current_draw / (device.base_consumption * 1.5)) * 100),
                100
              )}
              %
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden relative border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(
                  (device.current_draw / (device.base_consumption * 1.5)) * 100,
                  100
                )}%`,
              }}
              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
              className={`h-full rounded-full relative ${
                !device.status 
                  ? "bg-transparent"
                  : isAnomaly
                    ? "bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                    : device.current_draw > device.base_consumption
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                    : "bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-mint-light)] shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              }`}
            >
               {device.status && !isAnomaly && (
                 <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-[1px] animate-pulse" />
               )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
