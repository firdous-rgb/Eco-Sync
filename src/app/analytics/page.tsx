"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Zap, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TelemetryRow {
  id: string;
  device_id: string;
  wattage: number;
  voltage: number;
  unit_price: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const [telemetry, setTelemetry] = useState<TelemetryRow[]>([]);
  const [chartData, setChartData] = useState<{ time: string; wattage: number; price: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("telemetry_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) {
        setTelemetry(data);

        // Group by timestamp (rounded to nearest 10s) and sum wattage
        const grouped = new Map<string, { wattage: number; price: number; count: number }>();
        for (const row of data) {
          const time = new Date(row.created_at).toLocaleTimeString();
          const existing = grouped.get(time) || { wattage: 0, price: 0, count: 0 };
          existing.wattage += row.wattage;
          existing.price = row.unit_price;
          existing.count += 1;
          grouped.set(time, existing);
        }

        const chart = Array.from(grouped.entries())
          .map(([time, val]) => ({
            time,
            wattage: Math.round(val.wattage),
            price: val.price,
          }))
          .reverse();

        setChartData(chart);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const avgWattage = telemetry.length > 0
    ? (telemetry.reduce((s, t) => s + t.wattage, 0) / telemetry.length).toFixed(0)
    : "0";
  const avgPrice = telemetry.length > 0
    ? (telemetry.reduce((s, t) => s + t.unit_price, 0) / telemetry.length).toFixed(1)
    : "0";
  const peakWattage = telemetry.length > 0
    ? Math.max(...telemetry.map((t) => t.wattage)).toFixed(0)
    : "0";

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Energy consumption insights and trends
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">Avg Wattage</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{avgWattage}W</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bento-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">Peak Load</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{peakWattage}W</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bento-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-mint-bg)] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[var(--color-mint-deep)]" />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">Avg Unit Price</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">₹{avgPrice}/kWh</p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="bento-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[var(--color-mint-deep)]" />
          <h2 className="font-semibold text-[var(--color-text-primary)]">Consumption Over Time</h2>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wattGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-mint)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-mint)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--color-text-tertiary)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-tertiary)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="wattage"
                stroke="var(--color-mint-deep)"
                strokeWidth={2}
                fill="url(#wattGradient)"
                name="Total Wattage (W)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Telemetry Table */}
      <div className="bento-card p-5">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">Recent Readings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--color-text-tertiary)] border-b border-[var(--color-border)]">
                <th className="text-left py-2 font-medium">Time</th>
                <th className="text-right py-2 font-medium">Wattage</th>
                <th className="text-right py-2 font-medium">Voltage</th>
                <th className="text-right py-2 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {telemetry.slice(0, 15).map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 text-[var(--color-text-secondary)]">
                    {new Date(row.created_at).toLocaleTimeString()}
                  </td>
                  <td className="py-2 text-right font-medium text-[var(--color-text-primary)]">
                    {row.wattage.toFixed(1)}W
                  </td>
                  <td className="py-2 text-right text-[var(--color-text-secondary)]">
                    {row.voltage.toFixed(1)}V
                  </td>
                  <td className={`py-2 text-right font-medium ${
                    row.unit_price > 10 ? "text-red-500" : "text-[var(--color-mint-deep)]"
                  }`}>
                    ₹{row.unit_price.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
