"use client";

import { useEffect, useState } from "react";
import { Bot, TrendingDown, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AILogFeed from "@/components/AILogFeed";

interface AIAction {
  id: string;
  action_desc: string;
  money_saved: number;
  timestamp: string;
}

export default function AIAgentPage() {
  const [actionsCount, setActionsCount] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    const fetchActions = async () => {
      const { data } = await supabase
        .from("ai_actions")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);
      if (data) {
        setActionsCount(data.length);
        setTotalSaved(data.reduce((sum: number, a: AIAction) => sum + (a.money_saved || 0), 0));
      }
    };

    fetchActions();
    const interval = setInterval(fetchActions, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">AI Agent</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Antigravity optimizer — real-time energy decisions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bento-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-mint-bg)] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[var(--color-mint-deep)]" />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Total Decisions</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{actionsCount}</p>
        </div>
        <div className="bento-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[rgba(6,182,212,0.15)] flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[var(--color-mint-light)] drop-shadow-[0_0_5px_var(--color-mint-light)]" />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Total Savings</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">₹{totalSaved.toFixed(2)}</p>
        </div>
        <div className="bento-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400 drop-shadow-[0_0_5px_#c084fc]" />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Status</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-pulse" />
            <span className="text-sm font-bold tracking-widest text-[var(--color-text-primary)] uppercase">Active Mode</span>
          </div>
        </div>
      </div>

      {/* Action Log */}
      <div className="h-[500px]">
        <AILogFeed />
      </div>
    </div>
  );
}
