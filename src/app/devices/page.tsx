"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Power, Thermometer, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Device {
  id: string;
  name: string;
  category: string;
  base_consumption: number;
  current_draw: number;
  status: boolean;
  is_eco_mode: boolean;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchDevices = async () => {
      const { data } = await supabase.from("devices").select("*");
      if (data) setDevices(data);
    };
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = async (device: Device) => {
    const newStatus = !device.status;
    await supabase
      .from("devices")
      .update({ status: newStatus, is_eco_mode: false })
      .eq("id", device.id);
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id ? { ...d, status: newStatus, is_eco_mode: false } : d
      )
    );
  };

  const getDeviceIcon = (name: string) => {
    switch (name) {
      case "Air Conditioner": return <Thermometer className="w-6 h-6" />;
      case "EV Charger": return <Zap className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Devices</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage and monitor all your smart home devices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {devices.map((device, i) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bento-card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  device.status
                    ? "bg-[var(--color-mint-bg)] text-[var(--color-mint-deep)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-tertiary)]"
                }`}>
                  {getDeviceIcon(device.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">{device.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    device.category === "High-Load"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {device.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleDevice(device)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  device.status
                    ? "bg-[var(--color-mint)] text-white shadow-lg shadow-[var(--color-mint)]/30"
                    : "bg-[var(--color-surface)] text-[var(--color-text-tertiary)] hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Power className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)]">Current Draw</span>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                  {device.status ? `${device.current_draw?.toFixed(1) || 0}W` : "OFF"}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-[var(--color-surface)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: device.status
                      ? `${Math.min(100, ((device.current_draw || 0) / device.base_consumption) * 50)}%`
                      : "0%",
                  }}
                  className={`h-full rounded-full ${
                    device.is_eco_mode
                      ? "bg-gradient-to-r from-orange-400 to-orange-500"
                      : "bg-gradient-to-r from-[var(--color-mint)] to-[var(--color-mint-deep)]"
                  }`}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-[var(--color-text-tertiary)]">
                <span>Base: {device.base_consumption}W</span>
                {device.is_eco_mode && (
                  <span className="text-orange-500 font-medium">🌿 Eco Mode</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
