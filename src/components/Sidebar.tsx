"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Zap,
  Bot,
  BarChart3,
  Settings,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Zap, label: "Devices", href: "/devices" },
  { icon: Bot, label: "AI Agent", href: "/ai-agent" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? 240 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 h-screen z-50 hidden lg:flex flex-col glass border-r border-white/20"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl primary-gradient-bg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_var(--color-mint-bg)]">
            <Leaf className="w-4 h-4 text-white drop-shadow-md" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">
                  Eco-Sync
                </span>
                <span className="text-[10px] font-bold primary-gradient-text tracking-[0.2em] uppercase">
                  AI Platform
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden
                  ${
                    isActive
                      ? "text-white bg-[rgba(255,255,255,0.03)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-white"
                  }
                `}
              >
                {isActive && (
                   <motion.div
                     layoutId="activeGlow"
                     className="absolute inset-0 bg-gradient-to-r from-[var(--color-mint-bg)] to-transparent opacity-50"
                   />
                )}
                {isActive && (
                   <motion.div
                     layoutId="activeBar"
                     className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-[var(--color-mint-light)] shadow-[0_0_12px_var(--color-mint)]"
                   />
                )}
                
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 relative z-10 transition-colors duration-300 ${
                    isActive
                      ? "text-[var(--color-mint-light)] drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]"
                      : "text-[var(--color-text-tertiary)]"
                  }`}
                />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all duration-200"
          >
            {expanded ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-strong border-t border-[var(--color-border)]">
        <nav className="flex items-center justify-around px-2 py-2 relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all ${
                  isActive
                    ? "text-[var(--color-mint-light)] drop-shadow-[0_0_5px_rgba(103,232,249,0.5)]"
                    : "text-[var(--color-text-tertiary)]"
                }`}
              >
                {isActive && (
                   <motion.div
                     layoutId="mobileActiveBar"
                     className="absolute top-0 w-8 h-0.5 rounded-b-full bg-[var(--color-mint-light)] shadow-[0_2px_8px_var(--color-mint)]"
                   />
                )}
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
