"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, BrainCircuit, Zap, ArrowDown } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AIAction } from "@/lib/supabase";

interface AILogFeedProps {
  actions?: AIAction[];
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AILogFeed({ actions: initialActions }: AILogFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<AIAction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // 1. Fetch initial data from ai_actions
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("ai_actions")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(20);

      if (data && !error) {
        setLogs(data.reverse());
      }
      setIsLoaded(true);
    };

    fetchLogs();

    // 4. Enable realtime subscription for new inserts
    const channel = supabase
      .channel("ai_actions_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ai_actions" },
        (payload) => {
          // Trigger thinking animation
          setIsThinking(true);
          
          // Delay showing actual log payload (simulate AI analyzing)
          setTimeout(() => {
            setIsThinking(false);
            setLogs((prev) => {
              const updated = [...prev, payload.new as AIAction];
              return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
            });
          }, 1500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isThinking]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bento-card p-5 flex flex-col h-full relative"
    >
      {/* Decorative cyber grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03)_0%,transparent_100%)] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              AI Optimizer Feed
            </h3>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.2em] mt-0.5">
              Live Decision Log
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] px-2.5 py-1 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-pulse" />
          <span className="text-[9px] font-bold text-purple-400 tracking-widest">
            ACTIVE
          </span>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 max-h-[340px] pr-2 relative z-10 custom-scrollbar scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {isLoaded && logs.length === 0 && !isThinking ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="w-10 h-10 text-[var(--color-text-tertiary)] mb-3 opacity-50" />
              <p className="text-xs text-[var(--color-text-tertiary)] font-mono uppercase tracking-widest cursor-blink">
                Waiting for agent decisions...
              </p>
            </div>
          ) : (
            logs.map((action) => {
              const descLower = action.action_desc.toLowerCase();
              
              // Determine dynamic visual styles based on log content
              let styleClasses = "bg-black/30 border-white/5 shadow-inner";
              let iconColor = "text-purple-400 drop-shadow-[0_0_5px_#c084fc]";
              let iconBg = "bg-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.3)]";

              if (descLower.includes("high electricity price") || descLower.includes("peak load")) {
                styleClasses = "bg-[rgba(244,63,94,0.05)] border-[var(--color-danger)] shadow-[0_0_15px_rgba(244,63,94,0.15)]";
                iconColor = "text-[var(--color-danger-light)] drop-shadow-[0_0_5px_var(--color-danger)]";
                iconBg = "bg-[rgba(244,63,94,0.15)] border-[rgba(244,63,94,0.3)]";
              } else if (descLower.includes("price normalized")) {
                styleClasses = "bg-[rgba(16,185,129,0.05)] border-[var(--color-mint-deep)] shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                iconColor = "text-[var(--color-mint-light)] drop-shadow-[0_0_5px_var(--color-mint)]";
                iconBg = "bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.3)]";
              }

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto", marginBottom: 12 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className={`rounded-xl px-4 py-3.5 border ${styleClasses}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${iconBg}`}>
                      <Bot className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-50 leading-relaxed font-mono">
                        {action.action_desc}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">
                          [{formatTimestamp(action.timestamp)}]
                        </span>
                        {action.money_saved > 0 && (
                          <span className="text-[10px] font-bold text-[var(--color-mint-light)] flex items-center gap-1 bg-[var(--color-mint-bg)] px-1.5 py-0.5 rounded border border-[rgba(103,232,249,0.3)]">
                            <Zap className="w-3 h-3" />
                            ₹{action.money_saved.toFixed(2)} SVG
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Dynamic Typing indicator */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="flex items-center gap-3 px-4 py-2 mt-2"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`dot-${i}`}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                    className="w-1.5 h-1.5 rounded-sm bg-purple-500 shadow-[0_0_8px_#a855f7]"
                  />
                ))}
              </div>
              <span className="text-[10px] text-purple-400 uppercase tracking-widest font-mono cursor-blink">
                AI analyzing...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auto-scroll indicator */}
      <div className="pt-3 border-t border-white/10 mt-3 relative z-10">
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">
          <ArrowDown className="w-3 h-3 animate-bounce" />
          <span>Live Sync Active</span>
        </div>
      </div>
    </motion.div>
  );
}
