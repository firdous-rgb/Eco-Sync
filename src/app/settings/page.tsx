"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, Info } from "lucide-react";

const settingsSections = [
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure alerts for anomaly detection and price spikes",
    options: [
      { label: "Price spike alerts", enabled: true },
      { label: "Anomaly detection alerts", enabled: true },
      { label: "Daily summary email", enabled: false },
    ],
  },
  {
    icon: Shield,
    title: "AI Agent Preferences",
    description: "Control how the optimizer manages your devices",
    options: [
      { label: "Auto-toggle high-load devices", enabled: true },
      { label: "Price threshold: ₹10/kWh", enabled: true },
      { label: "Protect essential devices", enabled: true },
    ],
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize the dashboard look and feel",
    options: [
      { label: "Dark mode", enabled: false },
      { label: "Compact view", enabled: false },
      { label: "Show animations", enabled: true },
    ],
  },
  {
    icon: Database,
    title: "Data & Privacy",
    description: "Manage your telemetry data and retention",
    options: [
      { label: "Store telemetry logs", enabled: true },
      { label: "Share anonymized usage data", enabled: false },
      { label: "Auto-cleanup logs (30 days)", enabled: true },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Configure your Eco-Sync AI platform preferences
        </p>
      </div>

      <div className="space-y-5 max-w-3xl">
        {settingsSections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bento-card p-5"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-mint-bg)] flex items-center justify-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-[var(--color-mint-deep)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{section.title}</h3>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{section.description}</p>
              </div>
            </div>

            <div className="space-y-3 pl-14">
              {section.options.map((opt) => (
                <div key={opt.label} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">{opt.label}</span>
                  <div
                    className={`w-10 h-[22px] rounded-full relative cursor-pointer transition-colors duration-200 ${
                      opt.enabled
                        ? "bg-[var(--color-mint-deep)]"
                        : "bg-[var(--color-border)]"
                    }`}
                  >
                    <div
                      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        opt.enabled ? "translate-x-[22px]" : "translate-x-[3px]"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bento-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text-primary)]">Eco-Sync AI v1.0</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Smart Home Energy Management Platform · Built with Next.js + Supabase
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
