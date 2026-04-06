"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";
import type { TelemetryLog } from "@/lib/supabase";

interface EnergyChartProps {
  data: TelemetryLog[];
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-2xl border border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <p className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider relative z-10">
        {label}
      </p>
      {payload.map((entry: TooltipPayloadItem, i: number) => (
        <div key={i} className="flex items-center gap-2 relative z-10">
          <div
            className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: "#67e8f9", color: "#67e8f9" }}
          />
          <span className="text-sm font-bold text-white tracking-tight">
            {entry.value.toFixed(1)}W
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EnergyChart({ data }: EnergyChartProps) {
  const chartData = data.slice(-30).map((log) => ({
    time: formatTime(log.created_at),
    wattage: log.wattage,
    price: log.unit_price,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bento-card p-6 h-full flex flex-col relative overflow-hidden"
    >
      {/* Subtle ambient glow behind the chart */}
      <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[100%] bg-gradient-to-bl from-[rgba(6,182,212,0.1)] to-transparent rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl primary-gradient-bg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Activity className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Energy Consumption
            </h3>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-tertiary)] mt-0.5">
              Live Network Telemetry
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[var(--color-mint-light)] shadow-[0_0_8px_var(--color-mint-light)] animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--color-mint-light)] tracking-widest uppercase">
            Syncing
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[260px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}W`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="wattage"
              stroke="#67e8f9"
              strokeWidth={3}
              fill="url(#neonGradient)"
              dot={false}
              activeDot={{
                r: 6,
                stroke: "#67e8f9",
                strokeWidth: 2,
                fill: "#030712",
                style: { filter: "drop-shadow(0 0 8px #67e8f9)" }
              }}
              style={{ filter: "url(#glow)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
