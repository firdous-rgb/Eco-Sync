"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Device, TelemetryLog, AIAction } from "@/lib/supabase";
import StatsBar from "@/components/StatsBar";
import DeviceCard from "@/components/DeviceCard";
import EnergyChart from "@/components/EnergyChart";
import SavingsWidget from "@/components/SavingsWidget";
import EfficiencyScore from "@/components/EfficiencyScore";
import AILogFeed from "@/components/AILogFeed";
import { RefreshCw, Clock } from "lucide-react";

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryLog[]>([]);
  const [aiActions, setAIActions] = useState<AIAction[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const fetchPromise = Promise.all([
        supabase.from("devices").select("*"),
        supabase
          .from("telemetry_logs")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(100),
        supabase
          .from("ai_actions")
          .select("*")
          .order("timestamp", { ascending: true })
          .limit(50),
      ]);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Supabase request timed out after 5 seconds")), 5000)
      );

      const [devicesRes, telemetryRes, actionsRes] = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as any;

      if (devicesRes?.data) setDevices(devicesRes.data);
      if (telemetryRes?.data) setTelemetry(telemetryRes.data);
      if (actionsRes?.data) setAIActions(actionsRes.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscriptions
  useEffect(() => {
  const channel = supabase
    .channel("dashboard-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "devices" },
      (payload) => {
        if (payload.eventType === "UPDATE") {
          setDevices((prev) =>
            prev.map((d) =>
              d.id === (payload.new as Device).id
                ? (payload.new as Device)
                : d
            )
          );
        } else if (payload.eventType === "INSERT") {
          setDevices((prev) => [...prev, payload.new as Device]);
        }

        setLastUpdate(new Date());
      }
    )
    .subscribe();

  const interval = setInterval(fetchData, 15000);

  return () => {
    supabase.removeChannel(channel);
    clearInterval(interval);
  };
}, [fetchData]);
        

  // Computed values
  const totalWattage = devices
    .filter((d) => d.status)
    .reduce((sum, d) => sum + d.current_draw, 0);
  const activeDevices = devices.filter((d) => d.status).length;
  const latestTelemetry = telemetry[telemetry.length - 1];
  const currentPrice = latestTelemetry?.unit_price || 0;
  const avgVoltage = latestTelemetry?.voltage || 220;
  const totalSaved = aiActions.reduce((sum, a) => sum + a.money_saved, 0);

  // Efficiency score: based on eco-mode devices and load ratio
  const ecoDevices = devices.filter((d) => d.is_eco_mode).length;
  const highLoadOff = devices.filter(
    (d) => d.category === "High-Load" && !d.status
  ).length;
  const efficiencyScore = Math.min(
    100,
    Math.round(
      40 +
        (ecoDevices / Math.max(devices.length, 1)) * 30 +
        (highLoadOff / Math.max(devices.filter((d) => d.category === "High-Load").length, 1)) * 30
    )
  );

  // Anomaly detection: wattage > 1.5x base_consumption
  const anomalyDeviceIds = new Set(
    devices
      .filter((d) => d.current_draw > d.base_consumption * 1.5)
      .map((d) => d.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-[var(--color-mint)]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-8 lg:pb-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-[var(--color-mint-deep)] mt-0.5">
            Simulated AI Energy Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 text-[var(--color-text-tertiary)]">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">
            Updated{" "}
            {lastUpdate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <button
            onClick={fetchData}
            className="ml-2 p-1.5 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="mb-5">
        <StatsBar
          totalWattage={totalWattage}
          activeDevices={activeDevices}
          totalDevices={devices.length}
          currentPrice={currentPrice}
          avgVoltage={avgVoltage}
        />
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        {/* Energy Chart — spans 8 cols */}
        <div className="col-span-12 lg:col-span-8">
          <EnergyChart data={telemetry} />
        </div>

        {/* Savings + Efficiency — spans 4 cols */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <SavingsWidget totalSaved={totalSaved} />
          <EfficiencyScore score={efficiencyScore} />
        </div>

        {/* Device Cards — 5 cards across grid */}
        {devices.map((device, i) => (
          <div
            key={device.id}
            className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3"
          >
            <DeviceCard
              device={device}
              isAnomaly={anomalyDeviceIds.has(device.id)}
              index={i}
            />
          </div>
        ))}

        {/* AI Log Feed — bottom full width on mobile, 6 cols on desktop */}
        <div className="col-span-12 lg:col-span-6">
          <AILogFeed actions={aiActions} />
        </div>

        {/* Price History Mini Chart */}
        <div className="col-span-12 lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bento-card p-6 h-full flex flex-col"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <span className="text-amber-400 text-lg font-bold drop-shadow-md">₹</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Price Monitor
                </h3>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-widest mt-0.5">
                  Live Unit Pricing
                </p>
              </div>
            </div>

            <div className="space-y-3.5 flex-1 mt-2">
              {telemetry.slice(-8).map((log, i) => {
                const isHigh = log.unit_price > 10;
                return (
                  <motion.div
                    key={log.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] group-hover:text-white transition-colors">
                      {new Date(log.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex-1 mx-4 h-1 rounded-full bg-white/5 overflow-hidden relative border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (log.unit_price / 15) * 100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className={`h-full rounded-full relative ${
                          isHigh
                            ? "bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_8px_rgba(225,29,72,0.8)]"
                            : "bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                        }`}
                      >
                         <div className="absolute inset-0 bg-white/20" />
                      </motion.div>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono min-w-[50px] text-right ${
                        isHigh
                          ? "text-[var(--color-danger)] drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]"
                          : "text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]"
                      }`}
                    >
                      ₹{log.unit_price.toFixed(1)}
                    </span>
                  </motion.div>
                );
              })}

              {telemetry.length === 0 && (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-t-2 border-[var(--color-mint)] animate-spin mb-3 opacity-50" />
                  <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono uppercase tracking-widest cursor-blink">
                    Awaiting Market Data
                  </p>
                </div>
              )}
            </div>

            {currentPrice > 10 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-[rgba(244,63,94,0.15)] border border-[rgba(244,63,94,0.3)] shadow-[0_0_15px_rgba(244,63,94,0.2)] rounded-xl px-4 py-3 flex items-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(244,63,94,0.2)_0%,transparent_100%)] pointer-events-none" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse z-10" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-danger-light)] drop-shadow-[0_0_5px_var(--color-danger)] z-10">
                  Peak pricing — Optimizing loads
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
